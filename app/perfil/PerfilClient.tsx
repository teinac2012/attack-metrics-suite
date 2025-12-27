"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import { useState } from "react";

interface PerfilClientProps {
  username: string;
  email: string | null;
  role: string;
  daysLeft: number;
  createdAt: Date;
  userId: string;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 150,
      damping: 20
    }
  }
};

export default function PerfilClient({ username, email, role, daysLeft, createdAt, userId }: PerfilClientProps) {
  return (
    <>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8 flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Mi Perfil</h1>
          <p className="text-gray-400 text-sm">Gestiona tu cuenta y configuración</p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors border border-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Volver
        </Link>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Información del Usuario */}
        <motion.div variants={item}>
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 backdrop-blur-sm">
            <h2 className="text-xl font-semibold text-white mb-5 pb-3 border-b border-gray-700/50">
              Información Personal
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1 block">Usuario</label>
                <p className="text-lg font-semibold text-white">{username}</p>
              </div>
              
              <div>
                <label className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1 block">Email</label>
                <p className="text-base text-gray-300">{email || "No configurado"}</p>
              </div>
              
              <div>
                <label className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1 block">Rol</label>
                <span className={`inline-block px-3 py-1 rounded-md text-xs font-semibold ${
                  role === 'ADMIN' 
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}>
                  {role}
                </span>
              </div>
              
              <div>
                <label className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1 block">Licencia</label>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    daysLeft > 30 ? 'bg-green-500' : daysLeft > 7 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <span className={`text-base font-semibold ${
                    daysLeft > 30 ? "text-green-400" : daysLeft > 7 ? "text-yellow-400" : "text-red-400"
                  }`}>
                    {daysLeft} días restantes
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1 block">Miembro desde</label>
                <p className="text-base text-gray-300">
                  {new Date(createdAt).toLocaleDateString("es-MX", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Cambiar Contraseña */}
        <motion.div variants={item}>
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 backdrop-blur-sm">
            <h2 className="text-xl font-semibold text-white mb-5 pb-3 border-b border-gray-700/50">
              Cambiar Contraseña
            </h2>
            <ChangePasswordForm userId={userId} />
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
  return (
    <>
      {/* Header with Enhanced Animation */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          type: "spring",
          stiffness: 100,
          damping: 20,
          duration: 0.6
        }}
        className="mb-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
      >
        <div className="space-y-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <h1 className="text-4xl sm:text-6xl font-black mb-2 relative inline-block">
              <motion.span 
                className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 inline-block"
                animate={{ 
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{ 
                  duration: 5, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
                style={{ backgroundSize: "200% 200%" }}
              >
                👤 Mi Perfil
              </motion.span>
              <motion.div 
                className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
              />
            </h1>
          </motion.div>
          <motion.p 
            className="text-gray-400 text-base sm:text-lg font-medium"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Gestiona tu cuenta y configuración
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            href="/dashboard"
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 backdrop-blur-xl text-white rounded-2xl font-bold transition-all duration-500 border border-gray-600/50 shadow-2xl hover:shadow-blue-500/25 overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20"
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            />
            <motion.svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 relative z-10" 
              viewBox="0 0 20 20" 
              fill="currentColor"
              animate={{ x: [0, -4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </motion.svg>
            <span className="relative z-10">Volver al Dashboard</span>
          </Link>
        </motion.div>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        {/* Información del Usuario - Enhanced Card */}
        <motion.div 
          variants={item} 
          className="relative group"
          whileHover={cardHover}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative overflow-hidden rounded-3xl border border-gray-700/50 group-hover:border-gray-600/70 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-2xl" />
            
            {/* Animated gradient overlay */}
            <motion.div 
              className="absolute inset-0 opacity-30"
              style={{
                background: "radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)"
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            <div className="relative p-10">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-10"
              >
                <h2 className="text-3xl font-black flex items-center gap-3 mb-2">
                  <motion.span 
                    className="text-4xl"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    📋
                  </motion.span>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    Información Personal
                  </span>
                </h2>
                <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
              </motion.div>
              
              <div className="space-y-7">
                {/* Usuario Field */}
                <motion.div 
                  className="group/field relative p-5 rounded-2xl transition-all duration-300"
                  whileHover={{ x: 8, backgroundColor: "rgba(59, 130, 246, 0.05)" }}
                  onHoverStart={() => setHoveredField("username")}
                  onHoverEnd={() => setHoveredField(null)}
                >
                  <motion.div 
                    className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: hoveredField === "username" ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                  />
                  <label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2 block">Usuario</label>
                  <motion.p 
                    className="text-3xl font-black group-hover/field:text-blue-400 transition-colors duration-300"
                    animate={{ scale: hoveredField === "username" ? 1.05 : 1 }}
                  >
                    {username}
                  </motion.p>
                </motion.div>
                
                {/* Email Field */}
                <motion.div 
                  className="group/field relative p-5 rounded-2xl transition-all duration-300"
                  whileHover={{ x: 8, backgroundColor: "rgba(168, 85, 247, 0.05)" }}
                  onHoverStart={() => setHoveredField("email")}
                  onHoverEnd={() => setHoveredField(null)}
                >
                  <motion.div 
                    className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: hoveredField === "email" ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                  />
                  <label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2 block">Email</label>
                  <motion.p 
                    className="text-xl font-semibold group-hover/field:text-purple-400 transition-colors duration-300"
                    animate={{ scale: hoveredField === "email" ? 1.05 : 1 }}
                  >
                    {email || "No configurado"}
                  </motion.p>
                </motion.div>
                
                {/* Rol Field */}
                <motion.div 
                  className="group/field relative p-5 rounded-2xl transition-all duration-300"
                  whileHover={{ x: 8, backgroundColor: "rgba(236, 72, 153, 0.05)" }}
                  onHoverStart={() => setHoveredField("role")}
                  onHoverEnd={() => setHoveredField(null)}
                >
                  <motion.div 
                    className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-pink-500 to-red-500 rounded-full"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: hoveredField === "role" ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                  />
                  <label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-3 block">Rol</label>
                  <motion.span 
                    className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl text-base font-black backdrop-blur-sm transition-all duration-300 ${
                      role === 'ADMIN' 
                        ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-2 border-purple-500/40 shadow-xl shadow-purple-500/20' 
                        : 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border-2 border-blue-500/40 shadow-xl shadow-blue-500/20'
                    }`}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.span 
                      className="text-2xl"
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                    >
                      {role === 'ADMIN' ? '👑' : '👤'}
                    </motion.span>
                    {role}
                  </motion.span>
                </motion.div>
                
                {/* Licencia Field */}
                <motion.div 
                  className="group/field relative p-5 rounded-2xl transition-all duration-300"
                  whileHover={{ x: 8, backgroundColor: daysLeft > 30 ? "rgba(34, 197, 94, 0.05)" : daysLeft > 7 ? "rgba(234, 179, 8, 0.05)" : "rgba(239, 68, 68, 0.05)" }}
                  onHoverStart={() => setHoveredField("license")}
                  onHoverEnd={() => setHoveredField(null)}
                >
                  <motion.div 
                    className={`absolute left-0 top-0 h-full w-1 rounded-full ${
                      daysLeft > 30 
                        ? 'bg-gradient-to-b from-green-500 to-emerald-500' 
                        : daysLeft > 7 
                        ? 'bg-gradient-to-b from-yellow-500 to-orange-500' 
                        : 'bg-gradient-to-b from-red-500 to-rose-500'
                    }`}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: hoveredField === "license" ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                  />
                  <label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-3 block">Estado de Licencia</label>
                  <motion.div 
                    className={`inline-flex items-center gap-4 px-6 py-4 rounded-2xl backdrop-blur-sm transition-all duration-300 ${
                      daysLeft > 30 
                        ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-2 border-green-500/40 shadow-xl shadow-green-500/20' 
                        : daysLeft > 7 
                        ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 border-2 border-yellow-500/40 shadow-xl shadow-yellow-500/20' 
                        : 'bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-300 border-2 border-red-500/40 shadow-xl shadow-red-500/20'
                    }`}
                    animate={daysLeft <= 7 ? { 
                      scale: [1, 1.05, 1],
                      boxShadow: [
                        "0 0 20px rgba(239, 68, 68, 0.2)",
                        "0 0 40px rgba(239, 68, 68, 0.4)",
                        "0 0 20px rgba(239, 68, 68, 0.2)"
                      ]
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                    whileHover={{ scale: 1.05, y: -2 }}
                  >
                    <motion.span 
                      className="text-3xl"
                      animate={daysLeft <= 7 ? { 
                        rotate: [0, -10, 10, -10, 10, 0],
                        scale: [1, 1.2, 1]
                      } : daysLeft <= 30 ? {
                        y: [0, -5, 0]
                      } : {}}
                      transition={{ duration: 1, repeat: Infinity, repeatDelay: 1 }}
                    >
                      {daysLeft > 30 ? '✅' : daysLeft > 7 ? '⚠️' : '🚨'}
                    </motion.span>
                    <div>
                      <motion.span 
                        className="font-black text-4xl block"
                        animate={{ scale: hoveredField === "license" ? 1.1 : 1 }}
                      >
                        {daysLeft}
                      </motion.span>
                      <span className="text-sm font-semibold opacity-80">días restantes</span>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Miembro desde Field */}
                <motion.div 
                  className="group/field relative p-5 rounded-2xl transition-all duration-300"
                  whileHover={{ x: 8, backgroundColor: "rgba(249, 115, 22, 0.05)" }}
                  onHoverStart={() => setHoveredField("member")}
                  onHoverEnd={() => setHoveredField(null)}
                >
                  <motion.div 
                    className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: hoveredField === "member" ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                  />
                  <label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2 block">Miembro desde</label>
                  <motion.p 
                    className="text-xl font-bold group-hover/field:text-orange-400 transition-colors duration-300"
                    animate={{ scale: hoveredField === "member" ? 1.05 : 1 }}
                  >
                    {new Date(createdAt).toLocaleDateString("es-MX", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </motion.p>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Cambiar Contraseña - Enhanced Card */}
        <motion.div 
          variants={item}
          className="relative group"
          whileHover={cardHover}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 via-red-600/20 to-rose-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative overflow-hidden rounded-3xl border border-gray-700/50 group-hover:border-gray-600/70 transition-all duration-500 h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-2xl" />
            
            {/* Animated gradient overlay */}
            <motion.div 
              className="absolute inset-0 opacity-30"
              style={{
                background: "radial-gradient(circle at 50% 50%, rgba(249, 115, 22, 0.1) 0%, transparent 50%)"
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            />
            
            <div className="relative p-10">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mb-10"
              >
                <h2 className="text-3xl font-black flex items-center gap-3 mb-2">
                  <motion.span 
                    className="text-4xl"
                    animate={{ 
                      rotate: [0, -10, 10, -10, 10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    🔐
                  </motion.span>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-400">
                    Cambiar Contraseña
                  </span>
                </h2>
                <div className="h-1 w-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full" />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, type: "spring", stiffness: 100 }}
              >
                <ChangePasswordForm userId={userId} />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
