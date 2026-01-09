import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// Configuración para Vercel
export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

interface MatchAction {
  x: number;
  y: number;
  type: string;
  player: string;
  team: string;
}

interface MatchData {
  config: {
    homeName: string;
    awayName: string;
  };
  actions: MatchAction[];
}

export async function POST(req: NextRequest) {
  try {
    console.log('[REPORTS] === Iniciando generación de informe ===');
    
    // Verificar autenticación
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener datos del partido
    const body = await req.json();
    const { matchData } = body as { matchData: MatchData };

    if (!matchData || !matchData.actions || !matchData.config) {
      return NextResponse.json({ error: 'Datos del partido inválidos' }, { status: 400 });
    }

    console.log('[REPORTS] Datos validados:', matchData.config.homeName, 'vs', matchData.config.awayName);

    // Filtrar acciones del equipo local
    const homeActions = matchData.actions.filter(a => a.team === 'HOME');

    // Crear PDF
    const pdfDoc = await PDFDocument.create();
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // === PÁGINA 1: PORTADA ===
    const page1 = pdfDoc.addPage([595, 842]); // A4
    const { width: pageWidth, height: pageHeight } = page1.getSize();

    // Fondo negro
    page1.drawRectangle({
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
      color: rgb(0.04, 0.04, 0.04),
    });

    // Título principal
    page1.drawText('INFORME DE ANALISIS', {
      x: 50,
      y: pageHeight - 100,
      size: 32,
      font: helveticaBold,
      color: rgb(0.3, 0.69, 0.31),
    });

    page1.drawText(`${matchData.config.homeName.toUpperCase()} vs ${matchData.config.awayName.toUpperCase()}`, {
      x: 50,
      y: pageHeight - 140,
      size: 24,
      font: helveticaBold,
      color: rgb(1, 1, 1),
    });

    page1.drawText(new Date().toLocaleDateString('es-ES'), {
      x: 50,
      y: pageHeight - 170,
      size: 12,
      font: helvetica,
      color: rgb(0.53, 0.53, 0.53),
    });

    // Estadísticas principales
    const totalActions = homeActions.length;
    const uniquePlayers = new Set(homeActions.map(a => a.player)).size;
    const actionCounts = homeActions.reduce((acc, a) => {
      acc[a.type] = (acc[a.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topActionEntry = Object.entries(actionCounts).sort((a, b) => b[1] - a[1])[0];
    const topAction = topActionEntry ? topActionEntry[0] : 'N/A';

    // Cajas de métricas
    const boxY = pageHeight - 280;
    const boxes = [
      { label: 'Total Acciones', value: String(totalActions), x: 70 },
      { label: 'Jugadores', value: String(uniquePlayers), x: 240 },
      { label: 'Accion Principal', value: topAction.substring(0, 10), x: 410 }
    ];

    boxes.forEach(({ label, value, x }) => {
      page1.drawRectangle({
        x,
        y: boxY,
        width: 140,
        height: 80,
        color: rgb(0.12, 0.12, 0.12),
        borderColor: rgb(0.3, 0.69, 0.31),
        borderWidth: 2,
      });
      page1.drawText(label, {
        x: x + 10,
        y: boxY + 55,
        size: 10,
        font: helvetica,
        color: rgb(0.8, 0.8, 0.8),
      });
      page1.drawText(value, {
        x: x + 10,
        y: boxY + 30,
        size: 18,
        font: helveticaBold,
        color: rgb(0.3, 0.69, 0.31),
      });
    });

    // Top 5 jugadores
    page1.drawText('TOP 5 JUGADORES', {
      x: 70,
      y: boxY - 60,
      size: 16,
      font: helveticaBold,
      color: rgb(1, 1, 1),
    });

    const playerCounts = homeActions.reduce((acc, a) => {
      acc[a.player] = (acc[a.player] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topPlayers = Object.entries(playerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    topPlayers.forEach(([player, count], i) => {
      const yPos = boxY - 100 - i * 40;
      page1.drawRectangle({
        x: 70,
        y: yPos,
        width: 450,
        height: 30,
        color: rgb(0.1, 0.1, 0.1),
        borderColor: rgb(0.13, 0.59, 0.95),
        borderWidth: 1,
      });
      page1.drawText(`${i + 1}. ${player}`, {
        x: 85,
        y: yPos + 8,
        size: 12,
        font: helvetica,
        color: rgb(1, 1, 1),
      });
      page1.drawText(`${count} acciones`, {
        x: 400,
        y: yPos + 8,
        size: 12,
        font: helveticaBold,
        color: rgb(0.3, 0.69, 0.31),
      });
    });

    // === PÁGINA 2: MAPA DE CALOR ===
    const page2 = pdfDoc.addPage([595, 842]);
    
    // Fondo
    page2.drawRectangle({
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
      color: rgb(0.04, 0.04, 0.04),
    });

    // Título
    page2.drawText(`MAPA DE ACTIVIDAD - ${matchData.config.homeName.toUpperCase()}`, {
      x: 50,
      y: pageHeight - 80,
      size: 20,
      font: helveticaBold,
      color: rgb(0.3, 0.69, 0.31),
    });

    page2.drawText(`${homeActions.length} acciones registradas`, {
      x: 50,
      y: pageHeight - 110,
      size: 12,
      font: helvetica,
      color: rgb(1, 1, 1),
    });

    // Dibujar campo
    const fieldWidth = 450;
    const fieldHeight = 300;
    const fieldX = (pageWidth - fieldWidth) / 2;
    const fieldY = pageHeight - 500;

    // Campo verde
    page2.drawRectangle({
      x: fieldX,
      y: fieldY,
      width: fieldWidth,
      height: fieldHeight,
      color: rgb(0.18, 0.31, 0.09),
      borderColor: rgb(0.3, 0.69, 0.31),
      borderWidth: 2,
    });
    
    // Línea de medio campo
    page2.drawLine({
      start: { x: fieldX + fieldWidth / 2, y: fieldY },
      end: { x: fieldX + fieldWidth / 2, y: fieldY + fieldHeight },
      color: rgb(0.3, 0.69, 0.31),
      thickness: 2,
    });
    
    // Círculo central
    page2.drawCircle({
      x: fieldX + fieldWidth / 2,
      y: fieldY + fieldHeight / 2,
      size: 40,
      borderColor: rgb(0.3, 0.69, 0.31),
      borderWidth: 2,
    });

    // Crear grid para heatmap
    const gridSize = 20;
    const grid: Record<string, number> = {};
    
    homeActions.forEach(action => {
      const gridX = Math.floor(action.x / gridSize);
      const gridY = Math.floor((100 - action.y) / gridSize);
      const key = `${gridX},${gridY}`;
      grid[key] = (grid[key] || 0) + 1;
    });
    
    const maxCount = Math.max(...Object.values(grid));
    
    // Dibujar heatmap con rectángulos de colores
    Object.entries(grid).forEach(([key, count]) => {
      const [gridX, gridY] = key.split(',').map(Number);
      const x = fieldX + (gridX * gridSize / 100) * fieldWidth;
      const y = fieldY + (gridY * gridSize / 100) * fieldHeight;
      const w = (gridSize / 100) * fieldWidth;
      const h = (gridSize / 100) * fieldHeight;
      
      const intensity = count / maxCount;
      
      // Gradiente amarillo -> naranja -> rojo
      let r, g, b;
      if (intensity < 0.5) {
        // Amarillo a naranja
        r = 1;
        g = 1 - (intensity * 0.4);
        b = 0;
      } else {
        // Naranja a rojo
        r = 1;
        g = 0.6 - ((intensity - 0.5) * 1.2);
        b = 0;
      }
      
      page2.drawRectangle({
        x,
        y,
        width: w,
        height: h,
        color: rgb(r, Math.max(0, g), b),
        opacity: intensity * 0.6,
      });
    });

    // Dibujar puntos de acciones
    homeActions.forEach(action => {
      const px = fieldX + (action.x / 100) * fieldWidth;
      const py = fieldY + ((100 - action.y) / 100) * fieldHeight;
      
      page2.drawCircle({
        x: px,
        y: py,
        size: 3,
        color: rgb(1, 1, 1),
        opacity: 0.9,
      });
    });

    // Leyenda
    page2.drawText('Intensidad de color indica concentración de acciones', {
      x: 50,
      y: fieldY - 50,
      size: 10,
      font: helvetica,
      color: rgb(0.8, 0.8, 0.8),
    });

    // Pie de página
    page2.drawText('Attack Metrics Suite 2026', {
      x: pageWidth / 2 - 80,
      y: 30,
      size: 9,
      font: helvetica,
      color: rgb(0.4, 0.4, 0.4),
    });

    // Guardar PDF
    const pdfBytes = await pdfDoc.save();
    console.log('[REPORTS] PDF generado exitosamente, tamaño:', pdfBytes.length, 'bytes');

    // Nombre del archivo
    const fileName = `Informe_${matchData.config.homeName}_vs_${matchData.config.awayName}_${new Date().toISOString().split('T')[0]}.pdf`;

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('[REPORTS] === ERROR FATAL ===');
    console.error('[REPORTS] Tipo:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('[REPORTS] Mensaje:', error instanceof Error ? error.message : String(error));
    console.error('[REPORTS] Stack:', error instanceof Error ? error.stack : 'N/A');
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor', 
        details: error instanceof Error ? error.message : String(error),
        type: error instanceof Error ? error.constructor.name : typeof error
      },
      { status: 500 }
    );
  }
}
