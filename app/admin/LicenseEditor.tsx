"use client";
import { useState } from "react";

export default function LicenseEditor({ userId, initialDaysLeft }: { userId: string; initialDaysLeft: number }) {
  const [days, setDays] = useState<number>(Math.max(initialDaysLeft, 1));
  const [saving, setSaving] = useState(false);
  const [showInput, setShowInput] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/licenses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, durationDays: days }),
      });
      if (res.ok) {
        setShowInput(false);
        window.location.reload();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {showInput ? (
        <>
          <input 
            type="number" 
            min={1} 
            className="w-20 px-3 py-1 bg-gray-900/50 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500" 
            value={days} 
            onChange={e=>setDays(parseInt(e.target.value||"1",10))}
            autoFocus
          />
          <button 
            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded font-medium transition-colors disabled:opacity-50" 
            disabled={saving} 
            onClick={save}
          >
            {saving ? "..." : "✓"}
          </button>
          <button 
            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors" 
            onClick={() => {
              setDays(initialDaysLeft);
              setShowInput(false);
            }}
          >
            ✕
          </button>
        </>
      ) : (
        <button 
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded font-medium transition-colors"
          onClick={() => setShowInput(true)}
        >
          Editar
        </button>
      )}
    </div>
  );
}
