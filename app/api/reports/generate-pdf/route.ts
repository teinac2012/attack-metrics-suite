import { NextRequest, NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

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

function drawPitch(page: PDFKit.PDFDocument, x: number, y: number, width: number, height: number) {
  const ratio = width / 100;

  // Contorno
  page.rect(x, y, width, height).stroke();

  // Línea de medio campo
  page.moveTo(x + 50 * ratio, y).lineTo(x + 50 * ratio, y + height).stroke();

  // Círculo central
  page
    .circle(x + 50 * ratio, y + 50 * ratio, 9.15 * ratio)
    .stroke();

  // Punto central
  page.circle(x + 50 * ratio, y + 50 * ratio, 0.5 * ratio).fill();

  // Áreas de penalty - izquierda
  page.rect(x, y + 21.1 * ratio, 16.5 * ratio, 57.8 * ratio).stroke();

  // Área de portería izquierda
  page.rect(x, y + 36.8 * ratio, 5.5 * ratio, 26.4 * ratio).stroke();

  // Áreas de penalty - derecha
  page
    .rect(x + width - 16.5 * ratio, y + 21.1 * ratio, 16.5 * ratio, 57.8 * ratio)
    .stroke();

  // Área de portería derecha
  page
    .rect(x + width - 5.5 * ratio, y + 36.8 * ratio, 5.5 * ratio, 26.4 * ratio)
    .stroke();
}

function createHeatmapData(actions: Action[], team: string): Map<string, number[][]> {
  const heatmap = new Map<string, number[][]>();

  // Inicializar grid 10x10
  const grid: number[][] = Array(10)
    .fill(null)
    .map(() => Array(10).fill(0));

  // Contar acciones por celda
  for (const action of actions) {
    if (action.team === team) {
      const col = Math.floor(action.x / 10);
      const row = Math.floor(action.y / 10);

      if (col >= 0 && col < 10 && row >= 0 && row < 10) {
        grid[row][col]++;
      }
    }
  }

  heatmap.set('grid', grid);
  return heatmap;
}

function drawHeatmap(
  page: PDFKit.PDFDocument,
  x: number,
  y: number,
  width: number,
  height: number,
  heatmapData: Map<string, number[][]>
) {
  const grid = heatmapData.get('grid') || [];
  const cellWidth = width / 10;
  const cellHeight = height / 10;
  const maxValue = Math.max(...grid.flat());

  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      const value = grid[row]?.[col] || 0;
      const intensity = maxValue > 0 ? value / maxValue : 0;

      // Escala de color: azul (frío) a rojo (caliente)
      let r = Math.floor(255 * intensity);
      let g = Math.floor(128 * (1 - intensity));
      let b = Math.floor(255 * (1 - intensity));

      const cellX = x + col * cellWidth;
      const cellY = y + row * cellHeight;

      page.fillColor(`rgb(${r},${g},${b})`).rect(cellX, cellY, cellWidth, cellHeight).fill();

      // Opcional: mostrar números
      if (value > 0) {
        page
          .fillColor('black')
          .fontSize(6)
          .text(value.toString(), cellX + cellWidth / 2 - 4, cellY + cellHeight / 2 - 3);
      }
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
    const doc = new PDFDocument({
      size: 'A4',
      margin: 20,
    });

    // Pipe a buffer
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    // Página 1: Equipo local
    doc.fontSize(24).font('Helvetica-Bold').text(`${homeTeam} - Informe de Análisis`, { align: 'center' });
    doc.fontSize(12).font('Helvetica').text(`Fecha: ${date}`, { align: 'center' });
    doc.moveDown(0.5);

    // Mapa de calor local
    doc.fontSize(14).text('Mapa de Calor de Acciones');
    drawPitch(doc, 30, doc.y + 10, 200, 200);

    const homeHeatmap = createHeatmapData(data.actions, homeTeam);
    drawHeatmap(doc, 35, doc.y - 190, 190, 190, homeHeatmap);

    doc.moveDown(12);

    // Estadísticas
    const homeActions = data.actions.filter((a) => a.team === homeTeam);
    doc.fontSize(12).text(`Total de acciones: ${homeActions.length}`);

    const players = new Map<string, number>();
    homeActions.forEach((action) => {
      const count = players.get(action.player) || 0;
      players.set(action.player, count + 1);
    });

    doc.fontSize(10).text('Acciones por jugador (Top 10):');
    Array.from(players.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([player, count]) => {
        doc.text(`  ${player}: ${count}`);
      });

    // Página 2: Equipo visitante
    doc.addPage();
    doc.fontSize(24).font('Helvetica-Bold').text(`${awayTeam} - Informe de Análisis`, { align: 'center' });
    doc.fontSize(12).font('Helvetica').text(`Fecha: ${date}`, { align: 'center' });
    doc.moveDown(0.5);

    // Mapa de calor visitante
    doc.fontSize(14).text('Mapa de Calor de Acciones');
    drawPitch(doc, 30, doc.y + 10, 200, 200);

    const awayHeatmap = createHeatmapData(data.actions, awayTeam);
    drawHeatmap(doc, 35, doc.y - 190, 190, 190, awayHeatmap);

    doc.moveDown(12);

    // Estadísticas visitante
    const awayActions = data.actions.filter((a) => a.team === awayTeam);
    doc.fontSize(12).text(`Total de acciones: ${awayActions.length}`);

    const awayPlayers = new Map<string, number>();
    awayActions.forEach((action) => {
      const count = awayPlayers.get(action.player) || 0;
      awayPlayers.set(action.player, count + 1);
    });

    doc.fontSize(10).text('Acciones por jugador (Top 10):');
    Array.from(awayPlayers.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([player, count]) => {
        doc.text(`  ${player}: ${count}`);
      });

    // Finalizar documento
    doc.end();

    // Esperar a que se complete
    await new Promise((resolve, reject) => {
      doc.on('finish', resolve);
      doc.on('error', reject);
    });

    const pdfBuffer = Buffer.concat(chunks);

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
