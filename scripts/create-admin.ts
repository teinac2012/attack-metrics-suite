import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL no está configurado en .env');
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const username = process.argv[2] || 'admin';
  const password = process.argv[3] || 'admin123';
  const email = process.argv[4] || 'admin@example.com';

  console.log(`Creando usuario administrador: ${username}`);

  // Check if user exists
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    console.log('El usuario ya existe');
    process.exit(0);
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create user with 1-year license
  const user = await prisma.user.create({
    data: {
      username,
      email,
      passwordHash,
      role: 'ADMIN',
      licenses: {
        create: {
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
          isActive: true
        }
      }
    },
    include: {
      licenses: true
    }
  });

  console.log('✅ Usuario administrador creado exitosamente:');
  console.log(`   - Usuario: ${user.username}`);
  console.log(`   - Email: ${user.email}`);
  console.log(`   - Contraseña: ${password}`);
  console.log(`   - Licencia válida hasta: ${user.licenses[0].endDate.toLocaleDateString()}`);
  console.log('\n⚠️  IMPORTANTE: Cambia esta contraseña después del primer login');

  await pool.end();
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  });