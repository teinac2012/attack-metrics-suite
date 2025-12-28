import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function createAdmin() {
  try {
    console.log("📝 Creando/actualizando usuario admin...");
    
    // Hashear contraseña
    const passwordHash = await bcrypt.hash("admin1234", 10);

    // Buscar si ya existe admin
    const existing = await prisma.user.findUnique({
      where: { username: "admin" },
      include: { licenses: true },
    });

    if (existing) {
      console.log("   Usuario admin existe, actualizando contraseña...");
      
      // Actualizar contraseña
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          passwordHash: passwordHash,
          role: "ADMIN",
          passwordRotatedAt: new Date(),
          mustChangePassword: false,
        },
      });

      // Asegurar que tenga licencia
      if (existing.licenses.length === 0) {
        await prisma.license.create({
          data: {
            userId: existing.id,
            startDate: new Date(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            isActive: true,
          },
        });
        console.log("   ✅ Licencia añadida");
      } else {
        // Actualizar licencia existente
        await prisma.license.update({
          where: { id: existing.licenses[0].id },
          data: {
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            isActive: true,
          },
        });
        console.log("   ✅ Licencia actualizada");
      }

    } else {
      console.log("   Creando nuevo usuario admin...");
      
      // Crear usuario admin
      await prisma.user.create({
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
              endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
              isActive: true,
            },
          },
        },
      });
      console.log("   ✅ Usuario creado");
    }

    console.log("\n✅ Usuario administrador listo:");
    console.log("   - Usuario: admin");
    console.log("   - Contraseña: admin1234");
    console.log("   - Email: admin@attack.com");
    console.log("   - Rol: ADMIN");
    console.log(`   - Licencia válida hasta: ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString("es-MX")}`);
    console.log("\n🎉 Listo para usar!");

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
