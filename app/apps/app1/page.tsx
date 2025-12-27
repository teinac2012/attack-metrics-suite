import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import SessionHeartbeat from "@/components/SessionHeartbeat";

export default async function App1Page() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="h-screen w-full flex flex-col bg-black">
      <SessionHeartbeat />
      <div className="h-12 bg-gray-900 border-b border-gray-700 flex items-center justify-between px-4">
        <h1 className="text-white font-bold">IA Pases Táctico - Analista Pro</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">Usuario: {session.user.name}</span>
          <a href="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
            Volver al Dashboard
          </a>
        </div>
      </div>
      <iframe 
        src="/IA%20PASES%20TACTICO1bCDEFG.html"
        className="flex-1 w-full border-none"
        title="IA Pases Táctico"
      />
    </div>
  );
}