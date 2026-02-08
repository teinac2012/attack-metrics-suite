"use client";
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';

export default function LoginClient() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [licenseExpired, setLicenseExpired] = useState(false);
  const contactEmail = (process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'admin@attack.com');

  const onSubmit = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    if (!username || !password) {
      toast.error('Por favor, introduce usuario y contraseña', {
        style: { background: '#1f2937', color: '#fff' },
        iconTheme: { primary: '#ef4444', secondary: '#fff' }
      });
      return;
    }
    setLoading(true);
    
    // Validar credenciales
    try {
      const validateRes = await fetch('/api/validate-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const validateData = await validateRes.json();
      
      if (!validateRes.ok) {
        const errorCode = validateData?.code || '';
        const errorMsg = validateData?.error || '';
        
        if (errorCode === 'NO_LICENSE') {
          setLicenseExpired(true);
          toast.error('Tu periodo ha terminado. Contacta para renovar.', {
            style: { background: '#1f2937', color: '#fff' },
            duration: 4000
          });
        } else if (errorCode === 'DEVICE_ALREADY_ACTIVE') {
          toast.error('Ya hay un dispositivo activo en esta cuenta.', {
            style: { background: '#1f2937', color: '#fff' },
            duration: 4000
          });
        } else if (errorCode === 'INVALID_CREDENTIALS') {
          toast.error('Usuario o contraseña incorrecta', {
            style: { background: '#1f2937', color: '#fff' }
          });
        } else {
          toast.error(errorMsg || 'Error al validar credenciales', {
            style: { background: '#1f2937', color: '#fff' }
          });
        }
        
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error('Validation error:', err);
      toast.error('Error al validar credenciales', {
        style: { background: '#1f2937', color: '#fff' }
      });
      setLoading(false);
      return;
    }
    
    // Limpiar sesión previa
    try {
      await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    } catch {}
    
    const res = await signIn('credentials', { username, password, redirect: false }); 
    setLoading(false); 
    
    if (res?.ok && !res?.error) {
      toast.success('¡Bienvenido!', {
        style: { background: '#1f2937', color: '#fff' },
        iconTheme: { primary: '#10b981', secondary: '#fff' }
      });
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 800);
    } else {
      toast.error('Usuario o contraseña incorrecta', {
        style: { background: '#1f2937', color: '#fff' }
      });
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen flex items-center justify-center bg-[#080c14] text-white p-4 relative overflow-hidden">
        {/* Grid pattern background */}
        <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
        
        {/* Animated background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute top-0 -left-24 w-[500px] h-[500px] bg-gradient-to-br from-blue-600/30 to-cyan-500/20 rounded-full blur-[100px]"
            animate={{ 
              x: [0, 80, 0],
              y: [0, 40, 0],
              scale: [1, 1.15, 1]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-0 -right-24 w-[500px] h-[500px] bg-gradient-to-br from-purple-600/30 to-pink-500/20 rounded-full blur-[100px]"
            animate={{ 
              x: [0, -80, 0],
              y: [0, -40, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-[120px]"
            animate={{ 
              scale: [1, 1.3, 1],
              rotate: [0, 90, 0]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <motion.div 
          className="w-full max-w-md relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Logo/Title */}
          <motion.div 
            className="text-center mb-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <motion.h1 
              className="text-5xl font-black mb-3 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500"
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{ duration: 5, repeat: Infinity }}
              style={{ backgroundSize: '200% 200%' }}
            >
              Attack Métrics Hub
            </motion.h1>
            <motion.p 
              className="text-gray-400 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Plataforma de Análisis Profesional
            </motion.p>
          </motion.div>

          {/* Login Card */}
          <motion.div 
            className="relative overflow-hidden rounded-3xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {/* Glass effect background */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl" />
            <div className="absolute inset-0 border border-gray-700/50 rounded-3xl" />
            
            {/* Shine effect */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
            
            <div className="relative p-8">
              {licenseExpired && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 flex items-start gap-3 p-3 rounded-lg bg-red-500/15 border border-red-500/30 backdrop-blur-sm"
                >
                  <svg className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <p className="font-semibold text-red-300 text-sm">Licencia vencida</p>
                    <p className="text-xs text-red-200/70 mt-1">Contacta para renovar tu acceso</p>
                    <a href={`mailto:${contactEmail}?subject=Renovación%20de%20licencia`} className="text-xs text-red-400 hover:text-red-300 mt-2 inline-block underline">
                      {contactEmail}
                    </a>
                  </div>
                </motion.div>
              )}
              <h2 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                Iniciar Sesión
              </h2>
              
              <form onSubmit={onSubmit} className="space-y-6">
                {/* Usuario */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Usuario
                  </label>
                  <div className="relative group">
                    <input 
                      className="w-full px-4 py-3 rounded-xl bg-gray-900/60 border border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 backdrop-blur-sm" 
                      placeholder="Introduce tu usuario" 
                      value={username} 
                      onChange={e=>setUsername(e.target.value)}
                      required
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                </motion.div>

                {/* Contraseña */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Contraseña
                  </label>
                  <div className="relative group">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      className="w-full px-4 py-3 rounded-xl bg-gray-900/60 border border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 backdrop-blur-sm pr-12" 
                      placeholder="Introduce tu contraseña" 
                      value={password} 
                      onChange={e=>setPassword(e.target.value)}
                      required
                    />
                    <motion.button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors text-xl"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {showPassword ? "👁️" : "👁️‍🗨️"}
                    </motion.button>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                </motion.div>

                {/* Login Button */}
                <motion.button 
                  type="submit"
                  disabled={loading || !username || !password} 
                  className="relative w-full px-4 py-3.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          ⏳
                        </motion.span>
                        Accediendo...
                      </>
                    ) : (
                      <>
                        ✓ Entrar
                      </>
                    )}
                  </span>
                  {!loading && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div 
            className="text-center mt-8 text-gray-500 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <p>© 2025 Attack Métrics Hub. Todos los derechos reservados.</p>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}
