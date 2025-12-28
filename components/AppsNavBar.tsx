"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";

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
  }
];

export default function AppsNavBar({ userName }: { userName: string }) {
  const pathname = usePathname();
  const [isResetting, setIsResetting] = useState(false);

  const handleResetAllApps = async () => {
    const confirmed = window.confirm(
      "¿Estás seguro de que deseas resetear todos los datos de las 3 aplicaciones? Esta acción no se puede deshacer."
    );

    if (!confirmed) return;

    setIsResetting(true);

    try {
      // Limpiar localStorage completamente
      localStorage.clear();
      
      // Limpiar sessionStorage también
      sessionStorage.clear();

      // Mandar mensaje a todos los iframes para limpiar sus datos
      document.querySelectorAll("iframe").forEach((iframe) => {
        try {
          iframe.contentWindow?.postMessage(
            { type: "RESET_DATA", action: "clearAll" },
            "*"
          );
        } catch (e) {
          console.warn("No se pudo enviar mensaje a iframe:", e);
        }
      });

      // Llamar API de reset
      try {
        await fetch("/api/apps/reset", {
          method: "POST",
        });
      } catch (e) {
        console.warn("API call error:", e);
      }

      toast.success(
        "✅ Datos de todas las aplicaciones reseteados",
        {
          duration: 2000,
          icon: "🔄",
        }
      );

      // Recargar página después de 800ms
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (error) {
      console.error("Error:", error);
      toast.error("❌ Error al resetear los datos", {
        duration: 2000,
      });
      setIsResetting(false);
    }
  };

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

        {/* Lado derecho: Usuario, botón reset y botones */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-white text-sm font-medium">{userName}</p>
            <p className="text-gray-500 text-xs">En línea</p>
          </div>
          
          <div className="w-px h-6 bg-gray-700/30" />
          
          <button
            onClick={handleResetAllApps}
            disabled={isResetting}
            className="px-3 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 hover:text-red-200 border border-red-500/50 hover:border-red-500 text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 active:scale-95 whitespace-nowrap"
            title="Resetear datos de todas las apps"
          >
            <span>{isResetting ? "🔄" : "🔴"}</span>
            <span className="hidden sm:inline text-xs">{isResetting ? "Reseteando..." : "Reset"}</span>
          </button>
          
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
