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

  const license = user?.licenses[0];
  const daysLeft = license 
    ? Math.ceil((new Date(license.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  const apps = [
    {
      id: 1,
      name: "IA Pases Táctico",
      description: "Analista Pro v5.5 - Análisis inteligente de pases y patrones tácticos",
      icon: "🎯",
      href: "/apps/app1",
      color: "from-purple-500 to-purple-700"
    },
    {
      id: 2,
      name: "Attack Metrics",
      description: "v3.1 - Análisis completo de ataques, regates y penetraciones",
      icon: "⚡",
      href: "/apps/app2",
      color: "from-orange-500 to-orange-700"
    },
    {
      id: 3,
      name: "Shooting Analysis",
      description: "Pro Scout v18 - Análisis detallado de tiros y finalización",
      icon: "🎯",
      href: "/apps/app3",
      color: "from-blue-500 to-blue-700"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Efectos de fondo animados */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
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