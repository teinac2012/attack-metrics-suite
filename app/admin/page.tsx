import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";
import AdminCreateUserForm from "./AdminCreateUserForm";
import LicenseEditor from "./LicenseEditor";
import SavedPasswordDisplay from "./SavedPasswordDisplay";
import DeleteUserButton from "./DeleteUserButton";

export default async function AdminPage() {
  const session = await auth();
  
  if ((session?.user as any)?.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Acceso Denegado</h1>
          <p className="text-gray-400 mb-6">Solo administradores pueden acceder a esta página.</p>
          <Link href="/dashboard" className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
            Volver al Dashboard
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Panel de Administración</h1>
              <p className="text-gray-400">Gestiona usuarios y licencias</p>
            </div>
            <Link href="/dashboard" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors">
              ← Volver al Dashboard
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Total Usuarios</p>
              <p className="text-3xl font-bold text-blue-400">{users.length}</p>
            </div>
            <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">En Línea</p>
              <p className="text-3xl font-bold text-green-400">
                {users.filter((u: any) => u.sessionLocks?.[0] && (Date.now() - new Date(u.sessionLocks[0].lastSeen).getTime() < 60_000)).length}
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Licencias Activas</p>
              <p className="text-3xl font-bold text-purple-400">
                {users.filter((u: any) => u.licenses.length > 0).length}
              </p>
            </div>
          </div>
        </div>

        {/* Create User Form */}
        <div className="mb-8">
          <AdminCreateUserForm />
        </div>

        {/* Users Table */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden backdrop-blur">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700/50 bg-gray-900/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wide">Usuario</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wide">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wide">Contraseña</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wide">Rol</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wide">Licencia</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wide">Estado</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wide">Acciones</th>
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
                    <tr key={user.id} className="hover:bg-gray-700/20 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-white">{user.username}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-400">{user.email || "—"}</td>
                      <td className="px-6 py-4">
                        <SavedPasswordDisplay userId={user.id} />
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${user.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            daysLeft > 30 ? 'bg-green-500' : daysLeft > 7 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></div>
                          <span className={daysLeft > 30 ? "text-green-400" : daysLeft > 7 ? "text-yellow-400" : "text-red-400"}>
                            {daysLeft} días
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${isOnline ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-400'}`}>
                          {isOnline ? "🟢 En línea" : "⚫ Desconectado"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
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
            <div className="p-8 text-center">
              <p className="text-gray-400">No hay usuarios creados aún.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}