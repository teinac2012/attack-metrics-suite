import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export const maxDuration = 60; // 60 segundos para Vercel Pro

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jsonFile, team = 'HOME' } = body;

    if (!jsonFile) {
      return NextResponse.json(
        { error: 'jsonFile path is required' },
        { status: 400 }
      );
    }

    // Ejecutar script Python
    const result = await runPythonScript(jsonFile, team);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in heatmap API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function runPythonScript(jsonFile: string, team: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(process.cwd(), 'scripts', 'generate_heatmap.py');
    
    const pythonProcess = spawn('python', [pythonScript, jsonFile, team], {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    pythonProcess.stdout?.on('data', (data: Buffer) => {
      stdout += data.toString();
    });

    pythonProcess.stderr?.on('data', (data: Buffer) => {
      stderr += data.toString();
      console.error('Python error:', data.toString());
    });

    pythonProcess.on('close', (code: number | null) => {
      if (code === 0) {
        try {
          const result = JSON.parse(stdout);
          resolve(result);
        } catch (e) {
          reject(new Error('Failed to parse Python output'));
        }
      } else {
        reject(new Error(`Python script failed: ${stderr}`));
      }
    });

    pythonProcess.on('error', (err: Error) => {
      reject(err);
    });
  });
}
