import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

    const { appId, data } = await request.json();

    if (!appId || data === undefined) {
      return NextResponse.json(
        { error: "appId y data son requeridos" },
        { status: 400 }
      );
    }

    // Guardar datos en la base de datos
    const result = await prisma.appData.upsert({
      where: {
        userId_appId: {
          userId: (session.user as any).id,
          appId: appId,
        },
      },
      update: {
        data: data,
        updatedAt: new Date(),
      },
      create: {
        userId: (session.user as any).id,
        appId: appId,
        data: data,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Datos guardados correctamente",
      appData: result,
    });
  } catch (error) {
    console.error("Error al guardar datos:", error);
    return NextResponse.json(
      { error: "Error al guardar los datos" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const appId = searchParams.get("appId");

    if (!appId) {
      return NextResponse.json(
        { error: "appId es requerido" },
        { status: 400 }
      );
    }

    // Recuperar datos de la base de datos
    const appData = await prisma.appData.findUnique({
      where: {
        userId_appId: {
          userId: (session.user as any).id,
          appId: appId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: appData?.data || null,
    });
  } catch (error) {
    console.error("Error al recuperar datos:", error);
    return NextResponse.json(
      { error: "Error al recuperar los datos" },
      { status: 500 }
    );
  }
}
