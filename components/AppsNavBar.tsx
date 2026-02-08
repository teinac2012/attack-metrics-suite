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
      {/* Barra superior profesional con glassmorphism */}
      <div className="h-16 bg-gray-900/80 glass-strong border-b border-gray-700/30 flex items-center justify-between px-6 sticky top-0 z-40 shadow-xl">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="group flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <span className="text-white font-bold text-lg group-hover:text-gradient transition-all duration-300">
              Attack Métrics Hub
            </span>
          </Link>
          
          {/* Navegación entre apps - Estilo pastilla */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-gray-800/50 border border-gray-700/30">
            {apps.map((app) => {
              const isActive = pathname.startsWith(app.href);
              return (
                <Link
                  key={app.id}
                  href={app.href}
                  title={app.description}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/20'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <span className="text-base">{app.icon}</span>
                  <span className="hidden lg:inline">{app.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Lado derecho: Usuario y accesos rápidos */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-white text-sm font-semibold">{userName}</p>
            <div className="flex items-center gap-1.5 justify-end">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              <p className="text-gray-400 text-xs">En línea</p>
            </div>
          </div>
          
          <div className="w-px h-8 bg-gray-700/50" />
          
          <div className="flex gap-2">
            <Link
              href="/perfil"
              className="btn-ghost flex items-center gap-2 text-sm"
            >
              👤 <span className="hidden sm:inline">Perfil</span>
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-sm font-semibold transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-105"
            >
              ← Dashboard
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
