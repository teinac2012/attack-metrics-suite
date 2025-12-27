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

    // Enviar mensaje a los iframes para que limpien su localStorage
    // Este endpoint solo sirve como confirmación, el reset real se hace en el cliente
    return NextResponse.json({
      success: true,
      message: "Reset iniciado en todas las aplicaciones",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error en reset:", error);
    return NextResponse.json(
      { error: "Error al resetear las aplicaciones" },
      { status: 500 }
    );
  }
}
