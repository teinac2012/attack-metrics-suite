import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Credenciales incompletas", code: "MISSING_CREDENTIALS" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { username },
      include: { licenses: { where: { isActive: true, endDate: { gt: new Date() } } } }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario o contraseña no válida", code: "INVALID_CREDENTIALS" },
        { status: 401 }
      );
    }

    // Validar contraseña
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Usuario o contraseña no válida", code: "INVALID_CREDENTIALS" },
        { status: 401 }
      );
    }

    // Validar licencia para usuarios normales
    if (user.role !== "ADMIN" && user.licenses.length === 0) {
      return NextResponse.json(
        { error: "No tienes una licencia activa. Contacta al administrador.", code: "NO_LICENSE" },
        { status: 403 }
      );
    }

    // Verificar session lock
    const lock = await prisma.sessionLock.findUnique({ where: { userId: user.id } });
    const timeSinceLastSeen = lock ? Date.now() - new Date(lock.lastSeen).getTime() : Infinity;
    const isLockActive = lock && timeSinceLastSeen < 120_000; // 2 minutos

    if (isLockActive && user.role !== "ADMIN") {
      return NextResponse.json(
        {
          error: "Ya hay un dispositivo activo en esta cuenta. Cierra sesión en el otro dispositivo primero.",
          code: "DEVICE_ALREADY_ACTIVE"
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: true, code: "OK", canLogin: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("[VALIDATE_LOGIN] Error:", error);
    return NextResponse.json(
      { error: "Error al validar credenciales", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
