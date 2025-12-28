import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function upsertAdminUser(
  username: string,
  password: string,
  email: string
) {
  const passwordHash = await bcrypt.hash(password, 10);

  const existing = await prisma.user.findUnique({
    where: { username },
    include: { licenses: true },
  });

  if (existing) {
    console.log(`   Usuario ${username} existe, actualizando contraseña y rol...`);
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        passwordHash,
        role: "ADMIN",
        passwordRotatedAt: new Date(),
        mustChangePassword: false,
      },
    });

    if (existing.licenses.length === 0) {
      await prisma.license.create({
        data: {
          userId: existing.id,
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          isActive: true,
        },
      });
      console.log(`   ✅ Licencia añadida para ${username}`);
    } else {
      await prisma.license.update({
        where: { id: existing.licenses[0].id },
        data: {
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          isActive: true,
        },
      });
      console.log(`   ✅ Licencia actualizada para ${username}`);
    }
  } else {
    console.log(`   Creando nuevo usuario admin '${username}'...`);
    await prisma.user.create({
      data: {
        username,
        passwordHash,
        email,
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
    console.log(`   ✅ Usuario '${username}' creado`);
  }
}

async function createAdmins() {
  try {
    console.log("📝 Creando/actualizando usuarios admin protegidos...");

    await upsertAdminUser("admin", "admin1234", "admin@attack.com");
    await upsertAdminUser("santibuzon", "santibuzon1", "santibuzon@attack.com");

    console.log("\n✅ Usuarios administradores listos:");
    console.log("   - admin / admin1234");
    console.log("   - santibuzon / santibuzon1");
    console.log("   Rol: ADMIN para ambos");
    console.log(`   Licencias válidas hasta: ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString("es-MX")}`);
    console.log("\n🎉 Listo para usar!");

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmins();
