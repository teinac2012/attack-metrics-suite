import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb } from 'pdf-lib';
import { createCanvas } from 'canvas';

export const maxDuration = 60;

interface Action {
  team: string;
  player: string;
  x: number;
  y: number;
  [key: string]: any;
}

interface MatchData {
  config: {
    homeTeam: string;
    awayTeam: string;
    date: string;
  };
  actions: Action[];
}

function drawPitch(ctx: any, width: number, height: number) {
  const ratio = width / 100;

  // Fondo blanco
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, width, height);

  // Contorno
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, width, height);

  // Línea de medio campo
  ctx.beginPath();
  ctx.moveTo(50 * ratio, 0);
  ctx.lineTo(50 * ratio, height);
  ctx.stroke();

  // Círculo central
  ctx.beginPath();
  ctx.arc(50 * ratio, 50 * ratio, 9.15 * ratio, 0, Math.PI * 2);
  ctx.stroke();

  // Punto central
  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.arc(50 * ratio, 50 * ratio, 0.5 * ratio, 0, Math.PI * 2);
  ctx.fill();

  // Área izquierda
  ctx.strokeRect(0, 21.1 * ratio, 16.5 * ratio, 57.8 * ratio);
  ctx.strokeRect(0, 36.8 * ratio, 5.5 * ratio, 26.4 * ratio);

  // Área derecha
  ctx.strokeRect(width - 16.5 * ratio, 21.1 * ratio, 16.5 * ratio, 57.8 * ratio);
  ctx.strokeRect(width - 5.5 * ratio, 36.8 * ratio, 5.5 * ratio, 26.4 * ratio);
}

function createPitchHeatmapImage(actions: Action[], width: number, height: number): Buffer {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Dibujar campo
  drawPitch(ctx, width, height);

  // Grid para heatmap
  const ratio = width / 100;
  const grid: number[][] = Array(10)
    .fill(null)
    .map(() => Array(10).fill(0));

  for (const action of actions) {
    const col = Math.floor(action.x / 10);
    const row = Math.floor(action.y / 10);
    if (col >= 0 && col < 10 && row >= 0 && row < 10) {
      grid[row][col]++;
    }
  }

  const maxValue = Math.max(...grid.flat(), 1);
  const cellWidth = width / 10;
  const cellHeight = height / 10;

  // Dibujar heatmap con transparencia
  ctx.globalAlpha = 0.5;
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      const value = grid[row][col];
      if (value > 0) {
        const intensity = value / maxValue;
        const r = Math.round(255 * intensity);
        const g = Math.round(128 * (1 - intensity));
        const b = Math.round(255 * (1 - intensity));

        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(col * cellWidth, row * cellHeight, cellWidth, cellHeight);

        // Número de acciones
        ctx.globalAlpha = 1;
        ctx.fillStyle = 'black';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(value.toString(), col * cellWidth + cellWidth / 2, row * cellHeight + cellHeight / 2);
        ctx.globalAlpha = 0.5;
      }
    }
  }
  ctx.globalAlpha = 1;

  return canvas.toBuffer('image/png');
}

