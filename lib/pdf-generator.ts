export interface MatchAction {
  x: number;
  y: number;
  type: string;
  player: string;
  team: string;
}

export interface MatchData {
  config: {
    homeName: string;
    awayName: string;
  };
  actions: MatchAction[];
}

export function generateHTMLReport(matchData: MatchData): string {
  const homeActions = matchData.actions.filter(a => a.team === 'HOME');
  
  // Calcular estadísticas
  const totalActions = homeActions.length;
  const uniquePlayers = new Set(homeActions.map(a => a.player)).size;
  const actionCounts = homeActions.reduce((acc, a) => {
    acc[a.type] = (acc[a.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topActionEntry = Object.entries(actionCounts).sort((a, b) => b[1] - a[1])[0];
  const topAction = topActionEntry ? topActionEntry[0] : 'N/A';
  
  const playerCounts = homeActions.reduce((acc, a) => {
    acc[a.player] = (acc[a.player] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topPlayers = Object.entries(playerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: Arial, sans-serif; 
      background: #0a0a0a; 
      color: white;
    }
    .page {
      width: 210mm;
      height: 297mm;
      padding: 20mm;
      page-break-after: always;
      position: relative;
    }
    .title { 
      font-size: 32px; 
      font-weight: bold; 
      color: #4CAF50; 
      text-align: center;
      margin-bottom: 10px;
    }
    .subtitle { 
      font-size: 24px; 
      text-align: center;
      margin-bottom: 5px;
    }
    .date { 
      font-size: 12px; 
      color: #888; 
      text-align: center;
      margin-bottom: 30px;
    }
    .metrics {
      display: flex;
      justify-content: space-around;
      margin-bottom: 30px;
    }
    .metric-box {
      background: #1e1e1e;
      border: 2px solid #4CAF50;
      border-radius: 10px;
      padding: 20px;
      text-align: center;
      width: 30%;
    }
    .metric-label {
      font-size: 12px;
      color: #ccc;
      margin-bottom: 10px;
    }
    .metric-value {
      font-size: 24px;
      color: #4CAF50;
      font-weight: bold;
    }
    .section-title {
      font-size: 18px;
      font-weight: bold;
      margin: 20px 0 10px 0;
    }
    .player-list {
      background: #1a1a1a;
      border: 1px solid #2196F3;
      border-radius: 10px;
      padding: 15px;
    }
    .player-item {
      display: flex;
      justify-content: space-between;
      padding: 10px;
      margin: 5px 0;
      background: #2a2a2a;
      border-radius: 5px;
    }
    .player-name {
      color: white;
    }
    .player-count {
      color: #4CAF50;
      font-weight: bold;
    }
    canvas {
      display: block;
      margin: 20px auto;
      border: 2px solid #4CAF50;
      border-radius: 10px;
    }
    .page-2-title {
      font-size: 24px;
      font-weight: bold;
      color: #4CAF50;
      text-align: center;
      margin-bottom: 10px;
    }
    .footer {
      position: absolute;
      bottom: 15mm;
      left: 0;
      right: 0;
      text-align: center;
      color: #666;
      font-size: 10px;
    }
  </style>
</head>
<body>
  <!-- PÁGINA 1: PORTADA -->
  <div class="page">
    <div class="title">INFORME DE ANALISIS</div>
    <div class="subtitle">${matchData.config.homeName.toUpperCase()} vs ${matchData.config.awayName.toUpperCase()}</div>
    <div class="date">${new Date().toLocaleDateString('es-ES')}</div>
    
    <div class="metrics">
      <div class="metric-box">
        <div class="metric-label">Total Acciones</div>
        <div class="metric-value">${totalActions}</div>
      </div>
      <div class="metric-box">
        <div class="metric-label">Jugadores</div>
        <div class="metric-value">${uniquePlayers}</div>
      </div>
      <div class="metric-box">
        <div class="metric-label">Accion Principal</div>
        <div class="metric-value">${topAction.substring(0, 10)}</div>
      </div>
    </div>
    
    <div class="section-title">TOP 5 JUGADORES</div>
    <div class="player-list">
      ${topPlayers.map(([player, count], i) => `
        <div class="player-item">
          <span class="player-name">${i + 1}. ${player}</span>
          <span class="player-count">${count} acciones</span>
        </div>
      `).join('')}
    </div>
    
    <div class="footer">Attack Metrics Suite 2026</div>
  </div>
  
  <!-- PÁGINA 2: MAPA DE CALOR -->
  <div class="page">
    <div class="page-2-title">MAPA DE ACTIVIDAD - ${matchData.config.homeName.toUpperCase()}</div>
    <div class="subtitle" style="font-size: 14px; margin-bottom: 20px;">${homeActions.length} acciones registradas</div>
    
    <canvas id="heatmapCanvas" width="800" height="600"></canvas>
    
    <div class="footer">Attack Metrics Suite 2026</div>
  </div>
  
  <script>
    const actions = ${JSON.stringify(homeActions)};
    const canvas = document.getElementById('heatmapCanvas');
    const ctx = canvas.getContext('2d');
    
    // Dimensiones del campo
    const fieldWidth = 700;
    const fieldHeight = 500;
    const offsetX = (canvas.width - fieldWidth) / 2;
    const offsetY = (canvas.height - fieldHeight) / 2;
    
    // Dibujar fondo verde
    ctx.fillStyle = '#1a3a0f';
    ctx.fillRect(offsetX, offsetY, fieldWidth, fieldHeight);
    
    // Dibujar líneas del campo
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 2;
    
    // Contorno
    ctx.strokeRect(offsetX, offsetY, fieldWidth, fieldHeight);
    
    // Línea de medio campo
    ctx.beginPath();
    ctx.moveTo(offsetX + fieldWidth / 2, offsetY);
    ctx.lineTo(offsetX + fieldWidth / 2, offsetY + fieldHeight);
    ctx.stroke();
    
    // Círculo central
    ctx.beginPath();
    ctx.arc(offsetX + fieldWidth / 2, offsetY + fieldHeight / 2, 60, 0, Math.PI * 2);
    ctx.stroke();
    
    // Áreas grandes
    ctx.strokeRect(offsetX, offsetY + fieldHeight * 0.21, fieldWidth * 0.17, fieldHeight * 0.58);
    ctx.strokeRect(offsetX + fieldWidth * 0.83, offsetY + fieldHeight * 0.21, fieldWidth * 0.17, fieldHeight * 0.58);
    
    // Crear heatmap
    const gridSize = 20;
    const grid = {};
    
    // Contar acciones por celda
    actions.forEach(action => {
      const gridX = Math.floor(action.x / gridSize);
      const gridY = Math.floor((100 - action.y) / gridSize); // Invertir Y
      const key = gridX + ',' + gridY;
      grid[key] = (grid[key] || 0) + 1;
    });
    
    // Encontrar máximo
    const maxCount = Math.max(...Object.values(grid));
    
    // Dibujar heatmap
    Object.entries(grid).forEach(([key, count]) => {
      const [gridX, gridY] = key.split(',').map(Number);
      const x = offsetX + (gridX * gridSize / 100) * fieldWidth;
      const y = offsetY + (gridY * gridSize / 100) * fieldHeight;
      const w = (gridSize / 100) * fieldWidth;
      const h = (gridSize / 100) * fieldHeight;
      
      const intensity = count / maxCount;
      const alpha = intensity * 0.7;
      
      // Gradiente de amarillo a rojo
      const hue = (1 - intensity) * 60; // 60 = amarillo, 0 = rojo
      ctx.fillStyle = \`hsla(\${hue}, 100%, 50%, \${alpha})\`;
      ctx.fillRect(x, y, w, h);
    });
    
    // Dibujar puntos
    actions.forEach(action => {
      const px = offsetX + (action.x / 100) * fieldWidth;
      const py = offsetY + ((100 - action.y) / 100) * fieldHeight;
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  </script>
</body>
</html>
  `;
}
