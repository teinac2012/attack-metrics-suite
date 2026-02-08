import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import SessionHeartbeat from "@/components/SessionHeartbeat";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  // Obtener licencia del usuario
  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    include: { licenses: { where: { isActive: true }, take: 1 } }
  });

  // Si no hay usuario o no tiene licencia válida, redirigir al login
  if (!user || user.licenses.length === 0) {
    redirect("/login");
  }

  const license = user.licenses[0];
  const daysLeft = license 
    ? Math.ceil((new Date(license.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  const apps = [
    {
      id: 1,
      name: "Analista Pro",
      description: "Análisis inteligente de pases y patrones tácticos con IA avanzada",
      icon: "🎯",
      href: "/apps/app1",
      color: "from-purple-500 to-purple-700"
    },
    {
      id: 2,
      name: "Attack Metrics",
      description: "Análisis completo de ataques, regates y penetraciones defensivas",
      icon: "⚡",
      href: "/apps/app2",
      color: "from-orange-500 to-orange-700"
    },
    {
      id: 3,
      name: "Data Hub",
      description: "Análisis detallado de tiros, finalización y métricas de desempeño",
      icon: "📊",
      href: "/apps/app3",
      color: "from-blue-500 to-blue-700"
    },
    {
      id: 4,
      name: "Portero",
      description: "Análisis especializado de porteros y PSxG",
      icon: "🧤",
      href: "/apps/app4",
      color: "from-emerald-500 to-teal-700"
    },
    {
      id: 5,
      name: "Attack Scout",
      description: "Comparativa de perfiles y percentiles con pizza charts",
      icon: "🍕",
      href: "/apps/app5",
      color: "from-pink-500 to-rose-700"
    }
  ];

  return (
    <div className="min-h-screen bg-[#080c14] relative overflow-hidden">
      {/* Grid pattern background */}
      <div className="absolute inset-0 bg-grid opacity-15 pointer-events-none" />
      
      {/* Efectos de fondo animados mejorados */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-600/20 to-cyan-500/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-purple-600/20 to-pink-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-amber-500/5 to-orange-500/5 rounded-full blur-[180px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      
      <SessionHeartbeat />
      <div className="container mx-auto px-4 py-12 relative z-10">
        <DashboardClient
          apps={apps}
          userName={session.user.name || "Usuario"}
          userEmail={session.user.email || null}
          userRole={(session.user as any).role}
          daysLeft={daysLeft}
          isAdmin={(session.user as any).role === "ADMIN"}
        />
      </div>
    </div>
  );
}