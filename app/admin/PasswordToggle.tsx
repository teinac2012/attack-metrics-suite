"use client";
import { useState } from "react";

export default function PasswordToggle({ password }: { password: string }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <div className="text-xs text-gray-500 mr-1">Hash:</div>
      <code className="px-2 py-1 bg-gray-900/50 rounded text-xs text-gray-400 font-mono max-w-xs truncate">
        {visible ? password : "•".repeat(16)}
      </code>
      <button
        onClick={() => setVisible(!visible)}
        className="p-1 text-gray-400 hover:text-gray-200 transition-colors"
        title={visible ? "Ocultar hash" : "Mostrar hash"}
      >
        {visible ? "👁️" : "👁️‍🗨️"}
      </button>
      <span className="text-xs text-gray-500 ml-1">(no reversible)</span>
    </div>
  );
}
