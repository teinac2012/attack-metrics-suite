import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener datos del partido
    const body = await req.json();
    const { matchData } = body;

    if (!matchData || !matchData.actions || !matchData.config) {
      return NextResponse.json(
        { error: 'Datos del partido inválidos' },
        { status: 400 }
      );
    }

    // Crear directorio temporal
    const tempDir = path.join(process.cwd(), 'temp', 'reports');
    await fs.mkdir(tempDir, { recursive: true });

    // Generar ID único para este informe
    const reportId = randomUUID();
    const jsonPath = path.join(tempDir, `${reportId}.json`);
    const pdfPath = path.join(tempDir, `${reportId}.pdf`);

    // Guardar JSON temporal
    await fs.writeFile(jsonPath, JSON.stringify(matchData, null, 2));

    // Ejecutar script Python
    const pythonScript = path.join(process.cwd(), 'scripts', 'generate-report.py');
    
    return new Promise((resolve) => {
      const pythonProcess = spawn('python', [pythonScript, jsonPath, pdfPath]);

      let errorOutput = '';

      pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      pythonProcess.on('close', async (code) => {
        // Limpiar JSON temporal
        try {
          await fs.unlink(jsonPath);
        } catch (err) {
          console.error('Error limpiando archivo temporal:', err);
        }

        if (code !== 0) {
          console.error('Error en Python:', errorOutput);
          resolve(
            NextResponse.json(
              { error: 'Error generando el informe', details: errorOutput },
              { status: 500 }
            )
          );
          return;
        }

        try {
          // Leer PDF generado
          const pdfBuffer = await fs.readFile(pdfPath);

          // Limpiar PDF temporal
          await fs.unlink(pdfPath);

          // Nombre del archivo
          const fileName = `Informe_${matchData.config.homeName}_vs_${matchData.config.awayName}_${new Date().toISOString().split('T')[0]}.pdf`;

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
          console.error('Error leyendo PDF:', err);
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
    console.error('Error en generate report:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
