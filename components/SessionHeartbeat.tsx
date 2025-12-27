"use client";
import { useEffect } from "react";

export default function SessionHeartbeat({ intervalMs = 15000 }: { intervalMs?: number }) {
  useEffect(() => {
    let active = true;
    const tick = () => {
      fetch("/api/session-lock", { method: "POST" }).catch(() => {});
    };
    // initial ping
    tick();
    const id = setInterval(tick, intervalMs);
    
    // Logout cuando se cierra la pestaña/ventana
    const handleBeforeUnload = () => {
      // Usar sendBeacon para asegurar que se envíe incluso si se cierra la pestaña
      // Enviamos como blob porque sendBeacon no soporta bien application/json
      const blob = new Blob(['{}'], { type: 'application/json' });
      navigator.sendBeacon("/api/auth/logout", blob);
    };
    
    // Escuchar tanto beforeunload como unload para máxima compatibilidad
    window.addEventListener("beforeunload", handleBeforeUnload, { passive: true });
    window.addEventListener("unload", handleBeforeUnload, { passive: true });
    
    return () => {
      active = false;
      clearInterval(id);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("unload", handleBeforeUnload);
    };
  }, [intervalMs]);
  return null;
}
