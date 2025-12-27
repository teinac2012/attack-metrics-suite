"use client";
import { useState } from "react";

export default function LicenseKeyDisplay({ licenseId }: { licenseId: string }) {
  const [visible, setVisible] = useState(false);

  if (!licenseId) {
    return <span className="text-gray-500">Sin licencia</span>;
  }

  // Mostrar solo los últimos 8 caracteres (código corto)
  const displayId = licenseId.slice(-8).toUpperCase();
  const fullId = licenseId.toUpperCase();

  return (
    <div className="flex items-center gap-2">
      <code className="px-3 py-1 bg-green-900/30 border border-green-600/30 rounded text-sm text-green-300 font-mono font-bold">
        {visible ? fullId : displayId}
      </code>
      <button
        onClick={() => setVisible(!visible)}
        className="p-1 text-gray-400 hover:text-gray-200 transition-colors"
        title={visible ? "Ocultar" : "Mostrar completo"}
      >
        {visible ? "👁️" : "👁️‍🗨️"}
      </button>
      <button
        onClick={() => {
          // Copiar por defecto el código corto (últimos 8)
          navigator.clipboard.writeText(displayId);
          alert("Código de licencia copiado: " + displayId);
        }}
        className="p-1 text-gray-400 hover:text-gray-200 transition-colors"
        title="Copiar código corto"
      >
        📋
      </button>
    </div>
  );
}
