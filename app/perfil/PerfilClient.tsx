"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import ChangePasswordForm from "@/components/ChangePasswordForm";

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
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function PerfilClient({ username, email, role, daysLeft, createdAt, userId }: PerfilClientProps) {
  return (
    <>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <motion.h1 
            className="text-4xl sm:text-5xl font-extrabold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            👤 Mi Perfil
          </motion.h1>
          <motion.p 
            className="text-gray-400 text-base sm:text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Gestiona tu cuenta y configuración
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Link
            href="/dashboard"
            className="group relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-800/90 to-gray-700/90 backdrop-blur-sm hover:from-gray-700/90 hover:to-gray-600/90 text-white rounded-xl font-semibold transition-all duration-300 border border-gray-600/50 hover:border-gray-500/70 shadow-lg hover:shadow-xl hover:scale-105 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Volver
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-purple-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          </Link>
        </motion.div>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Información del Usuario */}
        <motion.div variants={item} className="relative overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-md" />
          <div className="absolute inset-0 border border-gray-700/50 rounded-2xl" />
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />
          
          <div className="relative p-8">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <span className="text-blue-400">📋</span>
              Información Personal
            </h2>
            
            <div className="space-y-6">
              <motion.div 
                className="group"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <label className="text-sm text-gray-500 font-medium">Usuario</label>
                <p className="text-2xl font-bold mt-1 group-hover:text-blue-400 transition-colors">{username}</p>
              </motion.div>
              
              <motion.div 
                className="group"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <label className="text-sm text-gray-500 font-medium">Email</label>
                <p className="text-xl mt-1 group-hover:text-purple-400 transition-colors">{email || "No configurado"}</p>
              </motion.div>
              
              <motion.div 
                className="group"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <label className="text-sm text-gray-500 font-medium">Rol</label>
                <div className="mt-2">
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold backdrop-blur-sm ${
                    role === 'ADMIN' 
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-lg shadow-purple-500/10' 
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow-lg shadow-blue-500/10'
                  }`}>
                    {role === 'ADMIN' ? '👑' : '👤'} {role}
                  </span>
                </div>
              </motion.div>
              
              <motion.div 
                className="group"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <label className="text-sm text-gray-500 font-medium">Licencia</label>
                <div className="mt-3">
                  <motion.div 
                    className={`inline-flex items-center gap-3 px-5 py-3 rounded-xl backdrop-blur-sm ${
                      daysLeft > 30 
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30 shadow-lg shadow-green-500/10' 
                        : daysLeft > 7 
                        ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 shadow-lg shadow-yellow-500/10' 
                        : 'bg-red-500/20 text-red-300 border border-red-500/30 shadow-lg shadow-red-500/10'
                    }`}
                    animate={daysLeft <= 7 ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <span className="text-2xl">
                      {daysLeft > 30 ? '✅' : daysLeft > 7 ? '⚠️' : '🚨'}
                    </span>
                    <div>
                      <span className="font-bold text-2xl">{daysLeft}</span>
                      <span className="ml-2 text-sm">días restantes</span>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              <motion.div 
                className="group"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <label className="text-sm text-gray-500 font-medium">Miembro desde</label>
                <p className="text-xl mt-1 group-hover:text-orange-400 transition-colors">
                  {new Date(createdAt).toLocaleDateString("es-MX", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Cambiar Contraseña */}
        <motion.div variants={item}>
          <div className="relative overflow-hidden rounded-2xl h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-md" />
            <div className="absolute inset-0 border border-gray-700/50 rounded-2xl" />
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-orange-500/5 via-transparent to-red-500/5 pointer-events-none" />
            
            <div className="relative p-8">
              <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                <span className="text-orange-400">🔐</span>
                Cambiar Contraseña
              </h2>
              <ChangePasswordForm userId={userId} />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
