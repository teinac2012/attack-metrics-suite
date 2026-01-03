"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface App {
  id: number;
  name: string;
  href: string;
  icon: string;
  description: string;
}

const apps: App[] = [
  {
    id: 1,
    name: "Analista Pro",
    href: "/apps/app1",
    icon: "🎯",
    description: "Análisis táctico avanzado"
  },
  {
    id: 2,
    name: "Attack Metrics",
    href: "/apps/app2",
    icon: "⚡",
    description: "Análisis de ataques y regates"
  },
  {
    id: 3,
    name: "Data Hub",
    href: "/apps/app3",
    icon: "📊",
    description: "Análisis de datos avanzado"
  },
  {
    id: 4,
    name: "Portero",
    href: "/apps/app4",
    icon: "🧤",
    description: "Análisis especializado de porteros"
  },
  {
    id: 5,
    name: "Attack Scout",
    href: "/apps/app5",
    icon: "🍕",
    description: "Comparativa de perfiles y percentiles"
  }
];

export default function AppsNavBar({ userName }: { userName: string }) {
  const pathname = usePathname();

  return (
    <>
      {/* Barra superior profesional */}
      <div className="h-16 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-40 shadow-lg">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="text-white font-bold text-lg hover:text-blue-400 transition-colors">
            Attack Métrics Hub
          </Link>
          
          {/* Navegación entre apps */}
          <div className="flex items-center gap-2">
            {apps.map((app) => {
              const isActive = pathname.startsWith(app.href);
              return (
                <Link
                  key={app.id}
                  href={app.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-300 border border-blue-500/50 shadow-lg shadow-blue-500/10'
                      : 'text-gray-400 hover:text-white border border-transparent hover:border-gray-700/50'
                  }`}
                >
                  <span>{app.icon}</span>
                  <span className="hidden sm:inline">{app.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Lado derecho: Usuario y accesos rápidos */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-white text-sm font-medium">{userName}</p>
            <p className="text-gray-500 text-xs">En línea</p>
          </div>
          
          <div className="w-px h-6 bg-gray-700/30" />
          
          <div className="flex gap-2">
            <Link
              href="/perfil"
              className="px-3 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white text-sm font-medium transition-colors border border-gray-700/30 hover:border-gray-600/50"
            >
              👤 Perfil
            </Link>
            <Link
              href="/dashboard"
              className="px-3 py-2 rounded-lg bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-500 hover:to-purple-500 text-white text-sm font-medium transition-all duration-300 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20"
            >
              ← Volver
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
