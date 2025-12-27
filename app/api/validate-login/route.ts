import { validateLoginAttempt, generateDeviceHash } from "@/lib/auth-security";
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

    // Obtener información del cliente
    const ipAddress = req.headers.get("x-forwarded-for") || 
                     req.headers.get("x-client-ip") ||
                     req.headers.get("cf-connecting-ip") ||
                     "unknown";
    const userAgent = req.headers.get("user-agent") || undefined;
    const deviceHash = generateDeviceHash(userAgent);

    // Validar login usando el nuevo sistema de seguridad
    const result = await validateLoginAttempt(
      username,
      password,
      ipAddress,
      userAgent
    );

    if (!result.success) {
      return NextResponse.json(
        { 
          error: result.message, 
          code: result.code 
        },
        { 
          status: result.code === "ACCOUNT_LOCKED" ? 429 : 
                  result.code === "NO_LICENSE" ? 403 : 
                  401 
        }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        code: "OK", 
        canLogin: true,
        deviceHash 
      },
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
