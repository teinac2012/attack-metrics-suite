import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SessionHeartbeat from "@/components/SessionHeartbeat";
import PerfilClient from "./PerfilClient";

export default async function PerfilPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    include: { licenses: { where: { isActive: true }, take: 1 } },
  });

  if (!user) redirect("/login");

  const license = user.licenses[0];
  const daysLeft = license 
    ? Math.ceil((new Date(license.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <SessionHeartbeat />
      <div className="container mx-auto px-4 py-12 relative z-10">
        <PerfilClient 
          username={user.username}
          email={user.email}
          role={user.role}
          daysLeft={daysLeft}
          createdAt={user.createdAt}
          userId={user.id}
        />
      </div>
    </div>
  );
}
