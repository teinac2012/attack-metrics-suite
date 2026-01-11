// Generador de heatmaps usando Canvas (sin librerías externas)

export function generateHeatmapCanvas(
  data: { xs: number[]; ys: number[]; count: number },
  player: string,
  width: number = 400,
  height: number = 300
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Fondo
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, width, height);

  // Dibujar campo
  drawPitch(ctx, width, height);

  // Generar heatmap
  if (data.xs.length > 0) {
    drawHeatmap(ctx, data.xs, data.ys, width, height);
  }

  // Título
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`${player} (${data.count} acciones)`, width / 2, 20);

  return canvas;
}

function drawPitch(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const scaleX = w / 100;
  const scaleY = h / 100;

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;

  // Contorno
  ctx.strokeRect(0, 0, w, h);

  // Línea central
  ctx.beginPath();
  ctx.moveTo(w / 2, 0);
  ctx.lineTo(w / 2, h);
  ctx.stroke();

  // Círculo central
  const centerX = w / 2;
  const centerY = h / 2;
  const radius = 9 * scaleX;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.stroke();

  // Áreas (simplificadas)
  const areaWidth = 17 * scaleX;
  const areaHeight = 58 * scaleY;
  const areaY = (100 - 58) / 2 * scaleY;

  // Área izquierda
  ctx.strokeRect(0, areaY, areaWidth, areaHeight);

  // Área derecha
  ctx.strokeRect(w - areaWidth, areaY, areaWidth, areaHeight);
}

function drawHeatmap(
  ctx: CanvasRenderingContext2D,
  xs: number[],
  ys: number[],
  w: number,
  h: number
) {
  const gridSize = 20;
  const grid: number[][] = Array(gridSize)
    .fill(0)
    .map(() => Array(gridSize).fill(0));

  // Calcular densidad en grid
  xs.forEach((x, i) => {
    const y = ys[i];
    const gx = Math.floor((x / 100) * gridSize);
    const gy = Math.floor((y / 100) * gridSize);
    if (gx >= 0 && gx < gridSize && gy >= 0 && gy < gridSize) {
      grid[gy][gx]++;
    }
  });

  // Suavizado simple (blur)
  const smoothed = smoothGrid(grid);

  // Dibujar
  const maxVal = Math.max(...smoothed.flat());
  if (maxVal === 0) return;

  const cellW = w / gridSize;
  const cellH = h / gridSize;

  for (let gy = 0; gy < gridSize; gy++) {
    for (let gx = 0; gx < gridSize; gx++) {
      const val = smoothed[gy][gx];
      if (val > 0) {
        const intensity = val / maxVal;
        const color = getHeatColor(intensity);
        ctx.fillStyle = color;
        ctx.fillRect(gx * cellW, gy * cellH, cellW, cellH);
      }
    }
  }
}

function smoothGrid(grid: number[][]): number[][] {
  const h = grid.length;
  const w = grid[0].length;
  const result: number[][] = Array(h)
    .fill(0)
    .map(() => Array(w).fill(0));

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0;
      let count = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const ny = y + dy;
          const nx = x + dx;
          if (ny >= 0 && ny < h && nx >= 0 && nx < w) {
            sum += grid[ny][nx];
            count++;
          }
        }
      }
      result[y][x] = sum / count;
    }
  }
  return result;
}

function getHeatColor(intensity: number): string {
  // Gradiente rojo (como matplotlib 'Reds')
  const r = Math.floor(255 * intensity);
  const g = Math.floor(50 * (1 - intensity));
  const b = Math.floor(50 * (1 - intensity));
  const a = 0.3 + 0.7 * intensity;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
