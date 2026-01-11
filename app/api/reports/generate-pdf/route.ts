import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, degrees } from 'pdf-lib';

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

function drawPitchOnPDF(pdfPage: any, x: number, y: number, width: number, height: number) {
  const ratio = width / 100;

  // Contorno del campo
  pdfPage.drawRectangle({
    x,
    y: y - height,
    width,
    height,
    borderColor: rgb(0, 0, 0),
    borderWidth: 2,
  });

  // Línea de medio campo
  pdfPage.drawLine({
    start: { x: x + 50 * ratio, y: y - height },
    end: { x: x + 50 * ratio, y: y },
    color: rgb(0, 0, 0),
    thickness: 1,
  });

  // Círculo central
  pdfPage.drawCircle({
    x: x + 50 * ratio,
    y: y - 50 * ratio,
    size: 9.15 * ratio * 2,
    borderColor: rgb(0, 0, 0),
    borderWidth: 1,
  });

  // Punto central
  pdfPage.drawCircle({
    x: x + 50 * ratio,
    y: y - 50 * ratio,
    size: 1 * ratio,
    color: rgb(0, 0, 0),
  });

  // Área de penalty izquierda
  pdfPage.drawRectangle({
    x: x,
    y: y - (21.1 + 57.8) * ratio,
    width: 16.5 * ratio,
    height: 57.8 * ratio,
    borderColor: rgb(0, 0, 0),
    borderWidth: 1,
  });

  // Área de portería izquierda
  pdfPage.drawRectangle({
    x: x,
    y: y - (36.8 + 26.4) * ratio,
    width: 5.5 * ratio,
    height: 26.4 * ratio,
    borderColor: rgb(0, 0, 0),
    borderWidth: 1,
  });

  // Área de penalty derecha
  pdfPage.drawRectangle({
    x: x + width - 16.5 * ratio,
    y: y - (21.1 + 57.8) * ratio,
    width: 16.5 * ratio,
    height: 57.8 * ratio,
    borderColor: rgb(0, 0, 0),
    borderWidth: 1,
  });

  // Área de portería derecha
  pdfPage.drawRectangle({
    x: x + width - 5.5 * ratio,
    y: y - (36.8 + 26.4) * ratio,
    width: 5.5 * ratio,
    height: 26.4 * ratio,
    borderColor: rgb(0, 0, 0),
    borderWidth: 1,
  });
}

function createHeatmapData(actions: Action[], team: string): number[][] {
  const grid: number[][] = Array(10)
    .fill(null)
    .map(() => Array(10).fill(0));

  for (const action of actions) {
    if (action.team === team) {
      const col = Math.floor(action.x / 10);
      const row = Math.floor(action.y / 10);

      if (col >= 0 && col < 10 && row >= 0 && row < 10) {
        grid[row][col]++;
      }
    }
  }

  return grid;
}

