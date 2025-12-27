import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateDeviceHash } from "@/lib/auth-security";

// Clase personalizada para errores de autenticación
class AuthError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.code = code;
    this.name = "AuthError";
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        username: { type: "text" },
        password: { type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.username || !credentials?.password) {
            throw new Error("Credenciales incompletas");
          }
          
          const user = await prisma.user.findUnique({ 
            where: { username: credentials.username as string },
            include: { licenses: { where: { isActive: true, endDate: { gt: new Date() } } } }
          });
          
          if (!user) {
            console.error("[AUTH] User not found:", credentials.username);
            throw new Error("Usuario o contraseña no válida");
          }
          
          // Requerir licencia activa sólo para usuarios normales; permitir ADMIN sin licencia
          if (user.role !== 'ADMIN' && user.licenses.length === 0) {
            console.error("[AUTH] No active license for user:", credentials.username);
            throw new Error("No tienes una licencia activa. Contacta al administrador.");
          }
          
          const valid = await bcrypt.compare(credentials.password as string, user.passwordHash);
          if (!valid) {
            console.error("[AUTH] Invalid password for user:", credentials.username);
            throw new Error("Usuario o contraseña no válida");
          }

          // Política de rotación de contraseña (365 días)
          const rotatedAt = user.passwordRotatedAt ?? user.createdAt;
          const rotationMs = 365 * 24 * 60 * 60 * 1000;
          const isExpired = Date.now() - new Date(rotatedAt).getTime() > rotationMs;
          if (isExpired && !user.mustChangePassword) {
            await prisma.user.update({
              where: { id: user.id },
              data: { mustChangePassword: true }
            }).catch(err => console.warn("[AUTH] Could not set mustChangePassword:", err));
            user.mustChangePassword = true;
          }
          
          // Verificar si hay un dispositivo activo (session lock reciente < 2 minutos)
          const lock = await prisma.sessionLock.findUnique({ where: { userId: user.id } });
          const timeSinceLastSeen = lock ? Date.now() - new Date(lock.lastSeen).getTime() : Infinity;
          const isLockActive = lock && timeSinceLastSeen < 120_000; // 2 minutos
          
          if (isLockActive) {
            // Si es un usuario normal (no ADMIN), rechazar el login
            if (user.role !== 'ADMIN') {
              console.error("[AUTH] Device already active for user:", credentials.username, "- last seen", Math.floor(timeSinceLastSeen / 1000), "seconds ago");
              // Lanzar error específico que será capturado por NextAuth
              throw new AuthError("Ya hay un dispositivo activo en esta cuenta. Cierra sesión en el otro dispositivo primero.", "DeviceAlreadyActive");
            }
            // Si es ADMIN, permitir sobrescribir y eliminar el lock previo
            console.warn("[AUTH] ADMIN override - removing existing session lock for:", credentials.username);
            await prisma.sessionLock.delete({ where: { userId: user.id } }).catch(err => {
              console.warn("[AUTH] Could not delete lock:", err);
            });
          } else if (lock && timeSinceLastSeen >= 120_000) {
            // Limpiar locks antiguos (más de 2 minutos sin actividad)
            console.log("[AUTH] Cleaning stale session lock for:", credentials.username);
            await prisma.sessionLock.delete({ where: { userId: user.id } }).catch(err => {
              console.warn("[AUTH] Could not delete stale lock:", err);
            });
          }
          
          // Limpiar intentos fallidos si login es exitoso
          if (user.failedLoginCount > 0 || user.isLocked) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                failedLoginCount: 0,
                isLocked: false,
                lockedUntil: null,
                lastFailedLoginAt: null
              }
            }).catch(err => {
              console.warn("[AUTH] Could not reset failed attempts:", err);
            });
          }
          
          // Crear nuevo session lock - siempre crear, no actualizar
          try {
            await prisma.sessionLock.create({
              data: { 
                userId: user.id, 
                sessionId: "temp",
                lastSeen: new Date(),
                deviceHash: generateDeviceHash()
              }
            });
          } catch (lockErr: any) {
            // Si el registro ya existe, actualizar
            if (lockErr?.code === 'P2002') {
              await prisma.sessionLock.update({
                where: { userId: user.id },
                data: { 
                  lastSeen: new Date(),
                  sessionId: "temp",
                  deviceHash: generateDeviceHash()
                }
              }).catch(err => {
                console.warn("[AUTH] Could not update lock:", err);
              });
            }
          }
          
          console.log("[AUTH] Login successful for user:", credentials.username);
          return { id: user.id, name: user.username, email: user.email, role: user.role, mustChangePassword: user.mustChangePassword } as any;
        } catch (error) {
          console.error("[AUTH] Authorization error:", error);
          // NextAuth capturará este error, intentamos pasar el mensaje si es posible
          if (error instanceof AuthError) {
            throw error;
          }
          throw error;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        (token as any).mustChangePassword = (user as any).mustChangePassword ?? false;
      }
      
      // Validar licencia en cada renovación del JWT
      if (token.id) {
        const userWithLicense = await prisma.user.findUnique({
          where: { id: token.id as string },
          include: { licenses: { where: { isActive: true, endDate: { gt: new Date() } }, take: 1 } }
        });
        
        // Si no tiene licencia válida, marcar token como inválido
        if (!userWithLicense || userWithLicense.licenses.length === 0) {
          (token as any).licenseValid = false;
          return token;
        }
        (token as any).licenseValid = true;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).mustChangePassword = (token as any).mustChangePassword ?? false;
        (session.user as any).licenseValid = (token as any).licenseValid ?? true;
      }
      return session;
    }
  },
  pages: { signIn: "/login" }
});