import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import AnalysisCard from "@/components/AnalysisCard";
import SessionHeartbeat from "@/components/SessionHeartbeat";

export default async function HistorialPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  const userId = (session.user as any).id;
  
  // Obtener análisis del usuario
  const analyses = await prisma.analysis.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Estadísticas
  const totalAnalyses = analyses.length;
  const byApp = analyses.reduce((acc: any, a) => {
    acc[a.appName] = (acc[a.appName] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#080c14] text-white relative overflow-hidden">
      {/* Grid pattern background */}
      <div className="absolute inset-0 bg-grid opacity-15 pointer-events-none" />
      
      {/* Efectos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -left-1/4 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px]" />
        <div className="absolute -bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[120px]" />
      </div>
      
      <SessionHeartbeat />
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-gradient">📊 Historial de Análisis</h1>
            <p className="text-gray-400">Gestiona tus análisis guardados</p>
          </div>
          <Link
            href="/dashboard"
            className="btn-secondary flex items-center gap-2"
          >
            ← Volver
          </Link>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card-premium group hover:scale-[1.02] transition-transform">
            <p className="text-gray-400 text-sm mb-1">Total Análisis</p>
            <p className="text-3xl font-bold text-blue-400 group-hover:text-glow">{totalAnalyses}</p>
          </div>
          <div className="card-premium group hover:scale-[1.02] transition-transform">
            <p className="text-gray-400 text-sm mb-1">IA Pases</p>
            <p className="text-3xl font-bold text-purple-400 group-hover:text-glow">{byApp["IA Pases Táctico"] || 0}</p>
          </div>
          <div className="card-premium group hover:scale-[1.02] transition-transform">
            <p className="text-gray-400 text-sm mb-1">Attack Metrics</p>
            <p className="text-3xl font-bold text-orange-400 group-hover:text-glow">{byApp["Attack Metrics"] || 0}</p>
          </div>
          <div className="card-premium group hover:scale-[1.02] transition-transform">
            <p className="text-gray-400 text-sm mb-1">Shooting</p>
            <p className="text-3xl font-bold text-cyan-400 group-hover:text-glow">{byApp["Shooting Analysis"] || 0}</p>
          </div>
        </div>

        {/* Lista de Análisis */}
        <div className="card-premium">
          {analyses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg mb-4">No tienes análisis guardados aún</p>
              <Link
                href="/dashboard"
                className="btn-primary inline-flex items-center gap-2"
              >
                Crear Primer Análisis
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analyses.map((analysis) => (
                <AnalysisCard key={analysis.id} analysis={analysis} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
