import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  const apps = [
    {
      id: 1,
      name: "IA Pases Táctico",
      description: "Analista Pro v5.5 - Análisis inteligente de pases y patrones tácticos",
      icon: "🎯",
      href: "/apps/app1",
      color: "from-purple-500 to-purple-700"
    },
    {
      id: 2,
      name: "Attack Metrics",
      description: "v3.1 - Análisis completo de ataques, regates y penetraciones",
      icon: "⚡",
      href: "/apps/app2",
      color: "from-orange-500 to-orange-700"
    },
    {
      id: 3,
      name: "Shooting Analysis",
      description: "Pro Scout v18 - Análisis detallado de tiros y finalización",
      icon: "🎯",
      href: "/apps/app3",
      color: "from-blue-500 to-blue-700"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Attack Metrics Suite
            </h1>
            <p className="text-gray-400">
              Bienvenido, <span className="text-orange-500 font-semibold">{session.user.name}</span>
            </p>
          </div>
          <div className="flex gap-3">
            {(session.user as any).role === "ADMIN" && (
              <Link
                href="/admin"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
              >
                Panel Admin
              </Link>
            )}
            <form action="/api/auth/signout" method="post">
              <button
                type="submit"
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                Cerrar Sesión
              </button>
            </form>
          </div>
        </div>

        {/* Apps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => (
            <Link
              key={app.id}
              href={app.href}
              className="group relative overflow-hidden rounded-2xl bg-gray-800 hover:bg-gray-750 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${app.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
              
              <div className="p-6 relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-5xl">{app.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {app.name}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {app.description}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                  <span className="text-sm text-gray-500">
                    Clic para abrir
                  </span>
                  <svg
                    className="w-5 h-5 text-gray-500 group-hover:text-orange-500 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-12 p-6 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-3">
            📊 Estado de tu Licencia
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Usuario:</p>
              <p className="text-white font-medium">{session.user.name}</p>
            </div>
            <div>
              <p className="text-gray-400">Email:</p>
              <p className="text-white font-medium">{session.user.email || "No especificado"}</p>
            </div>
            <div>
              <p className="text-gray-400">Tipo:</p>
              <p className="text-white font-medium">{(session.user as any).role === "ADMIN" ? "Administrador" : "Usuario"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}