export async function POST(request: NextRequest) {
  try {
    const data: MatchData = await request.json();

    if (!data.actions || data.actions.length === 0) {
      return NextResponse.json({ error: 'No hay datos válidos' }, { status: 400 });
    }

    const { homeTeam, awayTeam, date } = data.config;

    // Filtrar acciones
    const homeActions = data.actions.filter((a) => a.team === 'HOME');
    const awayActions = data.actions.filter((a) => a.team === 'AWAY');

    // Crear documento PDF
    const pdfDoc = await PDFDocument.create();

    // PÁGINA 1: Equipo local
    const page1 = pdfDoc.addPage([595, 842]);
    let yPos = 800;

    // Título
    page1.drawText(`${homeTeam} - Informe de Análisis`, {
      x: 50,
      y: yPos,
      size: 22,
      color: rgb(0, 0, 0),
    });

    yPos -= 30;
    page1.drawText(`Fecha: ${date}`, {
      x: 50,
      y: yPos,
      size: 12,
      color: rgb(0.5, 0.5, 0.5),
    });

    yPos -= 25;
    page1.drawText('Mapa de Calor - Campo de Juego', {
      x: 50,
      y: yPos,
      size: 13,
      color: rgb(0, 0, 0),
    });

    yPos -= 15;

    // Generar imagen del campo con heatmap
    const pitchImage = createPitchHeatmapImage(homeActions, 300, 200);
    const pitchPNG = await pdfDoc.embedPng(pitchImage);
    page1.drawImage(pitchPNG, {
      x: 50,
      y: yPos - 220,
      width: 300,
      height: 200,
    });

    yPos -= 230;

    // Estadísticas
    page1.drawText(`Total de acciones: ${homeActions.length}`, {
      x: 50,
      y: yPos,
      size: 12,
      color: rgb(0, 0, 0),
    });

    yPos -= 20;
    page1.drawText('Top 10 Jugadores:', {
      x: 50,
      y: yPos,
      size: 11,
      color: rgb(0, 0, 0),
    });

    yPos -= 15;

    const players = new Map<string, number>();
    homeActions.forEach((action) => {
      const count = players.get(action.player) || 0;
      players.set(action.player, count + 1);
    });

    Array.from(players.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([player, count]) => {
        page1.drawText(`  ${player}: ${count}`, {
          x: 60,
          y: yPos,
          size: 9,
          color: rgb(0.2, 0.2, 0.2),
        });
        yPos -= 12;
      });

    // PÁGINA 2: Equipo visitante
    const page2 = pdfDoc.addPage([595, 842]);
    yPos = 800;

    page2.drawText(`${awayTeam} - Informe de Análisis`, {
      x: 50,
      y: yPos,
      size: 22,
      color: rgb(0, 0, 0),
    });

    yPos -= 30;
    page2.drawText(`Fecha: ${date}`, {
      x: 50,
      y: yPos,
      size: 12,
      color: rgb(0.5, 0.5, 0.5),
    });

    yPos -= 25;
    page2.drawText('Mapa de Calor - Campo de Juego', {
      x: 50,
      y: yPos,
      size: 13,
      color: rgb(0, 0, 0),
    });

    yPos -= 15;

    // Generar imagen del campo con heatmap para equipo visitante
    const pitchImage2 = createPitchHeatmapImage(awayActions, 300, 200);
    const pitchPNG2 = await pdfDoc.embedPng(pitchImage2);
    page2.drawImage(pitchPNG2, {
      x: 50,
      y: yPos - 220,
      width: 300,
      height: 200,
    });

    yPos -= 230;

    // Estadísticas
    page2.drawText(`Total de acciones: ${awayActions.length}`, {
      x: 50,
      y: yPos,
      size: 12,
      color: rgb(0, 0, 0),
    });

    yPos -= 20;
    page2.drawText('Top 10 Jugadores:', {
      x: 50,
      y: yPos,
      size: 11,
      color: rgb(0, 0, 0),
    });

    yPos -= 15;

    const awayPlayers = new Map<string, number>();
    awayActions.forEach((action) => {
      const count = awayPlayers.get(action.player) || 0;
      awayPlayers.set(action.player, count + 1);
    });

    Array.from(awayPlayers.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([player, count]) => {
        page2.drawText(`  ${player}: ${count}`, {
          x: 60,
          y: yPos,
          size: 9,
          color: rgb(0.2, 0.2, 0.2),
        });
        yPos -= 12;
      });

    // Generar PDF
    const pdfBytes = await pdfDoc.save();
    const pdfBuffer = Buffer.from(pdfBytes);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Informe_${homeTeam}_vs_${awayTeam}_${date}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      {
        error: 'Error al generar el informe',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
