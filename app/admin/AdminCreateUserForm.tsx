"use client";
import { useState } from "react";

export default function AdminCreateUserForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [durationDays, setDurationDays] = useState(365);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [createdPassword, setCreatedPassword] = useState<string | null>(null);
  const [showCreatedPassword, setShowCreatedPassword] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const passwordToSend = password;
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, durationDays }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMessage({ type: 'success', text: "✅ Usuario creado correctamente" });
        setCreatedPassword(passwordToSend);
        setShowCreatedPassword(true);
        setUsername("");
        setEmail("");
        setPassword("");
        setDurationDays(365);
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setMessage({ type: 'error', text: data?.error || "❌ Error al crear usuario" });
      }
    } catch (e) {
      setMessage({ type: 'error', text: "❌ Error de red" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-xl p-6 mb-8 backdrop-blur">
      <h2 className="text-2xl font-bold text-white mb-6">➕ Crear Nuevo Usuario</h2>
      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <input 
            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors" 
            placeholder="Usuario" 
            value={username} 
            onChange={e=>setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <input 
            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors" 
            placeholder="Email (opcional)" 
            value={email} 
            onChange={e=>setEmail(e.target.value)}
            type="email"
          />
        </div>
        <div className="relative">
          <input 
            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors" 
            placeholder="Contraseña" 
            type={showPassword ? "text" : "password"} 
            value={password} 
            onChange={e=>setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
          >
            {showPassword ? "👁️" : "👁️‍🗨️"}
          </button>
        </div>
        <div>
          <input 
            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors" 
            placeholder="Días de licencia" 
            type="number" 
            min={1} 
            value={durationDays} 
            onChange={e=>setDurationDays(parseInt(e.target.value||"0",10))}
            required
          />
        </div>
        <button 
          className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed" 
          disabled={loading}
        >
          {loading ? "Creando..." : "Crear"}
        </button>
      </form>
      
      {createdPassword && (
        <div className="mt-4 px-4 py-3 rounded-lg text-sm font-medium bg-green-500/20 text-green-300 border border-green-500/30">
          <p className="mb-2">✅ Usuario creado exitosamente</p>
          <div className="flex items-center gap-2">
            <code className="px-3 py-2 bg-gray-900/50 rounded text-green-300 font-mono flex-1">
              {showCreatedPassword ? createdPassword : "•".repeat(Math.min(createdPassword.length, 12))}
            </code>
            <button
              type="button"
              onClick={() => setShowCreatedPassword(!showCreatedPassword)}
              className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded font-medium transition-colors"
            >
              {showCreatedPassword ? "Ocultar" : "Mostrar"}
            </button>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(createdPassword);
                alert("Contraseña copiada al portapapeles");
              }}
              className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded font-medium transition-colors"
            >
              📋 Copiar
            </button>
          </div>
        </div>
      )}

      {message && !createdPassword && (
        <div className={`mt-4 px-4 py-3 rounded-lg text-sm font-medium ${
          message.type === 'success' 
            ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
            : 'bg-red-500/20 text-red-300 border border-red-500/30'
        }`}>
          {message.text}
        </div>
      )}
    </div>
  );
}
