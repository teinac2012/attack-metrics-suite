"use client";
import { useState } from 'react';
import { signIn, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('error');
  // No redirigimos automáticamente si hay sesión; permitimos reautenticación

  const onSubmit = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    if (!username || !password) {
      setError('Por favor, introduce usuario y contraseña.');
      setToastType('warning');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }
    setLoading(true);
    setError(''); 
    setShowToast(false);
    
    // Mostrar mensaje de procesando
    setError('Verificando credenciales...');
    setToastType('info');
    setShowToast(true);
    
    // Asegurar que se invalida la sesión previa antes de autenticar de nuevo
    try { await signOut({ redirect: false }); } catch {}
    const res = await signIn('credentials', { username, password, redirect: false }); 
    setLoading(false); 
    
    if (res?.ok) {
      setError('✓ Inicio de sesión correcto');
      setToastType('success');
      setShowToast(true);
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    } else {
      // Determinar el tipo de error basado en el mensaje de error de NextAuth
      const errorMsg = res?.error || '';
      
      if (errorMsg.includes('licencia')) {
        setError('⚠️ No tienes una licencia activa. Contacta al administrador.');
        setToastType('warning');
      } else if (errorMsg.includes('dispositivo') || errorMsg.includes('session') || errorMsg.includes('device')) {
        setError('⚠️ Ya hay un dispositivo activo en esta cuenta');
        setToastType('warning');
      } else if (errorMsg.includes('Credenciales')) {
        setError('⚠️ Por favor, completa usuario y contraseña');
        setToastType('warning');
      } else {
        setError('⚠️ Usuario o contraseña no válida');
        setToastType('error');
      }
      
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4">
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Attack Metrics Suite</h1>
          <p className="text-gray-400">Plataforma de Análisis de Partidos</p>
        </div>

        {/* Login Card */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 backdrop-blur">
          <h2 className="text-2xl font-bold mb-6">Iniciar Sesión</h2>
          
          <form onSubmit={onSubmit} className="space-y-4">
            {/* Usuario */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Usuario</label>
              <input 
                className="w-full px-4 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors" 
                placeholder="Tu usuario" 
                value={username} 
                onChange={e=>setUsername(e.target.value)}
                required
              />
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Contraseña</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="w-full px-4 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors" 
                  placeholder="Tu contraseña" 
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
            </div>

            {/* Mensaje de error (se muestra como toast abajo a la derecha) */}

            {/* Login Button */}
            <button 
              disabled={loading || !username || !password} 
              className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Accediendo...' : '✓ Entrar'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-500 text-sm">
          <p>© 2025 Attack Metrics Suite. Todos los derechos reservados.</p>
        </div>
      </div>
      {/* Toast dinámico abajo a la derecha */}
      {showToast && (
        <div className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg text-white shadow-lg transition-all duration-300 ${
          toastType === 'success' ? 'bg-green-600/90' :
          toastType === 'warning' ? 'bg-yellow-600/90' :
          toastType === 'info' ? 'bg-blue-600/90' :
          'bg-red-600/90'
        }`}>
          <span className="font-semibold">
            {toastType === 'success' ? '✓ ' :
             toastType === 'warning' ? '⚠️ ' :
             toastType === 'info' ? 'ℹ️ ' :
             '⚠️ '}
          </span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
