import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ChangePasswordForm from "@/components/ChangePasswordForm";

export default async function PerfilPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    include: { licenses: { where: { isActive: true }, take: 1 } },
  });

  if (!user) redirect("/login");

  const license = user.licenses[0];
  const daysLeft = license 
    ? Math.ceil((new Date(license.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">👤 Mi Perfil</h1>
            <p className="text-gray-400">Gestiona tu cuenta y configuración</p>
          </div>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            ← Volver
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información del Usuario */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-6">Información Personal</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Usuario</label>
                <p className="text-lg font-semibold">{user.username}</p>
              </div>
              
              <div>
                <label className="text-sm text-gray-400">Email</label>
                <p className="text-lg">{user.email || "No configurado"}</p>
              </div>
              
              <div>
                <label className="text-sm text-gray-400">Rol</label>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  user.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'
                }`}>
                  {user.role}
                </span>
              </div>
              
              <div>
                <label className="text-sm text-gray-400">Licencia</label>
                <div className={`mt-2 inline-block px-4 py-2 rounded-lg ${
                  daysLeft > 30 ? 'bg-green-500/20 text-green-300 border-green-500/30' : 
                  daysLeft > 7 ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' : 
                  'bg-red-500/20 text-red-300 border-red-500/30'
                } border`}>
                  <span className="font-semibold">{daysLeft}</span> días restantes
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400">Miembro desde</label>
                <p className="text-lg">
                  {new Date(user.createdAt).toLocaleDateString("es-MX", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Cambiar Contraseña */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-6">Cambiar Contraseña</h2>
            <ChangePasswordForm userId={user.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
