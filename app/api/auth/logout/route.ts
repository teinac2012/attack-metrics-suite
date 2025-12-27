import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (session?.user) {
      const userId = (session.user as any).id;
      
      // Eliminar session lock
      await prisma.sessionLock.deleteMany({
        where: { userId }
      }).catch(err => {
        console.error("[LOGOUT] Error removing session lock:", err);
      });
      
      console.log("[LOGOUT] Session lock removed for user:", (session.user as any).name);
    }
    
    // Llamar a signOut de NextAuth
    await signOut({ redirect: false });
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[LOGOUT] Error:", error);
    return NextResponse.json({ error: "Error al cerrar sesión" }, { status: 500 });
  }
}
