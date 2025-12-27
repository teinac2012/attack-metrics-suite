"use client";
import { useState } from "react";

export default function ResetPasswordButton({ userId, username }: { userId: string; username: string }) {
  const [showModal, setShowModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newPassword }),
      });
      
      if (res.ok) {
        // Guardar en localStorage
        localStorage.setItem(`password:${userId}`, newPassword);
        alert("✅ Contraseña actualizada correctamente");
        setShowModal(false);
        setNewPassword("");
        window.location.reload();
      } else {
        const data = await res.json();
        alert("❌ Error: " + (data?.error || "Error al actualizar contraseña"));
      }
    } catch (err) {
      alert("❌ Error de red");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-3 py-1 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-600/50 text-yellow-300 rounded transition-colors text-sm"
        title="Cambiar contraseña"
      >
        🔑 Resetear
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">
              Cambiar contraseña de <span className="text-blue-400">{username}</span>
            </h3>
            
            <form onSubmit={handleReset} className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nueva contraseña
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-10 text-gray-400 hover:text-gray-200 transition-colors"
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? "⏳ Guardando..." : "✓ Cambiar"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setNewPassword("");
                  }}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
