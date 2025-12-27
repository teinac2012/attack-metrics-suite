"use client";
import { motion } from "framer-motion";
import Link from "next/link";

interface AdminClientProps {
  totalUsers: number;
  onlineUsers: number;
  activeLicenses: number;
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
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15
    }
  }
};

export default function AdminClient({ totalUsers, onlineUsers, activeLicenses }: AdminClientProps) {
  return (
    <>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          type: "spring" as const,
          stiffness: 100,
          damping: 20
        }}
        className="mb-12"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
          <div className="space-y-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: "spring" as const, stiffness: 200 }}
            >
              <h1 className="text-4xl sm:text-6xl font-black mb-2 relative inline-block">
                <motion.span 
                  className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 inline-block"
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
                  ⚡ Admin Panel
                </motion.span>
                <motion.div 
                  className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-full"
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
              transition={{ delay: 0.4 }}
            >
              Gestiona usuarios, licencias y sistema
            </motion.p>
          </div>
          
          <motion.div 
            className="flex gap-3"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: "spring" as const, stiffness: 200 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/admin/logs"
                className="group relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 backdrop-blur-xl text-white rounded-2xl font-bold transition-all duration-500 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                />
                <span className="relative z-10 text-xl">📋</span>
                <span className="relative z-10">Logs</span>
              </Link>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/dashboard"
                className="group relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 backdrop-blur-xl text-white rounded-2xl font-bold transition-all duration-500 shadow-lg hover:shadow-blue-500/25 overflow-hidden"
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
                <span className="relative z-10">Dashboard</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats Cards */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Total Users */}
          <motion.div 
            variants={item}
            whileHover={{ scale: 1.03, y: -5 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-cyan-600/30 to-blue-600/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative overflow-hidden rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-cyan-600/10 backdrop-blur-xl p-6 transition-all duration-300">
              <motion.div 
                className="absolute top-0 right-0 text-8xl opacity-5"
                animate={{ rotate: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                👥
              </motion.div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <motion.span 
                    className="text-3xl"
                    whileHover={{ scale: 1.2, rotate: 10 }}
                  >
                    👥
                  </motion.span>
                  <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">Total Usuarios</p>
                </div>
                <motion.p 
                  className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" as const, stiffness: 200 }}
                >
                  {totalUsers}
                </motion.p>
              </div>
            </div>
          </motion.div>

          {/* Online Users */}
          <motion.div 
            variants={item}
            whileHover={{ scale: 1.03, y: -5 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-600/30 via-emerald-600/30 to-green-600/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative overflow-hidden rounded-2xl border border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-600/10 backdrop-blur-xl p-6 transition-all duration-300">
              <motion.div 
                className="absolute top-0 right-0 text-8xl opacity-5"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🟢
              </motion.div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <motion.span 
                    className="text-3xl"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    🟢
                  </motion.span>
                  <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">En Línea</p>
                </div>
                <motion.p 
                  className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-400"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: "spring" as const, stiffness: 200 }}
                >
                  {onlineUsers}
                </motion.p>
              </div>
            </div>
          </motion.div>

          {/* Active Licenses */}
          <motion.div 
            variants={item}
            whileHover={{ scale: 1.03, y: -5 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/30 via-pink-600/30 to-purple-600/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-600/10 backdrop-blur-xl p-6 transition-all duration-300">
              <motion.div 
                className="absolute top-0 right-0 text-8xl opacity-5"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                ✨
              </motion.div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <motion.span 
                    className="text-3xl"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    ✨
                  </motion.span>
                  <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">Licencias Activas</p>
                </div>
                <motion.p 
                  className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7, type: "spring" as const, stiffness: 200 }}
                >
                  {activeLicenses}
                </motion.p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  );
}
