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
