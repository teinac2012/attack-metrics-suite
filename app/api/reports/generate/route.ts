import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import PDFDocument from 'pdfkit';

// Configuración para aumentar el tiempo de ejecución en Vercel
export const maxDuration = 60; // 60 segundos

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

function drawPitch(doc: typeof PDFDocument, x: number, y: number, width: number, height: number) {
  const scaleX = width / 100;
  const scaleY = height / 100;
  
  doc.save();
  doc.translate(x, y);
  
  // Fondo verde
  doc.rect(0, 0, width, height).fillAndStroke('#2d5016', '#4CAF50');
  
  // Líneas del campo
  doc.strokeColor('#4CAF50').lineWidth(2);
  
  // Contorno
  doc.rect(0, 0, width, height).stroke();
  
  // Línea de medio campo
  doc.moveTo(width / 2, 0).lineTo(width / 2, height).stroke();
  
  // Áreas grandes
  doc.rect(0, 21.1 * scaleY, 17 * scaleX, 57.8 * scaleY).stroke();
  doc.rect((100 - 17) * scaleX, 21.1 * scaleY, 17 * scaleX, 57.8 * scaleY).stroke();
  
  // Áreas pequeñas
  doc.rect(0, 36.8 * scaleY, 5.8 * scaleX, 26.4 * scaleY).stroke();
  doc.rect((100 - 5.8) * scaleX, 36.8 * scaleY, 5.8 * scaleX, 26.4 * scaleY).stroke();
  
  // Círculo central
  doc.circle(width / 2, height / 2, 8.7 * scaleX).stroke();
  
  // Puntos
  doc.fillColor('#4CAF50');
  doc.circle(width / 2, height / 2, 3).fill();
  doc.circle(11 * scaleX, height / 2, 3).fill();
  doc.circle((100 - 11) * scaleX, height / 2, 3).fill();
  
  doc.restore();
}

