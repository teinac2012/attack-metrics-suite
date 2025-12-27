"use client";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";

interface AppContainerProps {
  appUrl: string;
  appName: string;
  appId: string;
}

export default function AppContainer({ appUrl, appName, appId }: AppContainerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos guardados cuando el iframe carga
  useEffect(() => {
    const loadAppData = async () => {
      try {
        const response = await fetch(`/api/apps/data?appId=${appId}`);
        const result = await response.json();

        if (result.success && result.data) {
          // Esperar a que el iframe esté listo y enviar los datos
          setTimeout(() => {
            iframeRef.current?.contentWindow?.postMessage(
              {
                type: "LOAD_DATA",
                data: result.data,
              },
              "*"
            );
          }, 1500);
        }
      } catch (error) {
        console.warn("Error cargando datos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const iframeEl = iframeRef.current;
    if (iframeEl) {
      // Escuchar cuando el iframe está listo
      iframeEl.onload = () => {
        loadAppData();
      };
    }

    return () => {
      // Guardar datos antes de desmontar el componente
      saveAppData();
    };
  }, [appId]);

  // Guardar datos antes de dejar la página
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveAppData();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [appId]);

  // Escuchar mensajes del iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;

      if (event.data.type === "SAVE_DATA") {
        // Guardar datos cuando el iframe lo solicita
        saveAppData(event.data.data);
      } else if (event.data.type === "LOG") {
        console.log("[App " + appId + "]:", event.data.message);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [appId]);

  const saveAppData = async (data?: any) => {
    try {
      let dataToSave = data;

      // Si no hay datos específicos, intentar obtener del iframe
      if (!data && iframeRef.current?.contentWindow) {
        try {
          // Solicitar datos al iframe
          iframeRef.current.contentWindow.postMessage(
            { type: "REQUEST_DATA" },
            "*"
          );
          // Dar tiempo al iframe para responder
          await new Promise((resolve) => setTimeout(resolve, 500));
          return;
        } catch (e) {
          console.warn("No se pudo obtener datos del iframe");
        }
      }

      if (!dataToSave) return;

      const response = await fetch("/api/apps/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appId: appId,
          data: dataToSave,
        }),
      });

      if (!response.ok) {
        console.error("Error guardando datos");
      }
    } catch (error) {
      console.error("Error en saveAppData:", error);
    }
  };

  return (
    <div className="flex-1 overflow-hidden p-6">
      {/* Iframe fullscreen */}
      <div className="h-full rounded-xl shadow-2xl border border-gray-700/50 bg-black overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 rounded-xl">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-3" />
              <p className="text-gray-300 text-sm">Cargando {appName}...</p>
            </div>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={appUrl}
          className="w-full h-full"
          title={appName}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-presentation allow-storage"
          onLoad={() => setIsLoading(false)}
        />
      </div>
    </div>
  );
}
