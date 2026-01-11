import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb } from 'pdf-lib';

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

export async function POST(request: NextRequest) {
  try {
    const data: MatchData = await request.json();

    if (!data.actions || data.actions.length === 0) {
      return NextResponse.json({ error: 'No hay datos válidos' }, { status: 400 });
    }

    const { homeTeam, awayTeam, date } = data.config;

    // Mapear HOME/AWAY a nombres reales
    const homeActions = data.actions.filter((a) => a.team === 'HOME' || a.team === homeTeam);
    const awayActions = data.actions.filter((a) => a.team === 'AWAY' || a.team === awayTeam);

    // Crear documento PDF
    const pdfDoc = await PDFDocument.create();

    // Página 1: Equipo local
    const page1 = pdfDoc.addPage([595, 842]); // A4
    let yPos = 800;

    // Título
    page1.drawText(`${homeTeam} - Informe de Análisis`, {
      x: 50,
      y: yPos,
      size: 18,
      color: rgb(0, 0, 0),
    });

    yPos -= 25;
    page1.drawText(`Fecha: ${date}`, {
      x: 50,
      y: yPos,
      size: 11,
      color: rgb(0, 0, 0),
    });

    yPos -= 30;
    page1.drawText('Mapa de Calor de Acciones', {
      x: 50,
      y: yPos,
      size: 12,
      color: rgb(0, 0, 0),
    });

    yPos -= 30;

    // Dibujar heatmap simple para equipo local
    const homeGrid = createHeatmapData(homeActions);
    const cellSize = 15;
    const startX = 50;

    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const value = homeGrid[row]?.[col] || 0;
        const maxValue = Math.max(...homeGrid.flat());
        const intensity = maxValue > 0 ? value / maxValue : 0;

        // Escala de color azul -> rojo
        const r = Math.round(255 * intensity);
        const g = Math.round(128 * (1 - intensity));
        const b = Math.round(255 * (1 - intensity));

        const cellX = startX + col * cellSize;
        const cellY = yPos - row * cellSize;

        page1.drawRectangle({
          x: cellX,
          y: cellY - cellSize,
          width: cellSize,
          height: cellSize,
          color: rgb(r / 255, g / 255, b / 255),
          borderColor: rgb(0.8, 0.8, 0.8),
          borderWidth: 0.5,
        });
      }
    }

    yPos -= 180;

    // Estadísticas
    page1.drawText(`Total de acciones: ${homeActions.length}`, {
      x: 50,
      y: yPos,
      size: 10,
      color: rgb(0, 0, 0),
    });

    yPos -= 15;
    page1.drawText('Acciones por jugador (Top 5):', {
      x: 50,
      y: yPos,
      size: 9,
      color: rgb(0, 0, 0),
    });

    yPos -= 12;

    const players = new Map<string, number>();
    homeActions.forEach((action) => {
      const count = players.get(action.player) || 0;
      players.set(action.player, count + 1);
    });

    Array.from(players.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([player, count]) => {
        page1.drawText(`  ${player}: ${count}`, {
          x: 60,
          y: yPos,
          size: 8,
          color: rgb(0, 0, 0),
        });
        yPos -= 11;
      });

    // Página 2: Equipo visitante
    const page2 = pdfDoc.addPage([595, 842]); // A4
    yPos = 800;

    page2.drawText(`${awayTeam} - Informe de Análisis`, {
      x: 50,
      y: yPos,
      size: 18,
      color: rgb(0, 0, 0),
    });

    yPos -= 25;
    page2.drawText(`Fecha: ${date}`, {
      x: 50,
      y: yPos,
      size: 11,
      color: rgb(0, 0, 0),
    });

    yPos -= 30;
    page2.drawText('Mapa de Calor de Acciones', {
      x: 50,
      y: yPos,
      size: 12,
      color: rgb(0, 0, 0),
    });

    yPos -= 30;

    // Dibujar heatmap para equipo visitante
    const awayGrid = createHeatmapData(awayActions);

    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const value = awayGrid[row]?.[col] || 0;
        const maxValue = Math.max(...awayGrid.flat());
        const intensity = maxValue > 0 ? value / maxValue : 0;

        // Escala de color azul -> rojo
        const r = Math.round(255 * intensity);
        const g = Math.round(128 * (1 - intensity));
        const b = Math.round(255 * (1 - intensity));

        const cellX = startX + col * cellSize;
        const cellY = yPos - row * cellSize;

        page2.drawRectangle({
          x: cellX,
          y: cellY - cellSize,
          width: cellSize,
          height: cellSize,
          color: rgb(r / 255, g / 255, b / 255),
          borderColor: rgb(0.8, 0.8, 0.8),
          borderWidth: 0.5,
        });
      }
    }

    yPos -= 180;

    // Estadísticas
    page2.drawText(`Total de acciones: ${awayActions.length}`, {
      x: 50,
      y: yPos,
      size: 10,
      color: rgb(0, 0, 0),
    });

    yPos -= 15;
    page2.drawText('Acciones por jugador (Top 5):', {
      x: 50,
      y: yPos,
      size: 9,
      color: rgb(0, 0, 0),
    });

    yPos -= 12;

    const awayPlayers = new Map<string, number>();
    awayActions.forEach((action) => {
      const count = awayPlayers.get(action.player) || 0;
      awayPlayers.set(action.player, count + 1);
    });

    Array.from(awayPlayers.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([player, count]) => {
        page2.drawText(`  ${player}: ${count}`, {
          x: 60,
          y: yPos,
          size: 8,
          color: rgb(0, 0, 0),
        });
        yPos -= 11;
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

function createHeatmapData(actions: Action[]): number[][] {
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

  return grid;
}