function generateCoverPage(doc: typeof PDFDocument, matchData: MatchData, homeActions: MatchAction[]) {
  const { homeName, awayName } = matchData.config;
  
  // Fondo negro
  doc.rect(0, 0, doc.page.width, doc.page.height).fill('#0a0a0a');
  
  // Título principal
  doc.fillColor('#4CAF50')
     .fontSize(36)
     .font('Helvetica-Bold')
     .text('📊 INFORME DE ANÁLISIS', 50, 80, { align: 'center', width: doc.page.width - 100 });
  
  doc.fillColor('white')
     .fontSize(28)
     .text(`${homeName.toUpperCase()} vs ${awayName.toUpperCase()}`, 50, 140, { align: 'center', width: doc.page.width - 100 });
  
  doc.fillColor('#888888')
     .fontSize(14)
     .font('Helvetica')
     .text(new Date().toLocaleString('es-ES'), 50, 190, { align: 'center', width: doc.page.width - 100 });
  
  // Estadísticas principales
  const totalActions = homeActions.length;
  const uniquePlayers = new Set(homeActions.map(a => a.player)).size;
  const actionCounts = homeActions.reduce((acc, a) => {
    acc[a.type] = (acc[a.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topAction = Object.entries(actionCounts).sort((a, b) => b[1] - a[1])[0];
  
  // Cajas de métricas
  const metrics = [
    { label: '📈 Total Acciones', value: totalActions, x: 70 },
    { label: '👥 Jugadores', value: uniquePlayers, x: 250 },
    { label: '⭐ Acción Principal', value: topAction?.[0] || 'N/A', x: 410 }
  ];
  
  metrics.forEach(({ label, value, x }) => {
    doc.rect(x, 250, 140, 80).fillAndStroke('#1e1e1e', '#4CAF50');
    doc.fillColor('#cccccc').fontSize(12).font('Helvetica').text(label, x + 10, 270, { width: 120, align: 'center' });
    doc.fillColor('#4CAF50').fontSize(20).font('Helvetica-Bold').text(String(value), x + 10, 295, { width: 120, align: 'center' });
  });
  
  // Top 5 jugadores
  const playerCounts = homeActions.reduce((acc, a) => {
    acc[a.player] = (acc[a.player] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topPlayers = Object.entries(playerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  doc.fillColor('white').fontSize(18).font('Helvetica-Bold').text('🏆 TOP 5 JUGADORES', 70, 380);
  
  topPlayers.forEach(([player, count], i) => {
    const y = 420 + i * 40;
    doc.rect(70, y, 450, 30).fillAndStroke('#1a1a1a', '#2196F3');
    doc.fillColor('white').fontSize(14).font('Helvetica').text(`${i + 1}. ${player}`, 85, y + 8);
    doc.fillColor('#4CAF50').fontSize(14).font('Helvetica-Bold').text(`${count} acciones`, 400, y + 8);
  });
  
  // Pie de página
  doc.fillColor('#666666').fontSize(10).font('Helvetica').text('Attack Metrics Suite © 2026', 0, doc.page.height - 50, { align: 'center', width: doc.page.width });
}

function generateHeatmapPage(doc: typeof PDFDocument, matchData: MatchData, homeActions: MatchAction[]) {
  doc.addPage();
  
  // Fondo
  doc.rect(0, 0, doc.page.width, doc.page.height).fill('#0a0a0a');
  
  // Título
  doc.fillColor('#4CAF50')
     .fontSize(24)
     .font('Helvetica-Bold')
     .text(`🔥 MAPA DE ACTIVIDAD - ${matchData.config.homeName.toUpperCase()}`, 50, 50, { align: 'center', width: doc.page.width - 100 });
  
  doc.fillColor('white')
     .fontSize(14)
     .text(`${homeActions.length} acciones registradas`, 50, 85, { align: 'center', width: doc.page.width - 100 });
  
  // Campo
  const fieldWidth = 500;
  const fieldHeight = 350;
  const fieldX = (doc.page.width - fieldWidth) / 2;
  const fieldY = 130;
  
  drawPitch(doc, fieldX, fieldY, fieldWidth, fieldHeight);
  
  // Puntos de acciones (invertir Y)
  doc.fillColor('#ffeb3b').opacity(0.6);
  homeActions.forEach(action => {
    const px = fieldX + (action.x / 100) * fieldWidth;
    const py = fieldY + ((100 - action.y) / 100) * fieldHeight;
    doc.circle(px, py, 4).fill();
  });
  
  doc.opacity(1);
  
  // Leyenda
  doc.fillColor('white').fontSize(12).font('Helvetica').text('Zonas de mayor actividad indicadas por concentración de puntos', 50, fieldY + fieldHeight + 30, { align: 'center', width: doc.page.width - 100 });
}

export async function POST(req: NextRequest) {
  try {
    console.log('[REPORTS] Iniciando generación de informe...');
    
    // Verificar autenticación
    const session = await auth();
    if (!session?.user) {
      console.log('[REPORTS] No autorizado - sin sesión');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener datos del partido
    const body = await req.json();
    const { matchData } = body as { matchData: MatchData };

    if (!matchData || !matchData.actions || !matchData.config) {
      return NextResponse.json({ error: 'Datos del partido inválidos' }, { status: 400 });
    }

    console.log('[REPORTS] Generando PDF con Node.js...');

    // Filtrar acciones del equipo local
    const homeActions = matchData.actions.filter(a => a.team === 'HOME');

    // Crear PDF
    const doc = new PDFDocument({ size: 'A4', margin: 0 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    
    const pdfPromise = new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });

    // Generar páginas
    generateCoverPage(doc, matchData, homeActions);
    generateHeatmapPage(doc, matchData, homeActions);

    // Finalizar PDF
    doc.end();

    const pdfBuffer = await pdfPromise;
    console.log('[REPORTS] PDF generado, tamaño:', pdfBuffer.length, 'bytes');

    // Nombre del archivo
    const fileName = `Informe_${matchData.config.homeName}_vs_${matchData.config.awayName}_${new Date().toISOString().split('T')[0]}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('[REPORTS] Error en generate report:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: String(error) },
      { status: 500 }
    );
  }
}
