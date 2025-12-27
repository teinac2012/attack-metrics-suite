"use client";
import { useState } from "react";

export default function DeleteUserButton({ userId, username }: { userId: string; username: string }) {
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  async function deleteUser() {
    if (!confirmed) {
      setConfirmed(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        window.location.reload();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data?.error || "Error al eliminar usuario");
        setConfirmed(false);
      }
    } catch (error) {
      alert("Error de red");
      setConfirmed(false);
    } finally {
      setLoading(false);
    }
  }

  if (confirmed) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-red-400 text-xs font-semibold">¿Eliminar {username}?</span>
        <button
          onClick={deleteUser}
          disabled={loading}
          className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded font-medium transition-colors disabled:opacity-50"
        >
          {loading ? "..." : "Sí"}
        </button>
        <button
          onClick={() => setConfirmed(false)}
          className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded transition-colors"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirmed(true)}
      className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs rounded font-medium transition-colors border border-red-600/30"
      title="Eliminar usuario"
    >
      🗑️ Eliminar
    </button>
  );
}
