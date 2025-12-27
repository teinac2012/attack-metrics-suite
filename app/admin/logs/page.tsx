import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function LogsPage() {
  const session = await auth();
  
  if ((session?.user as any)?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Obtener logs de auditoría (últimos 100)
  const logs = await prisma.loginAudit.findMany({
    include: { user: { select: { username: true, role: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  // Obtener intentos fallidos (últimos 50)
  const failedAttempts = await prisma.loginAttempt.findMany({
    where: { success: false },
    include: { user: { select: { username: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">📋 Logs de Actividad</h1>
            <p className="text-gray-400">Historial de accesos y actividad del sistema</p>
          </div>
          <Link
            href="/admin"
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            ← Volver al Panel
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Logs de Auditoría */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden">
            <div className="bg-gray-900/50 px-6 py-4 border-b border-gray-700/50">
              <h2 className="text-xl font-bold">✅ Logins Exitosos</h2>
            </div>
            <div className="p-6 max-h-[600px] overflow-y-auto">
              <div className="space-y-3">
                {logs.filter(l => l.action === "LOGIN_SUCCESS").slice(0, 30).map((log) => (
                  <div
                    key={log.id}
                    className="bg-green-500/10 border border-green-500/20 rounded-lg p-3"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold">{log.user.username}</p>
                        <p className="text-xs text-gray-400">{log.user.role}</p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(log.createdAt).toLocaleString("es-MX")}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 space-y-1">
                      <p>🌐 IP: {log.ipAddress || "N/A"}</p>
                      <p>🖥️ Dispositivo: {log.deviceHash || "N/A"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Intentos Fallidos */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden">
            <div className="bg-gray-900/50 px-6 py-4 border-b border-gray-700/50">
              <h2 className="text-xl font-bold">❌ Intentos Fallidos</h2>
            </div>
            <div className="p-6 max-h-[600px] overflow-y-auto">
              <div className="space-y-3">
                {failedAttempts.map((attempt) => (
                  <div
                    key={attempt.id}
                    className="bg-red-500/10 border border-red-500/20 rounded-lg p-3"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold">{attempt.username}</p>
                        <p className="text-xs text-red-400">{attempt.failReason}</p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(attempt.createdAt).toLocaleString("es-MX")}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 space-y-1">
                      <p>🌐 IP: {attempt.ipAddress || "N/A"}</p>
                      {attempt.deviceHash && (
                        <p>🖥️ Dispositivo: {attempt.deviceHash}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
