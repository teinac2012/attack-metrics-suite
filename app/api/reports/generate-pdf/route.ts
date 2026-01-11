import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink, readFile } from 'fs/promises';
import { join } from 'path';
import { spawn } from 'child_process';
import { tmpdir } from 'os';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Validar datos
    if (!data.actions || !Array.isArray(data.actions) || data.actions.length === 0) {
      return NextResponse.json(
        { error: 'No hay datos válidos para generar el informe' },
        { status: 400 }
      );
    }

    // Crear archivo temporal con los datos
    const tempJsonPath = join(tmpdir(), `match_data_${Date.now()}.json`);
    const tempPdfPath = join(tmpdir(), `report_${Date.now()}.pdf`);

    await writeFile(tempJsonPath, JSON.stringify(data, null, 2), 'utf-8');

    // Determinar la ruta del script Python
    const scriptPath = join(process.cwd(), 'scripts', 'generate-heatmap-report.py');

    // Ejecutar el script Python
    const result = await executePythonScript(scriptPath, [tempJsonPath, tempPdfPath]);

    if (!result.success) {
      console.error('Error en script Python:', result.error);
      // Limpiar archivo temporal
      try {
        await unlink(tempJsonPath);
      } catch {}
      return NextResponse.json(
        { error: 'Error al generar el informe PDF', details: result.error },
        { status: 500 }
      );
    }

    // Leer el PDF generado
    const pdfBuffer = await readFile(tempPdfPath);

    // Limpiar archivos temporales
    try {
      await unlink(tempJsonPath);
      await unlink(tempPdfPath);
    } catch (err) {
      console.error('Error limpiando archivos temporales:', err);
    }

    // Devolver el PDF
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Informe_${data.config?.homeTeam || 'LOCAL'}_vs_${data.config?.awayTeam || 'VISITANTE'}_${data.config?.date || new Date().toISOString().split('T')[0]}.pdf"`,
      },
    });

  } catch (error: any) {
    console.error('Error generando informe PDF:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}

function executePythonScript(scriptPath: string, args: string[]): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve) => {
    // Intentar usar el entorno virtual si existe
    const pythonCmd = process.platform === 'win32' 
      ? join(process.cwd(), '.venv', 'Scripts', 'python.exe')
      : join(process.cwd(), '.venv', 'bin', 'python');

    const fs = require('fs');
    const usePython = fs.existsSync(pythonCmd) ? pythonCmd : 'python';

    const pythonProcess = spawn(usePython, [scriptPath, ...args]);

    let errorOutput = '';

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.error(`Python stderr: ${data}`);
    });

    pythonProcess.stdout.on('data', (data) => {
      console.log(`Python stdout: ${data}`);
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        resolve({ success: false, error: errorOutput || `Proceso terminó con código ${code}` });
      } else {
        resolve({ success: true });
      }
    });

    pythonProcess.on('error', (error) => {
      resolve({ success: false, error: error.message });
    });
  });
}
