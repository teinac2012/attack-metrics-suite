import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    console.log('[REPORTS] Iniciando generación de informe...');
    
    // Verificar autenticación
    const session = await auth();
    if (!session?.user) {
      console.log('[REPORTS] No autorizado - sin sesión');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    console.log('[REPORTS] Usuario autenticado:', session.user);

    // Obtener datos del partido
    const body = await req.json();
    const { matchData } = body;
    console.log('[REPORTS] Datos recibidos, config:', matchData?.config);

    if (!matchData || !matchData.actions || !matchData.config) {
      console.error('[REPORTS] Datos inválidos:', { 
        hasMatchData: !!matchData, 
        hasActions: !!matchData?.actions, 
        hasConfig: !!matchData?.config 
      });
      return NextResponse.json(
        { error: 'Datos del partido inválidos' },
        { status: 400 }
      );
    }

    console.log('[REPORTS] Validación de datos OK');

    // Crear directorio temporal
    const tempDir = path.join(process.cwd(), 'temp', 'reports');
    await fs.mkdir(tempDir, { recursive: true });
    console.log('[REPORTS] Directorio temporal creado:', tempDir);

    // Generar ID único para este informe
    const reportId = randomUUID();
    const jsonPath = path.join(tempDir, `${reportId}.json`);
    const pdfPath = path.join(tempDir, `${reportId}.pdf`);

    // Guardar JSON temporal
    await fs.writeFile(jsonPath, JSON.stringify(matchData, null, 2));
    console.log('[REPORTS] JSON guardado:', jsonPath);

    // Ejecutar script Python usando el entorno virtual
    const pythonScript = path.join(process.cwd(), 'scripts', 'generate-report.py');
    const pythonExecutable = path.join(process.cwd(), '.venv', 'Scripts', 'python.exe');
    console.log('[REPORTS] Ejecutando script Python:', pythonScript);
    console.log('[REPORTS] Usando Python:', pythonExecutable);
    
    return new Promise<NextResponse>((resolve) => {
      const pythonProcess = spawn(pythonExecutable, [pythonScript, jsonPath, pdfPath]);
      console.log('[REPORTS] Proceso Python iniciado');

      let errorOutput = '';

      pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
        console.error('[REPORTS] Python stderr:', data.toString());
      });

      pythonProcess.stdout.on('data', (data) => {
        console.log('[REPORTS] Python stdout:', data.toString());
      });

      pythonProcess.on('close', async (code) => {
        console.log('[REPORTS] Proceso Python finalizado con código:', code);
        
        // Limpiar JSON temporal
        try {
          await fs.unlink(jsonPath);
          console.log('[REPORTS] JSON temporal eliminado');
        } catch (err) {
          console.error('[REPORTS] Error limpiando archivo temporal:', err);
        }

        if (code !== 0) {
          console.error('[REPORTS] Error en Python. Código:', code, 'Output:', errorOutput);
          resolve(
            NextResponse.json(
              { error: 'Error generando el informe', details: errorOutput },
              { status: 500 }
            )
          );
          return;
        }

        try {
          console.log('[REPORTS] Leyendo PDF generado:', pdfPath);
          // Leer PDF generado
          const pdfBuffer = await fs.readFile(pdfPath);
          console.log('[REPORTS] PDF leído, tamaño:', pdfBuffer.length, 'bytes');

          // Limpiar PDF temporal
          await fs.unlink(pdfPath);
          console.log('[REPORTS] PDF temporal eliminado');

          // Nombre del archivo
          const fileName = `Informe_${matchData.config.homeName}_vs_${matchData.config.awayName}_${new Date().toISOString().split('T')[0]}.pdf`;
          console.log('[REPORTS] Enviando PDF al cliente:', fileName);

          // Devolver PDF
          resolve(
            new NextResponse(pdfBuffer, {
              headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${fileName}"`,
              },
            })
          );
        } catch (err) {
          console.error('[REPORTS] Error leyendo PDF:', err);
          resolve(
            NextResponse.json(
              { error: 'Error leyendo el PDF generado' },
              { status: 500 }
            )
          );
        }
      });
    });
  } catch (error) {
    console.error('[REPORTS] Error en generate report:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: String(error) },
      { status: 500 }
    );
  }
}
