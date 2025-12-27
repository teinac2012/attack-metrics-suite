import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

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
          
          // Verificar si hay un dispositivo activo (session lock reciente)
          const lock = await prisma.sessionLock.findUnique({ where: { userId: user.id } });
          const isLockActive = lock && (Date.now() - new Date(lock.lastSeen).getTime() < 60_000);
          
          if (isLockActive) {
            // Si es un usuario normal (no ADMIN), rechazar el login
            if (user.role !== 'ADMIN') {
              console.error("[AUTH] Device already active for user:", credentials.username);
              throw new Error("Ya hay un dispositivo activo en esta cuenta. Cierra sesión en el otro dispositivo primero.");
            }
            // Si es ADMIN, permitir sobrescribir y eliminar el lock previo
            console.warn("[AUTH] ADMIN override - removing existing session lock for:", credentials.username);
            await prisma.sessionLock.delete({ where: { userId: user.id } }).catch(() => {});
          }
          
          // Crear nuevo session lock
          await prisma.sessionLock.upsert({
            where: { userId: user.id },
            update: { lastSeen: new Date(), sessionId: "temp" },
            create: { userId: user.id, sessionId: "temp", lastSeen: new Date() }
          });
          
          console.log("[AUTH] Login successful for user:", credentials.username);
          return { id: user.id, name: user.username, email: user.email, role: user.role };
        } catch (error) {
          console.error("[AUTH] Authorization error:", error);
          // NextAuth capturará este error y lo pasará al frontend
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
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    }
  },
  pages: { signIn: "/login" }
});