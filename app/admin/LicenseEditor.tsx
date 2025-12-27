"use client";
import { useState } from "react";

export default function LicenseEditor({ userId, initialDaysLeft }: { userId: string; initialDaysLeft: number }) {
  const [days, setDays] = useState<number>(Math.max(initialDaysLeft, 1));
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/licenses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, durationDays: days }),
      });
      if (res.ok) {
        // refresh to recompute days left
        window.location.reload();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input type="number" min={1} className="w-24 p-1 border rounded" value={days} onChange={e=>setDays(parseInt(e.target.value||"1",10))} />
      <button className="px-2 py-1 bg-gray-800 text-white rounded" disabled={saving} onClick={save}>{saving? "Guardando..." : "Guardar"}</button>
    </div>
  );
}
