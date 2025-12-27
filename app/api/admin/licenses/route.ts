import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") {
    return new Response("Unauthorized", { status: 401 });
  }

  let body: any;
  const contentType = req.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    body = await req.json();
  } else if (contentType.includes("application/x-www-form-urlencoded")) {
    const form = await req.formData();
    body = Object.fromEntries(form.entries());
  } else {
    body = await req.json().catch(() => ({}));
  }

  const userId = (body.userId || "").trim();
  const durationDays = parseInt(body.durationDays || "365", 10);

  if (!userId) {
    return new Response(JSON.stringify({ error: "userId requerido" }), { status: 400 });
  }

  const license = await prisma.license.findFirst({ where: { userId, isActive: true } });
  const endDate = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

  if (!license) {
    await prisma.license.create({
      data: { userId, startDate: new Date(), endDate, isActive: true },
    });
  } else {
    await prisma.license.update({
      where: { id: license.id },
      data: { endDate, isActive: true },
    });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}

export async function POST(req: Request) {
  // alias to PATCH for form submissions
  return PATCH(req);
}
