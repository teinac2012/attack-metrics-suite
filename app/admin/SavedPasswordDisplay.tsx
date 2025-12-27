"use client";
import { useEffect, useState } from "react";

export default function SavedPasswordDisplay({ userId }: { userId: string }) {
  const [pwd, setPwd] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const val = localStorage.getItem(`password:${userId}`);
      setPwd(val);
    } catch {
      setPwd(null);
    }
  }, [userId]);

  if (!pwd) {
    return <span className="text-gray-500">—</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <code className="px-3 py-1 bg-blue-900/30 border border-blue-600/30 rounded text-sm text-blue-300 font-mono">
        {visible ? pwd : "•".repeat(Math.min(pwd.length, 12))}
      </code>
      <button
        onClick={() => setVisible(!visible)}
        className="p-1 text-gray-400 hover:text-gray-200 transition-colors"
        title={visible ? "Ocultar" : "Mostrar"}
      >
        {visible ? "👁️" : "👁️‍🗨️"}
      </button>
      <button
        onClick={() => {
          navigator.clipboard.writeText(pwd!);
          alert("Contraseña copiada!");
        }}
        className="p-1 text-gray-400 hover:text-gray-200 transition-colors"
        title="Copiar"
      >
        📋
      </button>
    </div>
  );
}
