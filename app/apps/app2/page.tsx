import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import SessionHeartbeat from "@/components/SessionHeartbeat";
import AppsNavBar from "@/components/AppsNavBar";
import { prisma } from "@/lib/prisma";

export default async function App2Page() {
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
      
      {/* Contenedor del iframe con estilo mejorado */}
      <div className="flex-1 overflow-hidden p-4">
        <div className="h-full rounded-xl overflow-hidden shadow-2xl border border-gray-700/50 bg-black">
          <iframe 
            src="/prueba111ABCDE.HTML"
            className="w-full h-full"
            title="Attack Metrics"
          />
        </div>
      </div>
    </div>
  );
}