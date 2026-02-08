"use client";
import { useState } from "react";
import { signOut } from "next-auth/react";

export default function ChangePasswordForm({ userId }: { userId: string }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        
        // Llamar al endpoint de logout que limpia el session lock
        setTimeout(async () => {
          await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
          window.location.href = "/login";
        }, 2000);
      } else {
        setError(data.error || "Error al cambiar contraseña");
      }
    } catch (error) {
      setError("Error de red");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="bg-green-500/15 border border-green-500/40 rounded-xl p-6 text-center animate-fade-in">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-500/20 flex items-center justify-center">
          <span className="text-2xl">✅</span>
        </div>
        <p className="text-green-300 font-semibold mb-2">Contraseña actualizada</p>
        <p className="text-sm text-gray-400">Redirigiendo al login...</p>
        <div className="mt-4 w-full h-1 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 rounded-full animate-pulse" style={{width: '100%'}}></div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-500/15 border border-red-500/40 rounded-xl p-4 text-red-300 text-sm flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Contraseña Actual</label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="input-premium"
          placeholder="••••••••"
          required
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Nueva Contraseña</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="input-premium"
          placeholder="Mínimo 6 caracteres"
          required
          disabled={loading}
          minLength={6}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Confirmar Nueva Contraseña</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="input-premium"
          placeholder="Repite la nueva contraseña"
          required
          disabled={loading}
          minLength={6}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="spinner"></span>
            Cambiando...
          </span>
        ) : (
          "🔐 Cambiar Contraseña"
        )}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Después de cambiar tu contraseña, deberás iniciar sesión nuevamente
      </p>
    </form>
  );
}
