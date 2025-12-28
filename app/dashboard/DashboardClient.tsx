"use client";
import { motion } from "framer-motion";
import Link from "next/link";

interface App {
  id: number;
  name: string;
  description: string;
  icon: string;
  href: string;
  color: string;
}

interface DashboardClientProps {
  apps: App[];
  userName: string;
  userEmail: string | null;
  userRole: string;
  daysLeft: number;
  isAdmin: boolean;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { 
    y: 0, 
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100
    }
  }
};

export default function DashboardClient({ 
  apps, 
  userName, 
  userEmail, 
  userRole, 
  daysLeft,
  isAdmin 
}: DashboardClientProps) {
  return (
    <>
      {/* Alerta de Licencia Compacta y Profesional */}
      {daysLeft <= 7 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm"
          style={{
            borderColor: daysLeft > 3 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)',
            backgroundColor: daysLeft > 3 ? 'rgba(245, 158, 11, 0.08)' : 'rgba(239, 68, 68, 0.08)'
          }}
        >
          <svg className="h-5 w-5 flex-shrink-0" style={{color: daysLeft > 3 ? '#fbbf24' : '#ef4444'}} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{color: daysLeft > 3 ? '#f59e0b' : '#ef4444'}}>
              Licencia por vencer en {daysLeft} día{daysLeft !== 1 ? 's' : ''}
            </p>
            <p className="text-xs opacity-80">Contacta al administrador para renovarla</p>
          </div>
        </motion.div>
      )}

      {/* Header con animación */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12 flex items-center justify-between"
      >
        <div>
          <motion.h1 
            className="text-5xl font-extrabold text-white mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            Attack Métrics Hub
          </motion.h1>
          <motion.p 
            className="text-gray-400 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Bienvenido, <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 font-semibold">{userName}</span>
          </motion.p>
          
          {/* Badge de Licencia mejorado */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-4"
          >
            <div className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl backdrop-blur-sm ${
              daysLeft > 30 
                ? 'bg-green-500/20 text-green-300 border border-green-500/30 shadow-lg shadow-green-500/10' 
                : daysLeft > 7 
                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 shadow-lg shadow-yellow-500/10' 
                : 'bg-red-500/20 text-red-300 border border-red-500/30 shadow-lg shadow-red-500/10'
            }`}>
              <span className="text-lg">📅</span>
              <span className="font-semibold">Licencia:</span> 
              <span className="font-bold">{daysLeft} días</span>
            </div>
          </motion.div>
        </div>

        {/* Botones de navegación mejorados */}
        <motion.div 
          className="flex gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Link
            href="/perfil"
            className="group relative px-5 py-2.5 bg-gray-800/80 backdrop-blur-sm hover:bg-gray-700/80 text-white rounded-xl font-medium transition-all duration-300 border border-gray-700/50 hover:border-gray-600/50 hover:shadow-lg hover:shadow-gray-700/20 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              👤 Perfil
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-gray-600/0 via-gray-600/20 to-gray-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          </Link>
          
          {isAdmin && (
            <Link
              href="/admin"
              className="group relative px-5 py-2.5 bg-gradient-to-r from-purple-600/90 to-purple-700/90 backdrop-blur-sm hover:from-purple-500 hover:to-purple-600 text-white rounded-xl font-medium transition-all duration-300 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-105 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                🔧 Panel Admin
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </Link>
          )}
          
          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              className="group relative px-5 py-2.5 bg-gray-800/80 backdrop-blur-sm hover:bg-red-600/80 text-white rounded-xl font-medium transition-all duration-300 border border-gray-700/50 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/20 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                🚪 Cerrar Sesión
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/20 to-red-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </button>
          </form>
        </motion.div>
      </motion.div>

      {/* Apps Grid con animaciones */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
      >
        {apps.map((app) => (
          <motion.div key={app.id} variants={item}>
            <Link
              href={app.href}
              className="group relative block overflow-hidden rounded-2xl transition-all duration-500 hover:scale-[1.02]"
            >
              {/* Fondo con glassmorphism */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-md" />
              
              {/* Efecto de brillo en hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${app.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
              
              {/* Borde animado */}
              <div className="absolute inset-0 rounded-2xl border border-gray-700/50 group-hover:border-gray-600/80 transition-colors duration-300" />
              
              {/* Contenido */}
              <div className="relative p-8">
                <div className="flex items-start gap-5 mb-6">
                  <motion.div 
                    className="text-6xl"
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {app.icon}
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all duration-300">
                      {app.name}
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      {app.description}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                  <span className="text-sm text-gray-500 font-medium">
                    Abrir herramienta
                  </span>
                  <motion.svg
                    className="w-6 h-6 text-gray-500 group-hover:text-orange-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </motion.svg>
                </div>
              </div>

              {/* Efecto de resplandor en la esquina */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Footer Info modernizado */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="relative overflow-hidden rounded-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-md" />
        <div className="relative border border-gray-700/50 rounded-2xl p-8 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Estado de tu Cuenta
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group">
              <p className="text-gray-500 text-sm mb-2 font-medium">Usuario</p>
              <p className="text-white font-semibold text-lg group-hover:text-orange-400 transition-colors">{userName}</p>
            </div>
            <div className="group">
              <p className="text-gray-500 text-sm mb-2 font-medium">Email</p>
              <p className="text-white font-semibold text-lg group-hover:text-orange-400 transition-colors">{userEmail || "No especificado"}</p>
            </div>
            <div className="group">
              <p className="text-gray-500 text-sm mb-2 font-medium">Rol</p>
              <p className="text-white font-semibold text-lg group-hover:text-orange-400 transition-colors">
                {userRole === "ADMIN" ? "👑 Administrador" : "👤 Usuario"}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
