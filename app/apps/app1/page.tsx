import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import SessionHeartbeat from "@/components/SessionHeartbeat";
import AppsNavBar from "@/components/AppsNavBar";
import AppContainer from "@/components/AppContainer";
import { prisma } from "@/lib/prisma";

export default async function App1Page() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  // Validar que tenga licencia activa
  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    include: { licenses: { where: { isActive: true }, take: 1 } }
  });

  if (!user || user.licenses.length === 0) {
    redirect("/login");
  }

  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
      <SessionHeartbeat />
      <AppsNavBar userName={session.user.name || "Usuario"} />
      <AppContainer appUrl="/IA%20PASES%20TACTICO1bCDEFG.html" appName="Analista Pro" appId="app1" />
    </div>
  );
}