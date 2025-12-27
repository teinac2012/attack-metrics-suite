"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Analysis {
  id: string;
  appName: string;
  title: string;
  tags: string[];
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export default function AnalysisCard({ analysis }: { analysis: Analysis }) {
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();

  const appColors: Record<string, string> = {
    "IA Pases Táctico": "from-purple-500/20 to-purple-600/20 border-purple-500/30",
    "Attack Metrics": "from-orange-500/20 to-orange-600/20 border-orange-500/30",
    "Shooting Analysis": "from-cyan-500/20 to-cyan-600/20 border-cyan-500/30",
  };

  const appLinks: Record<string, string> = {
    "IA Pases Táctico": "/apps/app1",
    "Attack Metrics": "/apps/app2",
    "Shooting Analysis": "/apps/app3",
  };

  function handleLoad() {
    const link = appLinks[analysis.appName];
    if (link) {
      window.location.href = `${link}?load=${analysis.id}`;
    }
  }

  async function handleDelete() {
    if (!confirm(`¿Eliminar "${analysis.title}"?`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/analyses?id=${analysis.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert("Error al eliminar");
      }
    } catch (error) {
      alert("Error de red");
    } finally {
      setLoading(false);
    }
  }

  async function handleRename() {
    const newTitle = prompt("Nuevo nombre:", analysis.title);
    if (!newTitle || newTitle === analysis.title) return;

    setLoading(true);
    try {
      const res = await fetch("/api/analyses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: analysis.id, title: newTitle }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert("Error al renombrar");
      }
    } catch (error) {
      alert("Error de red");
    } finally {
      setLoading(false);
    }
  }

  const date = new Date(analysis.createdAt);
  const formattedDate = date.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`bg-gradient-to-br ${
        appColors[analysis.appName] || "from-gray-500/20 to-gray-600/20 border-gray-500/30"
      } border rounded-lg p-4 hover:scale-[1.02] transition-transform`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1 line-clamp-2">{analysis.title}</h3>
          <p className="text-sm text-gray-400">{analysis.appName}</p>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-white/10 rounded transition-colors"
            disabled={loading}
          >
            ⋮
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10">
              <button
                onClick={() => {
                  setShowMenu(false);
                  handleLoad();
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors rounded-t-lg"
              >
                📂 Cargar
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  handleRename();
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors"
              >
                ✏️ Renombrar
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  handleDelete();
                }}
                className="w-full text-left px-4 py-2 hover:bg-red-500/20 text-red-400 transition-colors rounded-b-lg"
              >
                🗑️ Eliminar
              </button>
            </div>
          )}
        </div>
      </div>

      {analysis.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {analysis.tags.slice(0, 3).map((tag, i) => (
            <span
              key={i}
              className="px-2 py-1 bg-white/10 rounded text-xs"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {analysis.notes && (
        <p className="text-sm text-gray-400 mb-3 line-clamp-2">{analysis.notes}</p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{formattedDate}</span>
        {loading && <span className="text-yellow-400">⏳</span>}
      </div>
    </div>
  );
}
