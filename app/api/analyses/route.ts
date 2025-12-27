import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET - Obtener análisis del usuario
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const appName = searchParams.get("appName");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Si hay ID, devolver un solo análisis
    if (id) {
      const analysis = await prisma.analysis.findUnique({
        where: { id },
      });

      if (!analysis || analysis.userId !== userId) {
        return NextResponse.json({ error: "Análisis no encontrado" }, { status: 404 });
      }

      return NextResponse.json({ analysis });
    }

    // Si no, devolver lista filtrada
    const analyses = await prisma.analysis.findMany({
      where: {
        userId,
        ...(appName && { appName }),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ analyses });
  } catch (error) {
    console.error("[ANALYSIS_GET] Error:", error);
    return NextResponse.json({ error: "Error al obtener análisis" }, { status: 500 });
  }
}

// POST - Crear nuevo análisis
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { appName, title, data, tags, notes } = await req.json();

    if (!appName || !title || !data) {
      return NextResponse.json(
        { error: "appName, title y data son requeridos" },
        { status: 400 }
      );
    }

    const analysis = await prisma.analysis.create({
      data: {
        userId,
        appName,
        title,
        data: JSON.stringify(data),
        tags: tags || [],
        notes,
      },
    });

    return NextResponse.json({ analysis }, { status: 201 });
  } catch (error) {
    console.error("[ANALYSIS_POST] Error:", error);
    return NextResponse.json({ error: "Error al crear análisis" }, { status: 500 });
  }
}

// DELETE - Eliminar análisis
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    // Verificar que el análisis pertenece al usuario
    const analysis = await prisma.analysis.findUnique({ where: { id } });
    if (!analysis || analysis.userId !== userId) {
      return NextResponse.json({ error: "Análisis no encontrado" }, { status: 404 });
    }

    await prisma.analysis.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ANALYSIS_DELETE] Error:", error);
    return NextResponse.json({ error: "Error al eliminar análisis" }, { status: 500 });
  }
}

// PUT - Actualizar análisis
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { id, title, tags, notes, data } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    // Verificar que el análisis pertenece al usuario
    const existing = await prisma.analysis.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: "Análisis no encontrado" }, { status: 404 });
    }

    const analysis = await prisma.analysis.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(tags && { tags }),
        ...(notes !== undefined && { notes }),
        ...(data && { data: JSON.stringify(data) }),
      },
    });

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("[ANALYSIS_PUT] Error:", error);
    return NextResponse.json({ error: "Error al actualizar análisis" }, { status: 500 });
  }
}
