"use client";
import { useState } from "react";
import { toast } from "react-hot-toast";

interface AppContainerProps {
  appUrl: string;
  appName: string;
}

export default function AppContainer({ appUrl, appName }: AppContainerProps) {
  const [isResetting, setIsResetting] = useState(false);

  const handleResetAllApps = async () => {
    const confirmed = window.confirm(
      "¿Estás seguro de que deseas resetear todos los datos de las 3 aplicaciones? Esta acción no se puede deshacer."
    );

    if (!confirmed) return;

    setIsResetting(true);

    try {
      // Llamar API de reset
      const response = await fetch("/api/apps/reset", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Error al resetear");
      }

      // Limpiar localStorage de todas las apps
      const appKeys = [
        "app1Data",
        "app2Data",
        "app3Data",
        "analysisData",
        "shootingData",
        "attackData",
        "AnalystData",
        "DataCache",
      ];

      appKeys.forEach((key) => localStorage.removeItem(key));

      // Mandar mensaje a todos los iframes para limpiar sus datos
      document.querySelectorAll("iframe").forEach((iframe) => {
        try {
          iframe.contentWindow?.postMessage(
            { type: "RESET_DATA" },
            window.location.origin
          );
        } catch (e) {
          console.warn("No se pudo enviar mensaje a iframe:", e);
        }
      });

      toast.success(
        "✅ Datos de todas las aplicaciones reseteados correctamente",
        {
          duration: 3000,
          icon: "🔄",
        }
      );

      // Recargar página después de 1 segundo
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error:", error);
      toast.error("❌ Error al resetear los datos", {
        duration: 3000,
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex-1 overflow-hidden p-6 flex flex-col gap-4">
      {/* Toolbar con botón de reset */}
      <div className="flex justify-between items-center bg-gray-800/50 border border-gray-700/50 rounded-lg px-6 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <h2 className="text-white font-semibold text-lg">{appName}</h2>
          <span className="text-gray-500 text-sm">● En línea</span>
        </div>

        <button
          onClick={handleResetAllApps}
          disabled={isResetting}
          className="px-5 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 hover:text-red-200 border border-red-500/50 hover:border-red-500 text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 active:scale-95"
        >
          <span>{isResetting ? "🔄" : "🔴"}</span>
          {isResetting ? "Reseteando..." : "Reset All Apps"}
        </button>
      </div>

      {/* Iframe fullscreen */}
      <div className="flex-1 overflow-hidden rounded-xl shadow-2xl border border-gray-700/50 bg-black">
        <iframe
          src={appUrl}
          className="w-full h-full"
          title={appName}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-presentation"
        />
      </div>
    </div>
  );
}
