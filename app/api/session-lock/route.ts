import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST() {
  const session = await auth();
  
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  await prisma.sessionLock.update({
    where: { userId: (session.user as any).id },
    data: { lastSeen: new Date() }
  }).catch(() => {});
  
  return new Response('ok');
}