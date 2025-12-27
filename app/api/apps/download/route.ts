import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { filename, data, mimeType } = body;

    if (!filename || !data) {
      return NextResponse.json(
        { error: "filename y data son requeridos" },
        { status: 400 }
      );
    }

    // Convertir base64 a buffer
    const buffer = Buffer.from(data, 'base64');

    // Retornar como archivo descargable
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': mimeType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error en descarga:", error);
    return NextResponse.json(
      { error: "Error procesando descarga" },
      { status: 500 }
    );
  }
}
