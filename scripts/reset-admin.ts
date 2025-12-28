import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function resetAndCreateAdmin() {
  try {
    console.log("🗑️  Eliminando datos relacionados...");
    
    // Eliminar en orden para respetar las foreign keys
    await prisma.sessionLock.deleteMany({});
    console.log("   ✅ SessionLocks eliminados");
    
    await prisma.loginAttempt.deleteMany({});
    console.log("   ✅ LoginAttempts eliminados");
    
    await prisma.loginAudit.deleteMany({});
    console.log("   ✅ LoginAudit eliminado");
    
    await prisma.analysis.deleteMany({});
    console.log("   ✅ Analysis eliminados");
    
    await prisma.appData.deleteMany({});
    console.log("   ✅ AppData eliminados");
    
    await prisma.session.deleteMany({});
    console.log("   ✅ Sessions eliminadas");
    
    await prisma.account.deleteMany({});
    console.log("   ✅ Accounts eliminadas");
    
    await prisma.license.deleteMany({});
    console.log("   ✅ Licenses eliminadas");
    
    const deletedUsers = await prisma.user.deleteMany({});
    console.log(`   ✅ ${deletedUsers.count} usuarios eliminados`);

    console.log("\n📝 Creando usuario admin...");
    
    // Hashear contraseña
    const passwordHash = await bcrypt.hash("admin1234", 10);

    // Crear usuario admin
    const admin = await prisma.user.create({
      data: {
        username: "admin",
        passwordHash: passwordHash,
        email: "admin@attack.com",
        role: "ADMIN",
        passwordRotatedAt: new Date(),
        mustChangePassword: false,
        licenses: {
          create: {
            startDate: new Date(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 año
            isActive: true,
          },
        },
      },
    });

    console.log("\n✅ Usuario administrador creado exitosamente:");
    console.log("   - Usuario: admin");
    console.log("   - Contraseña: admin1234");
    console.log("   - Email: admin@attack.com");
    console.log("   - Rol: ADMIN");
    console.log(`   - Licencia válida hasta: ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString("es-MX")}`);
    console.log("\n🎉 Base de datos lista para usar!");

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetAndCreateAdmin();
