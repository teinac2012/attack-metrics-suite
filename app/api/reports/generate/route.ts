import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// Configuración para Vercel
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 segundos
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

function drawPitch(page: any, x: number, y: number, width: number, height: number, color: [number, number, number]) {
  const scaleX = width / 100;
  const scaleY = height / 100;
  
  // Fondo verde del campo
  page.drawRectangle({
    x,
    y,
    width,
    height,
    color: rgb(0.18, 0.31, 0.09),
    borderColor: rgb(color[0], color[1], color[2]),
    borderWidth: 2,
  });
  
  // Línea de medio campo
  page.drawLine({
    start: { x: x + width / 2, y },
    end: { x: x + width / 2, y: y + height },
    color: rgb(color[0], color[1], color[2]),
    thickness: 2,
  });
  
  // Áreas grandes (penalty area)
  page.drawRectangle({
    x,
    y: y + 21.1 * scaleY,
    width: 17 * scaleX,
    height: 57.8 * scaleY,
    borderColor: rgb(color[0], color[1], color[2]),
    borderWidth: 2,
  });
  
  page.drawRectangle({
    x: x + (100 - 17) * scaleX,
    y: y + 21.1 * scaleY,
    width: 17 * scaleX,
    height: 57.8 * scaleY,
    borderColor: rgb(color[0], color[1], color[2]),
    borderWidth: 2,
  });
  
  // Círculo central
  page.drawCircle({
    x: x + width / 2,
    y: y + height / 2,
    size: 8.7 * scaleX,
    borderColor: rgb(color[0], color[1], color[2]),
    borderWidth: 2,
  });
  
  // Punto central
  page.drawCircle({
    x: x + width / 2,
    y: y + height / 2,
    size: 3,
    color: rgb(color[0], color[1], color[2]),
  });
}

export async function POST(req: NextRequest) {
  try {
    console.log('[REPORTS] === Iniciando generación de informe ===');
    
    // Verificar autenticación
    console.log('[REPORTS] Verificando autenticación...');
    const session = await auth();
    
    if (!session?.user) {
      console.log('[REPORTS] No autorizado - sin sesión');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    console.log('[REPORTS] Usuario autenticado:', session.user.name);

    // Obtener datos del partido
    console.log('[REPORTS] Parseando body...');
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error('[REPORTS] Error parseando JSON:', parseError);
      return NextResponse.json({ error: 'JSON inválido', details: String(parseError) }, { status: 400 });
    }
    
    const { matchData } = body as { matchData: MatchData };
    console.log('[REPORTS] Body parseado. Tiene matchData:', !!matchData);

    if (!matchData || !matchData.actions || !matchData.config) {
      console.error('[REPORTS] Datos inválidos:', {
        hasMatchData: !!matchData,
        hasActions: !!matchData?.actions,
        hasConfig: !!matchData?.config
      });
      return NextResponse.json({ error: 'Datos del partido inválidos' }, { status: 400 });
    }

    console.log('[REPORTS] Validación OK - Config:', matchData.config.homeName, 'vs', matchData.config.awayName);
    console.log('[REPORTS] Total acciones:', matchData.actions.length);

    // Filtrar acciones del equipo local
    const homeActions = matchData.actions.filter(a => a.team === 'HOME');
    console.log('[REPORTS] Acciones HOME:', homeActions.length);

    // Crear PDF
    console.log('[REPORTS] Creando documento PDF...');
    let pdfDoc;
    try {
      pdfDoc = await PDFDocument.create();
      console.log('[REPORTS] PDF Document creado');
    } catch (pdfError) {
      console.error('[REPORTS] Error creando PDFDocument:', pdfError);
      return NextResponse.json({ error: 'Error creando PDF', details: String(pdfError) }, { status: 500 });
    }
    
    console.log('[REPORTS] Cargando fuentes...');
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    console.log('[REPORTS] Fuentes cargadas');

    // === PÁGINA 1: PORTADA ===
    console.log('[REPORTS] Generando página 1...');
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

    console.log('[REPORTS] Stats calculadas - Total:', totalActions, 'Jugadores:', uniquePlayers);

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

    console.log('[REPORTS] Página 1 completada');

    // === PÁGINA 2: MAPA DE ACTIVIDAD ===
    console.log('[REPORTS] Generando página 2...');
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

    console.log('[REPORTS] Dibujando campo...');
    drawPitch(page2, fieldX, fieldY, fieldWidth, fieldHeight, [0.3, 0.69, 0.31]);

    // Dibujar puntos de acciones (invertir Y)
    console.log('[REPORTS] Dibujando', homeActions.length, 'puntos...');
    homeActions.forEach(action => {
      const px = fieldX + (action.x / 100) * fieldWidth;
      const py = fieldY + ((100 - action.y) / 100) * fieldHeight;
      
      page2.drawCircle({
        x: px,
        y: py,
        size: 3,
        color: rgb(1, 0.92, 0.23),
        opacity: 0.7,
      });
    });

    // Leyenda
    page2.drawText('Zonas de mayor actividad indicadas por concentracion de puntos', {
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

    console.log('[REPORTS] Página 2 completada');

    // Guardar PDF
    console.log('[REPORTS] Guardando PDF...');
    let pdfBytes;
    try {
      pdfBytes = await pdfDoc.save();
      console.log('[REPORTS] PDF generado exitosamente, tamaño:', pdfBytes.length, 'bytes');
    } catch (saveError) {
      console.error('[REPORTS] Error guardando PDF:', saveError);
      return NextResponse.json({ error: 'Error guardando PDF', details: String(saveError) }, { status: 500 });
    }

    // Nombre del archivo
    const fileName = `Informe_${matchData.config.homeName}_vs_${matchData.config.awayName}_${new Date().toISOString().split('T')[0]}.pdf`;
    console.log('[REPORTS] Enviando PDF al cliente:', fileName);

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
