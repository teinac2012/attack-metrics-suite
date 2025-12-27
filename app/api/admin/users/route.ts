import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
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

  const username = (body.username || "").trim();
  const password = (body.password || "").trim();
  const email = (body.email || "").trim() || null;
  const durationDays = parseInt(body.durationDays || "365", 10);

  if (!username || !password) {
    return new Response(JSON.stringify({ error: "Faltan campos" }), { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return new Response(JSON.stringify({ error: "Usuario ya existe" }), { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const endDate = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      passwordHash,
      role: "USER",
      licenses: {
        create: {
          startDate: new Date(),
          endDate,
          isActive: true,
        },
      },
    },
    include: { licenses: true },
  });

  await prisma.sessionLock.upsert({
    where: { userId: user.id },
    update: { lastSeen: new Date(), sessionId: "init" },
    create: { userId: user.id, sessionId: "init", lastSeen: new Date() },
  });

  return new Response(JSON.stringify({ success: true, user }), { status: 201 });
}
