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

export default function PerfilClient({ username, email, role, daysLeft, createdAt, userId }: PerfilClientProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Mi Perfil</h1>
          <p className="text-gray-400 text-sm mt-1">Gestiona tu información y seguridad</p>
        </div>
        <Link
          href="/dashboard"
          className="px-4 py-2 bg-gray-700/50 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Volver
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {daysLeft <= 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-3 border border-red-500/30 bg-red-500/10 rounded-lg p-4"
          >
            <p className="text-red-300 font-semibold">Licencia vencida</p>
            <p className="text-sm text-red-200/80">Tu acceso está restringido. Contacta al administrador para renovar tu licencia y recuperar acceso.</p>
          </motion.div>
        )}
        {/* Información Principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            Información Personal
          </h2>
            
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider font-medium">Usuario</label>
              <p className="text-white font-semibold mt-1">{username}</p>
            </div>
              
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider font-medium">Email</label>
              <p className="text-gray-300 mt-1">{email || "No configurado"}</p>
            </div>
              
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider font-medium">Rol</label>
              <div className="mt-1">
                <span className={`inline-block px-3 py-1 rounded-md text-xs font-semibold ${
                  role === 'ADMIN' 
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}>
                  {role}
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider font-medium">Miembro desde</label>
              <p className="text-gray-300 mt-1">
                {new Date(createdAt).toLocaleDateString("es-MX", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Estado de Licencia */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`bg-gradient-to-br ${
            daysLeft > 30 
              ? 'from-green-500/10 to-green-600/5 border-green-500/30' 
              : daysLeft > 7 
              ? 'from-yellow-500/10 to-yellow-600/5 border-yellow-500/30' 
              : 'from-red-500/10 to-red-600/5 border-red-500/30'
          } border backdrop-blur-sm rounded-lg p-6 flex flex-col items-center justify-center text-center`}
        >
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
            daysLeft > 30 
              ? 'bg-green-500/20' 
              : daysLeft > 7 
              ? 'bg-yellow-500/20' 
              : 'bg-red-500/20'
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${
              daysLeft > 30 ? 'text-green-400' : daysLeft > 7 ? 'text-yellow-400' : 'text-red-400'
            }`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">Licencia Activa</p>
          <p className={`text-4xl font-bold mb-1 ${
            daysLeft > 30 ? 'text-green-400' : daysLeft > 7 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {daysLeft}
          </p>
          <p className="text-sm text-gray-400">días restantes</p>
        </motion.div>

        {/* Cambiar Contraseña */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-3 bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Seguridad
          </h2>
          {daysLeft <= 0 ? (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-200">
              Para cambiar la contraseña, necesitas una licencia activa. Contacta al administrador para renovar.
            </div>
          ) : (
            <ChangePasswordForm userId={userId} />
          )}
        </motion.div>
      </div>
    </div>
  );
}
