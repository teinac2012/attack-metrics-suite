import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";
import AdminCreateUserForm from "./AdminCreateUserForm";
import LicenseEditor from "./LicenseEditor";

export default async function AdminPage() {
  const session = await auth();
  
  if ((session?.user as any)?.role !== "ADMIN") {
    return (
      <div className="p-8">
        <p>No autorizado. Solo administradores.</p>
        <Link href="/dashboard" className="text-blue-600">Volver al Dashboard</Link>
      </div>
    );
  }

  const users = await prisma.user.findMany({
    include: {
      licenses: { where: { isActive: true } },
      sessionLocks: true
    }
  });

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">Panel de Administración</h1>

      <AdminCreateUserForm />
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Días restantes</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado sesión</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Editar licencia (días)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user: any) => {
              const license = user.licenses[0];
              const daysLeft = license 
                ? Math.ceil((new Date(license.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                : 0;
              const isOnline = user.sessionLocks?.[0] 
                ? (Date.now() - new Date(user.sessionLocks[0].lastSeen).getTime() < 60_000)
                : false;
              
              return (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={daysLeft > 30 ? "text-green-600" : daysLeft > 7 ? "text-yellow-600" : "text-red-600"}>
                      {daysLeft} días
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={isOnline ? "text-green-600" : "text-gray-400"}>
                      {isOnline ? "En línea" : "Desconectado"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <LicenseEditor userId={user.id} initialDaysLeft={daysLeft} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <Link href="/dashboard" className="mt-6 inline-block text-blue-600">
        Volver al Dashboard
      </Link>
    </div>
  );
}