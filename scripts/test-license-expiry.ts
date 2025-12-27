import { prisma } from "@/lib/prisma";

async function testLicenseExpiry() {
  const username = process.argv[2] || "admin";
  
  const user = await prisma.user.findUnique({
    where: { username },
    include: { licenses: { where: { isActive: true }, take: 1 } }
  });

  if (!user) {
    console.error(`Usuario "${username}" no encontrado`);
    process.exit(1);
  }

  if (!user.licenses.length) {
    console.error(`Usuario "${username}" no tiene licencia activa`);
    process.exit(1);
  }

  const expiryTime = new Date(Date.now() + 60 * 1000); // 1 minuto desde ahora
  const license = user.licenses[0];

  await prisma.license.update({
    where: { id: license.id },
    data: { endDate: expiryTime }
  });

  console.log(`✅ Licencia de "${username}" actualizada a expirar en 1 minuto`);
  console.log(`   Hora de expiración: ${expiryTime.toLocaleString("es-MX")}`);
  console.log(`\n📌 Ahora inicia sesión como "${username}" para probar el flujo`);
}

testLicenseExpiry().catch(console.error).finally(() => process.exit(0));
