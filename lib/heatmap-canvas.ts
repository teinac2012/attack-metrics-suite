// Utilidad para generar heatmaps en Canvas directamente (como matplotlib)

export function drawPitch(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const scaleX = width / 105;
  const scaleY = height / 68;

  ctx.fillStyle = '#1a5f1a';
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;

  // Bordes del campo
  ctx.strokeRect(0, 0, width, height);

  // Línea media
  ctx.beginPath();
  ctx.moveTo(width / 2, 0);
  ctx.lineTo(width / 2, height);
  ctx.stroke();

  // Círculo central
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = 9.15 * Math.min(scaleX, scaleY);
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.stroke();

  // Áreas de penalti
  const penaltyWidth = 16.5 * scaleX;
  const penaltyHeight = 40.3 * scaleY;
  const penaltyY = (height - penaltyHeight) / 2;

  ctx.strokeRect(0, penaltyY, penaltyWidth, penaltyHeight);
  ctx.strokeRect(width - penaltyWidth, penaltyY, penaltyWidth, penaltyHeight);

  // Áreas pequeñas
  const smallWidth = 5.5 * scaleX;
  const smallHeight = 18.3 * scaleY;
  const smallY = (height - smallHeight) / 2;

  ctx.strokeRect(0, smallY, smallWidth, smallHeight);
  ctx.strokeRect(width - smallWidth, smallY, smallWidth, smallHeight);
}

function gaussianKernel(distance: number, bandwidth: number): number {
  return Math.exp(-(distance * distance) / (2 * bandwidth * bandwidth));
}

export function drawHeatmap(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  xs: number[],
  ys: number[],
  bandwidth: number = 8
) {
  const gridSize = 50;
  const cellWidth = width / gridSize;
  const cellHeight = height / gridSize;

  // Calcular densidad en cada celda del grid
  const density: number[][] = [];
  let maxDensity = 0;

  for (let i = 0; i < gridSize; i++) {
    density[i] = [];
    for (let j = 0; j < gridSize; j++) {
      const gridX = (i + 0.5) * cellWidth;
      const gridY = (j + 0.5) * cellHeight;

      let sum = 0;
      for (let k = 0; k < xs.length; k++) {
        const pointX = (xs[k] / 100) * width;
        const pointY = (ys[k] / 100) * height;
        const dx = gridX - pointX;
        const dy = gridY - pointY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        sum += gaussianKernel(distance, bandwidth);
      }

      density[i][j] = sum;
      maxDensity = Math.max(maxDensity, sum);
    }
  }

  // Dibujar heatmap
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const normalized = density[i][j] / maxDensity;
      if (normalized > 0.05) {
        // Colormap "Reds"
        const r = Math.floor(255);
        const g = Math.floor(255 * (1 - normalized * 0.9));
        const b = Math.floor(255 * (1 - normalized));
        const alpha = normalized * 0.7;

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.fillRect(i * cellWidth, j * cellHeight, cellWidth, cellHeight);
      }
    }
  }

  // Dibujar puntos
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  for (let i = 0; i < xs.length; i++) {
    const x = (xs[i] / 100) * width;
    const y = (ys[i] / 100) * height;
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, 2 * Math.PI);
    ctx.fill();
  }
}

export function createHeatmapCanvas(
  xs: number[],
  ys: number[],
  title: string,
  width: number = 400,
  height: number = 300
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Fondo blanco
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Dibujar campo y heatmap
  const margin = 30;
  const pitchWidth = width - 2 * margin;
  const pitchHeight = height - 2 * margin - 40;

  ctx.save();
  ctx.translate(margin, margin + 20);
  drawPitch(ctx, pitchWidth, pitchHeight);
  drawHeatmap(ctx, pitchWidth, pitchHeight, xs, ys);
  ctx.restore();

  // Título
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(title, width / 2, 15);

  return canvas;
}
