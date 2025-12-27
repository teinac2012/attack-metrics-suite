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
          
          const lock = await prisma.sessionLock.findUnique({ where: { userId: user.id } });
          if (lock && (Date.now() - new Date(lock.lastSeen).getTime() < 60_000)) {
            // Nuevo login toma el control: elimina el lock previo para este usuario
            // Mantiene restricción de un dispositivo porque se reemplaza el lock
            await prisma.sessionLock.delete({ where: { userId: user.id } }).catch(() => {});
            console.warn("[AUTH] Overriding existing session lock for user:", credentials.username);
          }
          
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