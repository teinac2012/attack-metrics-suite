const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

function loadEnv() {
  const candidates = [".env.local", ".env"]; // prefer local override
  for (const filename of candidates) {
    const full = path.join(__dirname, "..", filename);
    if (!fs.existsSync(full)) continue;
    const lines = fs.readFileSync(full, "utf8").split(/\r?\n/);
    for (const line of lines) {
      if (!line || line.trim().startsWith("#")) continue;
      const match = line.match(/^\s*([^=\s#]+)\s*=\s*(.*)\s*$/);
      if (!match) continue;
      const key = match[1];
      let val = match[2];
      if ((val.startsWith("\"") && val.endsWith("\"")) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

loadEnv();
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL no está definido. Añádelo en .env.local o .env");
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter, log: ["warn", "error"] });

async function ensureAdmin(username, password, email) {
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { username },
    update: {
      passwordHash,
      role: "ADMIN",
      passwordRotatedAt: new Date(),
      mustChangePassword: false,
    },
    create: {
      username,
      passwordHash,
      email,
      role: "ADMIN",
      passwordRotatedAt: new Date(),
      mustChangePassword: false,
    },
  });

  const existingLicense = await prisma.license.findFirst({ where: { userId: user.id } });
  const endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

  if (existingLicense) {
    await prisma.license.update({
      where: { id: existingLicense.id },
      data: { endDate, isActive: true },
    });
  } else {
    await prisma.license.create({
      data: { userId: user.id, startDate: new Date(), endDate, isActive: true },
    });
  }

  console.log(`✅ Admin listo: ${username}`);
}

async function main() {
  try {
    await ensureAdmin("admin", "admin1234", "admin@attack.com");
    await ensureAdmin("santibuzon", "santibuzon1", "santibuzon@attack.com");
  } catch (err) {
    console.error("❌ Error creando admins:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
