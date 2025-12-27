"use client";
import { useState } from "react";

export default function UnlockUserButton({ userId, username, isLocked }: { userId: string; username: string; isLocked: boolean }) {
  const [loading, setLoading] = useState(false);

  if (!isLocked) {
    return <span className="text-gray-500 text-sm">—</span>;
  }

  async function handleUnlock(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm(`¿Desbloquear cuenta de ${username}?`)) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/unlock-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(`✅ ${data.message}`);
        window.location.reload();
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      alert("❌ Error de red");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleUnlock}
      disabled={loading}
      className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 border border-red-600/50 text-red-300 rounded transition-colors text-sm disabled:opacity-50"
      title="Desbloquear cuenta"
    >
      {loading ? "⏳ Desbloqueando..." : "🔓 Desbloquear"}
    </button>
  );
}