function drawHeatmapOnPDF(pdfPage: any, x: number, y: number, width: number, height: number, grid: number[][]) {
  const cellWidth = width / 10;
  const cellHeight = height / 10;
  const maxValue = Math.max(...grid.flat());

  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      const value = grid[row]?.[col] || 0;
      const intensity = maxValue > 0 ? value / maxValue : 0;

      // Escala de color: azul (frío) a rojo (caliente)
      const r = Math.floor(255 * intensity) / 255;
      const g = Math.floor(128 * (1 - intensity)) / 255;
      const b = Math.floor(255 * (1 - intensity)) / 255;

      const cellX = x + col * cellWidth;
      const cellY = y - (row + 1) * cellHeight;

      pdfPage.drawRectangle({
        x: cellX,
        y: cellY,
        width: cellWidth,
        height: cellHeight,
        color: rgb(r, g, b),
        borderColor: rgb(200, 200, 200),
        borderWidth: 0.5,
      });
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: MatchData = await request.json();

    if (!data.actions || data.actions.length === 0) {
      return NextResponse.json({ error: 'No hay datos válidos' }, { status: 400 });
    }

    const { homeTeam, awayTeam, date } = data.config;

    // Crear documento PDF
    const pdfDoc = await PDFDocument.create();
    const { width, height } = pdfDoc.getPage(0).getSize();

    // Página 1: Equipo local
    let page = pdfDoc.addPage([595, 842]); // A4
    const pageWidth = 595;
    const pageHeight = 842;
    let yPosition = pageHeight - 40;

    // Título
    page.drawText(`${homeTeam} - Informe de Análisis`, {
      x: 50,
      y: yPosition,
      size: 20,
      color: rgb(0, 0, 0),
    });

    yPosition -= 25;
    page.drawText(`Fecha: ${date}`, {
      x: 50,
      y: yPosition,
      size: 12,
      color: rgb(0, 0, 0),
    });

    yPosition -= 30;
    page.drawText('Mapa de Calor de Acciones', {
      x: 50,
      y: yPosition,
      size: 14,
      color: rgb(0, 0, 0),
    });

    yPosition -= 20;

    // Dibujar campo
    drawPitchOnPDF(page, 50, yPosition, 200, 200);

    // Dibujar heatmap
    const homeGrid = createHeatmapData(data.actions, homeTeam);
    drawHeatmapOnPDF(page, 55, yPosition - 5, 190, 190, homeGrid);

    yPosition -= 220;

    // Estadísticas
    const homeActions = data.actions.filter((a) => a.team === homeTeam);
    page.drawText(`Total de acciones: ${homeActions.length}`, {
      x: 50,
      y: yPosition,
      size: 11,
      color: rgb(0, 0, 0),
    });

    yPosition -= 15;
    page.drawText('Acciones por jugador (Top 10):', {
      x: 50,
      y: yPosition,
      size: 10,
      color: rgb(0, 0, 0),
    });

    yPosition -= 12;

    const players = new Map<string, number>();
    homeActions.forEach((action) => {
      const count = players.get(action.player) || 0;
      players.set(action.player, count + 1);
    });

    Array.from(players.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([player, count]) => {
        page.drawText(`  ${player}: ${count}`, {
          x: 60,
          y: yPosition,
          size: 9,
          color: rgb(0, 0, 0),
        });
        yPosition -= 12;
      });

    // Página 2: Equipo visitante
    page = pdfDoc.addPage([595, 842]); // A4
    yPosition = pageHeight - 40;

    page.drawText(`${awayTeam} - Informe de Análisis`, {
      x: 50,
      y: yPosition,
      size: 20,
      color: rgb(0, 0, 0),
    });

    yPosition -= 25;
    page.drawText(`Fecha: ${date}`, {
      x: 50,
      y: yPosition,
      size: 12,
      color: rgb(0, 0, 0),
    });

    yPosition -= 30;
    page.drawText('Mapa de Calor de Acciones', {
      x: 50,
      y: yPosition,
      size: 14,
      color: rgb(0, 0, 0),
    });

    yPosition -= 20;

    // Dibujar campo
    drawPitchOnPDF(page, 50, yPosition, 200, 200);

    // Dibujar heatmap
    const awayGrid = createHeatmapData(data.actions, awayTeam);
    drawHeatmapOnPDF(page, 55, yPosition - 5, 190, 190, awayGrid);

    yPosition -= 220;

    // Estadísticas
    const awayActions = data.actions.filter((a) => a.team === awayTeam);
    page.drawText(`Total de acciones: ${awayActions.length}`, {
      x: 50,
      y: yPosition,
      size: 11,
      color: rgb(0, 0, 0),
    });

    yPosition -= 15;
    page.drawText('Acciones por jugador (Top 10):', {
      x: 50,
      y: yPosition,
      size: 10,
      color: rgb(0, 0, 0),
    });

    yPosition -= 12;

    const awayPlayers = new Map<string, number>();
    awayActions.forEach((action) => {
      const count = awayPlayers.get(action.player) || 0;
      awayPlayers.set(action.player, count + 1);
    });

    Array.from(awayPlayers.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([player, count]) => {
        page.drawText(`  ${player}: ${count}`, {
          x: 60,
          y: yPosition,
          size: 9,
          color: rgb(0, 0, 0),
        });
        yPosition -= 12;
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
