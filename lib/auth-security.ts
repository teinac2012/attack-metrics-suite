import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const MAX_FAILED_ATTEMPTS = 20;
const LOCKOUT_DURATION_MINUTES = 15;
const ATTEMPT_WINDOW_MINUTES = 15;

export interface LoginValidationResult {
  success: boolean;
  code: string;
  message: string;
  userId?: string;
}

/**
 * Genera un hash del dispositivo basado en User-Agent
 */
export function generateDeviceHash(userAgent?: string): string {
  const data = userAgent || "unknown";
  return crypto.createHash("sha256").update(data).digest("hex").substring(0, 16);
}

/**
 * Valida intentos de login y retorna resultado detallado
 */
export async function validateLoginAttempt(
  username: string,
  password: string,
  ipAddress?: string,
  userAgent?: string
): Promise<LoginValidationResult> {
  try {
    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        licenses: { where: { isActive: true, endDate: { gt: new Date() } } }
      }
    });

    if (!user) {
      // Registrar intento fallido de usuario inexistente
      await logFailedAttempt(username, null, "USER_NOT_FOUND", ipAddress, userAgent);
      return {
        success: false,
        code: "INVALID_CREDENTIALS",
        message: "Usuario o contraseña no válida"
      };
    }

    // Verificar si la cuenta está bloqueada
    if (user.isLocked && user.lockedUntil && new Date() < user.lockedUntil) {
      const minutesLeft = Math.ceil(
        (user.lockedUntil.getTime() - new Date().getTime()) / (1000 * 60)
      );
      await logFailedAttempt(
        username,
        user.id,
        "ACCOUNT_LOCKED",
        ipAddress,
        userAgent
      );
      return {
        success: false,
        code: "ACCOUNT_LOCKED",
        message: `Cuenta bloqueada. Intenta de nuevo en ${minutesLeft} minutos`
      };
    }

    // Validar contraseña
    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      // Incrementar contador de intentos fallidos
      const failedAttempts = await countRecentFailedAttempts(user.id);

      if (failedAttempts >= MAX_FAILED_ATTEMPTS - 1) {
        // Bloquear cuenta
        const lockedUntil = new Date(
          Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000
        );
        await prisma.user.update({
          where: { id: user.id },
          data: {
            isLocked: true,
            lockedUntil,
            failedLoginCount: failedAttempts + 1,
            lastFailedLoginAt: new Date()
          }
        });

        await logFailedAttempt(
          username,
          user.id,
          "INVALID_PASSWORD_LOCKED",
          ipAddress,
          userAgent
        );

        return {
          success: false,
          code: "ACCOUNT_LOCKED",
          message: `Demasiados intentos fallidos. Cuenta bloqueada ${LOCKOUT_DURATION_MINUTES} minutos`
        };
      }

      // Registrar intento fallido
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginCount: failedAttempts + 1,
          lastFailedLoginAt: new Date()
        }
      });

      await logFailedAttempt(
        username,
        user.id,
        "INVALID_PASSWORD",
        ipAddress,
        userAgent
      );

      const attemptsLeft = MAX_FAILED_ATTEMPTS - failedAttempts - 1;
      return {
        success: false,
        code: "INVALID_CREDENTIALS",
        message: `Usuario o contraseña no válida. ${attemptsLeft} intentos restantes`
      };
    }

    // Validar licencia para usuarios normales
    if (user.role !== "ADMIN" && user.licenses.length === 0) {
      await logFailedAttempt(
        username,
        user.id,
        "NO_LICENSE",
        ipAddress,
        userAgent
      );
      return {
        success: false,
        code: "NO_LICENSE",
        message: "No tienes una licencia activa. Contacta al administrador"
      };
    }

    // Verificar dispositivo activo (session lock) - solo para validación inicial
    const deviceHash = generateDeviceHash(userAgent);
    const lock = await prisma.sessionLock.findUnique({
      where: { userId: user.id }
    });

    const timeSinceLastSeen = lock
      ? Date.now() - new Date(lock.lastSeen).getTime()
      : Infinity;
    const isLockActive = lock && timeSinceLastSeen < 120_000; // 2 minutos

    if (isLockActive && user.role !== "ADMIN") {
      // Usuarios normales no pueden loguearse si hay dispositivo activo
      await logFailedAttempt(
        username,
        user.id,
        "DEVICE_ALREADY_ACTIVE",
        ipAddress,
        userAgent,
        deviceHash
      );

      return {
        success: false,
        code: "DEVICE_ALREADY_ACTIVE",
        message: "Ya hay un dispositivo activo en esta cuenta. Cierra sesión primero"
      };
    }

    // NO crear/actualizar session lock aquí - se hace en lib/auth.ts durante signIn
    // Esto evita conflictos de ejecución doble

    // Log successful attempt (sin session lock)
    await logSuccessfulAttempt(user.id, ipAddress, userAgent, deviceHash);

    return {
      success: true,
      code: "OK",
      message: "Login exitoso",
      userId: user.id
    };
  } catch (error) {
    console.error("[AUTH_VALIDATION] Error:", error);
    return {
      success: false,
      code: "SERVER_ERROR",
      message: "Error al validar credenciales"
    };
  }
}

/**
 * Cuenta intentos fallidos en la última ventana de tiempo
 */
async function countRecentFailedAttempts(userId: string): Promise<number> {
  const windowStart = new Date(
    Date.now() - ATTEMPT_WINDOW_MINUTES * 60 * 1000
  );

  const count = await prisma.loginAttempt.count({
    where: {
      userId,
      success: false,
      createdAt: { gte: windowStart }
    }
  });

  return count;
}

/**
 * Registra intento fallido
 */
async function logFailedAttempt(
  username: string,
  userId: string | null,
  failReason: string,
  ipAddress?: string,
  userAgent?: string,
  deviceHash?: string
): Promise<void> {
  try {
    await prisma.loginAttempt.create({
      data: {
        username,
        userId: userId || undefined,
        success: false,
        ipAddress,
        userAgent,
        deviceHash,
        failReason
      }
    });
  } catch (error) {
    console.error("[LOGIN_AUDIT] Error logging failed attempt:", error);
  }
}

/**
 * Registra intento exitoso
 */
async function logSuccessfulAttempt(
  userId: string,
  ipAddress?: string,
  userAgent?: string,
  deviceHash?: string
): Promise<void> {
  try {
    await Promise.all([
      prisma.loginAttempt.create({
        data: {
          username: "", // Se actualiza después en la auditoría
          userId,
          success: true,
          ipAddress,
          userAgent,
          deviceHash
        }
      }),
      prisma.loginAudit.create({
        data: {
          userId,
          action: "LOGIN_SUCCESS",
          ipAddress,
          userAgent,
          deviceHash,
          metadata: JSON.stringify({
            timestamp: new Date().toISOString(),
            source: "credentials_provider"
          })
        }
      })
    ]);
  } catch (error) {
    console.error("[LOGIN_AUDIT] Error logging successful attempt:", error);
  }
}

/**
 * Registra logout
 */
export async function logLogout(
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    await prisma.loginAudit.create({
      data: {
        userId,
        action: "LOGOUT",
        ipAddress,
        userAgent,
        metadata: JSON.stringify({
          timestamp: new Date().toISOString()
        })
      }
    });
  } catch (error) {
    console.error("[LOGIN_AUDIT] Error logging logout:", error);
  }
}

/**
 * Obtiene historial de intentos de un usuario
 */
export async function getUserLoginHistory(
  userId: string,
  limit: number = 20
): Promise<any[]> {
  return prisma.loginAudit.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit
  });
}
