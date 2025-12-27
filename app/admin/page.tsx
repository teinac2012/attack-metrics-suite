import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";
import SessionHeartbeat from "@/components/SessionHeartbeat";
import AdminCreateUserForm from "./AdminCreateUserForm";
import LicenseEditor from "./LicenseEditor";
import SavedPasswordDisplay from "./SavedPasswordDisplay";
import ResetPasswordButton from "./ResetPasswordButton";
import DeleteUserButton from "./DeleteUserButton";
import UnlockUserButton from "./UnlockUserButton";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
  const session = await auth();
  
  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="text-center relative z-10">
          <h1 className="text-5xl font-black text-white mb-4">No Autorizado</h1>
          <Link href="/login" className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold">
            Ir al Login
          </Link>
        </div>
      </div>
    );
  }

  if ((session?.user as any)?.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-red-500/10 to-transparent rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-orange-500/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>
        
        <div className="text-center relative z-10">
          <h1 className="text-5xl font-black text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400">🚫 Acceso Denegado</h1>
          <p className="text-gray-400 mb-8 text-lg">Solo administradores pueden acceder a esta página.</p>
          <Link href="/dashboard" className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-blue-500/50 hover:scale-105">
            ← Volver al Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Validar licencia del admin
  const adminUser = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    include: { licenses: { where: { isActive: true }, take: 1 } }
  });

  if (!adminUser || adminUser.licenses.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="text-center relative z-10">
          <h1 className="text-5xl font-black text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400">Licencia Vencida</h1>
          <p className="text-gray-400 mb-8 text-lg">Tu acceso ha expirado. Por favor, contacta para renovar.</p>
          <Link href="/login" className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-blue-500/50 hover:scale-105">
            Ir al Login
          </Link>
        </div>
      </div>
    );
  }

  const users = await prisma.user.findMany({
    include: {
      licenses: { where: { isActive: true } },
      sessionLocks: true
    },
    orderBy: { createdAt: 'desc' }
  });

  const onlineUsers = users.filter((u: any) => u.sessionLocks?.[0] && (Date.now() - new Date(u.sessionLocks[0].lastSeen).getTime() < 60_000)).length;
  const activeLicenses = users.filter((u: any) => u.licenses.length > 0).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <SessionHeartbeat />
      <div className="container mx-auto px-4 py-12 relative z-10">
        <AdminClient 
          totalUsers={users.length}
          onlineUsers={onlineUsers}
          activeLicenses={activeLicenses}
        />

        {/* Create User Form */}
        <div className="mb-10">
          <AdminCreateUserForm />
        </div>

        {/* Users Table */}
        <div className="bg-gray-800/30 border border-gray-700/50 rounded-3xl overflow-hidden backdrop-blur-2xl shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700/50 bg-gradient-to-r from-gray-900/80 to-gray-800/80">
                  <th className="px-6 py-5 text-left text-xs font-black text-gray-300 uppercase tracking-wider">👤 Usuario</th>
                  <th className="px-6 py-5 text-left text-xs font-black text-gray-300 uppercase tracking-wider">📧 Email</th>
                  <th className="px-6 py-5 text-left text-xs font-black text-gray-300 uppercase tracking-wider">🔑 Contraseña</th>
                  <th className="px-6 py-5 text-left text-xs font-black text-gray-300 uppercase tracking-wider">👑 Rol</th>
                  <th className="px-6 py-5 text-left text-xs font-black text-gray-300 uppercase tracking-wider">📅 Licencia</th>
                  <th className="px-6 py-5 text-left text-xs font-black text-gray-300 uppercase tracking-wider">🔵 Estado</th>
                  <th className="px-6 py-5 text-left text-xs font-black text-gray-300 uppercase tracking-wider">🔒 Bloqueo</th>
                  <th className="px-6 py-5 text-left text-xs font-black text-gray-300 uppercase tracking-wider">⚙️ Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/30">
                {users.map((user: any) => {
                  const license = user.licenses[0];
                  const daysLeft = license 
                    ? Math.ceil((new Date(license.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                    : 0;
                  const isOnline = user.sessionLocks?.[0] 
                    ? (Date.now() - new Date(user.sessionLocks[0].lastSeen).getTime() < 60_000)
                    : false;
                  
                  return (
                    <tr key={user.id} className="hover:bg-gradient-to-r hover:from-gray-700/20 hover:to-gray-800/20 transition-all duration-300 group">
                      <td className="px-6 py-5">
                        <p className="font-bold text-white text-lg group-hover:text-blue-400 transition-colors">{user.username}</p>
                      </td>
                      <td className="px-6 py-5 text-gray-300 font-medium">{user.email || "—"}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <SavedPasswordDisplay userId={user.id} />
                          <ResetPasswordButton userId={user.id} username={user.username} />
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold backdrop-blur-sm border-2 transition-all ${
                          user.role === 'ADMIN' 
                            ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/40 shadow-lg shadow-purple-500/20' 
                            : 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border-blue-500/40 shadow-lg shadow-blue-500/20'
                        }`}>
                          {user.role === 'ADMIN' ? '👑' : '👤'} {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full animate-pulse ${
                            daysLeft > 30 ? 'bg-green-500 shadow-lg shadow-green-500/50' : 
                            daysLeft > 7 ? 'bg-yellow-500 shadow-lg shadow-yellow-500/50' : 
                            'bg-red-500 shadow-lg shadow-red-500/50'
                          }`}></div>
                          <span className={`font-bold text-lg ${
                            daysLeft > 30 ? "text-green-400" : 
                            daysLeft > 7 ? "text-yellow-400" : 
                            "text-red-400"
                          }`}>
                            {daysLeft} días
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold backdrop-blur-sm border-2 ${
                          isOnline 
                            ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-green-500/40 shadow-lg shadow-green-500/20' 
                            : 'bg-gray-500/10 text-gray-400 border-gray-500/30'
                        }`}>
                          {isOnline ? "🟢 En línea" : "⚫ Offline"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        {user.isLocked ? (
                          <div className="flex flex-col gap-2">
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-300 border-2 border-red-500/40 shadow-lg shadow-red-500/20">
                              🔒 Bloqueado
                            </span>
                            {user.lockedUntil && (
                              <span className="text-xs text-red-300/70 font-semibold">
                                Hasta: {new Date(user.lockedUntil).toLocaleTimeString('es-MX')}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <UnlockUserButton userId={user.id} username={user.username} isLocked={user.isLocked} />
                          <LicenseEditor userId={user.id} initialDaysLeft={daysLeft} />
                          <DeleteUserButton userId={user.id} username={user.username} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {users.length === 0 && (
            <div className="p-16 text-center">
              <p className="text-gray-400 text-xl font-medium">No hay usuarios creados aún.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}