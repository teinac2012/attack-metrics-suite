import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST() {
  const session = await auth();
  
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Usar upsert en lugar de update para evitar errores si el registro no existe
  await prisma.sessionLock.upsert({
    where: { userId: (session.user as any).id },
    update: { lastSeen: new Date() },
    create: { 
      userId: (session.user as any).id, 
      sessionId: "heartbeat",
      lastSeen: new Date()
    }
  }).catch(err => {
    console.error("[SESSION_LOCK] Heartbeat error:", err);
  });
  
  return new Response('ok');
}