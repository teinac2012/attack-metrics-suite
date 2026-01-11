'use client';

import { useState } from 'react';
import Image from 'next/image';

interface HeatmapResult {
  team_heatmap: string;
  player_heatmaps: Record<string, string>;
  player_stats: Record<string, { actions: number; avg_x: number; avg_y: number }>;
}

export default function HeatmapGenerator() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<HeatmapResult | null>(null);
  const [selectedFile, setSelectedFile] = useState('AttackMetrics_RINCONADA_vs_ALCALA_20260109.json');
  const [team, setTeam] = useState('HOME');

  const generateHeatmaps = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/heatmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonFile: `public/${selectedFile}`,
          team,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Error generating heatmaps');
      }

      const data: HeatmapResult = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1>Football Heatmap Generator</h1>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label>
            JSON File:
            <input
              type="text"
              value={selectedFile}
              onChange={(e) => setSelectedFile(e.target.value)}
              style={{ marginLeft: '10px', padding: '5px', width: '400px' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>
            Team:
            <select
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              style={{ marginLeft: '10px', padding: '5px' }}
            >
              <option>HOME</option>
              <option>AWAY</option>
            </select>
          </label>
        </div>

        <button
          onClick={generateHeatmaps}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Generating...' : 'Generate Heatmaps'}
        </button>
      </div>

      {error && (
        <div style={{ padding: '15px', backgroundColor: '#fee', color: '#c00', borderRadius: '4px', marginBottom: '20px' }}>
          Error: {error}
        </div>
      )}

      {result && (
        <div>
          {/* Team Heatmap */}
          <section style={{ marginBottom: '40px' }}>
            <h2>Team Heatmap</h2>
            {result.team_heatmap ? (
              <img
                src={`data:image/png;base64,${result.team_heatmap}`}
                alt="Team Heatmap"
                style={{ maxWidth: '100%', height: 'auto', border: '1px solid #ddd' }}
              />
            ) : (
              <p>No team heatmap available</p>
            )}
          </section>

          {/* Player Heatmaps */}
          <section>
            <h2>Player Heatmaps</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
              {Object.entries(result.player_heatmaps).map(([player, base64]) => (
                <div key={player} style={{ border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ padding: '10px', backgroundColor: '#f9f9f9' }}>
                    <h3 style={{ margin: 0 }}>{player}</h3>
                    <p style={{ margin: '5px 0 0 0', fontSize: '0.9em', color: '#666' }}>
                      Actions: {result.player_stats[player]?.actions || 'N/A'} | 
                      Avg Position: ({(result.player_stats[player]?.avg_x || 0).toFixed(1)}, {(result.player_stats[player]?.avg_y || 0).toFixed(1)})
                    </p>
                  </div>
                  <img
                    src={`data:image/png;base64,${base64}`}
                    alt={`${player} Heatmap`}
                    style={{ width: '100%', display: 'block' }}
                  />
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
