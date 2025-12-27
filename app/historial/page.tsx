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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <SessionHeartbeat />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">📊 Historial de Análisis</h1>
            <p className="text-gray-400">Gestiona tus análisis guardados</p>
          </div>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            ← Volver
          </Link>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Total Análisis</p>
            <p className="text-3xl font-bold text-blue-400">{totalAnalyses}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">IA Pases</p>
            <p className="text-3xl font-bold text-purple-400">{byApp["IA Pases Táctico"] || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Attack Metrics</p>
            <p className="text-3xl font-bold text-orange-400">{byApp["Attack Metrics"] || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border border-cyan-500/20 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Shooting</p>
            <p className="text-3xl font-bold text-cyan-400">{byApp["Shooting Analysis"] || 0}</p>
          </div>
        </div>

        {/* Lista de Análisis */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
          {analyses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg mb-4">No tienes análisis guardados aún</p>
              <Link
                href="/dashboard"
                className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
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
