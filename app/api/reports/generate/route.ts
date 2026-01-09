import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { generateHTMLReport, type MatchData } from '@/lib/pdf-generator';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

// Configuración para Vercel
export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    console.log('[REPORTS] === Iniciando generación de informe con Puppeteer ===');
    
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

    console.log('[REPORTS] Datos validados -', matchData.config.homeName, 'vs', matchData.config.awayName);

    // Generar HTML
    const html = generateHTMLReport(matchData);
    console.log('[REPORTS] HTML generado');

    // Lanzar navegador
    console.log('[REPORTS] Iniciando Chromium...');
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1920, height: 1080 },
      executablePath: await chromium.executablePath(),
      headless: true,
    });

    const page = await browser.newPage();
    console.log('[REPORTS] Página creada');

    // Cargar HTML
    await page.setContent(html, { waitUntil: 'networkidle0' });
    console.log('[REPORTS] HTML cargado en página');

    // Generar PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });

    await browser.close();
    console.log('[REPORTS] PDF generado, tamaño:', pdfBuffer.length, 'bytes');

    // Nombre del archivo
    const fileName = `Informe_${matchData.config.homeName}_vs_${matchData.config.awayName}_${new Date().toISOString().split('T')[0]}.pdf`;

    return new NextResponse(Buffer.from(pdfBuffer), {
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
