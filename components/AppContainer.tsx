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
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cargar datos guardados cuando el iframe carga
  useEffect(() => {
    const loadAppData = async () => {
      try {
        console.log(`[AppContainer] Cargando datos para ${appId}...`);
        const response = await fetch(`/api/apps/data?appId=${appId}`);
        const result = await response.json();

        if (result.success && result.data) {
          console.log(`[AppContainer] Datos encontrados para ${appId}`, result.data);
          // Esperar a que el iframe esté listo y enviar los datos
          setTimeout(() => {
            if (iframeRef.current?.contentWindow) {
              iframeRef.current.contentWindow.postMessage(
                {
                  type: "LOAD_DATA",
                  data: result.data,
                  appId: appId,
                },
                "*"
              );
              console.log(`[AppContainer] Datos enviados al iframe ${appId}`);
            }
          }, 1000);
        } else {
          console.log(`[AppContainer] No hay datos guardados para ${appId}`);
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
        console.log(`[AppContainer] Iframe ${appId} cargado`);
        loadAppData();
      };
    }

    return () => {
      // Limpiar timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      // Guardar datos antes de desmontar el componente
      saveAppData();
    };
  }, [appId]);

  // Guardar datos antes de dejar la página (debounced)
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log(`[AppContainer] Guardando datos antes de descargar ${appId}...`);
      saveAppDataImmediate();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [appId]);

  // Escuchar mensajes del iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Solo procesar mensajes del iframe actual
      if (event.source !== iframeRef.current?.contentWindow) return;

      if (event.data.type === "SAVE_DATA") {
        console.log(`[AppContainer] Recibido SAVE_DATA de ${appId}`, event.data.count);
        // Debounced save
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
          saveAppData(event.data.data);
        }, 500);
      } else if (event.data.type === "LOG") {
        console.log(`[${appName}]:`, event.data.message);
      } else if (event.data.type === "APP_READY") {
        console.log(`[AppContainer] App ${appId} está lista`);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [appId, appName]);

  const saveAppData = async (data?: any) => {
    try {
      let dataToSave = data;

      if (!dataToSave) {
        console.log(`[AppContainer] No hay datos específicos para guardar`);
        return;
      }

      console.log(`[AppContainer] Guardando datos para ${appId}...`);

      const response = await fetch("/api/apps/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appId: appId,
          data: dataToSave,
        }),
      });

      if (response.ok) {
        console.log(`[AppContainer] Datos guardados exitosamente para ${appId}`);
      } else {
        console.error(`[AppContainer] Error guardando datos:`, response.status);
      }
    } catch (error) {
      console.error("Error en saveAppData:", error);
    }
  };

  const saveAppDataImmediate = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveAppData();
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
          onLoad={() => {
            console.log(`[AppContainer] Iframe ${appId} se ha cargado completamente`);
            setIsLoading(false);
          }}
        />
      </div>
    </div>
  );
}
