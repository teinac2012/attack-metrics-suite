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
        if (!credentials?.username || !credentials?.password) return null;
        
        const user = await prisma.user.findUnique({ 
          where: { username: credentials.username as string },
          include: { licenses: { where: { isActive: true, endDate: { gt: new Date() } } } }
        });
        
        if (!user || user.licenses.length === 0) return null;
        
        const valid = await bcrypt.compare(credentials.password as string, user.passwordHash);
        if (!valid) return null;
        
        const lock = await prisma.sessionLock.findUnique({ where: { userId: user.id } });
        if (lock && (Date.now() - new Date(lock.lastSeen).getTime() < 60_000)) {
          return null;
        }
        
        await prisma.sessionLock.upsert({
          where: { userId: user.id },
          update: { lastSeen: new Date() },
          create: { userId: user.id, sessionId: "temp", lastSeen: new Date() }
        });
        
        return { id: user.id, name: user.username, email: user.email, role: user.role };
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