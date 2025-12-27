"use client";
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const onSubmit = async (e: React.FormEvent) => { e.preventDefault(); setLoading(true); setError(''); const res = await signIn('credentials', { username, password, redirect: false }); setLoading(false); if (res?.ok) window.location.href = '/dashboard'; else setError('Credenciales inválidas o licencia expirada.'); };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="w-full max-w-sm bg-gray-800 p-6 rounded-xl shadow">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Iniciar Sesión</h1>
          <Link href="/admin" className="text-sm text-blue-400 hover:underline">Admin Access</Link>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <input className="w-full p-2 rounded bg-gray-700" placeholder="Usuario" value={username} onChange={e=>setUsername(e.target.value)} />
          <input type="password" className="w-full p-2 rounded bg-gray-700" placeholder="Contraseña" value={password} onChange={e=>setPassword(e.target.value)} />
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded">{loading? 'Accediendo...' : 'Entrar'}</button>
        </form>
      </div>
    </div>
  );
}
