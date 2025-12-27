"use client";
import { useState } from "react";

export default function PasswordToggle({ password }: { password: string }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <code className="px-2 py-1 bg-gray-900/50 rounded text-sm text-gray-300 font-mono max-w-xs truncate">
        {visible ? password : "•".repeat(Math.min(password.length, 12))}
      </code>
      <button
        onClick={() => setVisible(!visible)}
        className="p-1 text-gray-400 hover:text-gray-200 transition-colors"
        title={visible ? "Ocultar" : "Mostrar"}
      >
        {visible ? "👁️" : "👁️‍🗨️"}
      </button>
    </div>
  );
}
