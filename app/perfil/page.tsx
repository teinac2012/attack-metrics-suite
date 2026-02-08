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

  if (!user || user.licenses.length === 0) {
    redirect("/login");
  }

  const license = user.licenses[0];
  const daysLeft = license 
    ? Math.ceil((new Date(license.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="min-h-screen bg-[#080c14] text-white relative overflow-hidden">
      {/* Grid pattern background */}
      <div className="absolute inset-0 bg-grid opacity-15 pointer-events-none" />
      
      {/* Efectos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 left-0 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px]" />
        <div className="absolute -bottom-1/4 right-0 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px]" />
      </div>
      
      <SessionHeartbeat />
      <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
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
