"use client";
import { useState } from "react";

export default function AdminCreateUserForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [durationDays, setDurationDays] = useState(365);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, durationDays }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMessage("Usuario creado correctamente");
        setUsername("");
        setEmail("");
        setPassword("");
        setDurationDays(365);
        // reload to reflect changes
        setTimeout(() => window.location.reload(), 800);
      } else {
        setMessage(data?.error || "Error al crear usuario");
      }
    } catch (e) {
      setMessage("Error de red");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mb-6 p-4 bg-gray-100 rounded border border-gray-300">
      <h2 className="text-lg font-semibold mb-3">Crear nuevo usuario</h2>
      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-2">
        <input className="p-2 border rounded" placeholder="Usuario" value={username} onChange={e=>setUsername(e.target.value)} />
        <input className="p-2 border rounded" placeholder="Email (opcional)" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="p-2 border rounded" placeholder="Contraseña" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <input className="p-2 border rounded" placeholder="Días de licencia" type="number" min={1} value={durationDays} onChange={e=>setDurationDays(parseInt(e.target.value||"0",10))} />
        <button className="p-2 bg-blue-600 text-white rounded" disabled={loading}>{loading? "Creando..." : "Crear"}</button>
      </form>
      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  );
}
