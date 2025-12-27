import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  
  // Solo ADMIN puede desbloquear cuentas
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 401 }
    );
  }

  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId requerido" },
        { status: 400 }
      );
    }

    // Actualizar usuario para desbloquearlo
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        isLocked: false,
        lockedUntil: null,
        failedLoginCount: 0,
        lastFailedLoginAt: null
      }
    });

    return NextResponse.json({
      success: true,
      message: `Usuario ${user.username} desbloqueado correctamente`,
      user: {
        id: user.id,
        username: user.username,
        isLocked: user.isLocked
      }
    });
  } catch (error: any) {
    console.error("[UNLOCK_USER] Error:", error);
    return NextResponse.json(
      { error: error?.message || "Error al desbloquear usuario" },
      { status: 500 }
    );
  }
}
