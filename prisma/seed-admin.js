const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

const ADMIN_EMAIL = 'admin@midnight.news';
const ADMIN_PASSWORD = 'Password1234!!!!';
const ADMIN_NAME = 'Admin';

async function main() {
  const hashedPassword = await hash(ADMIN_PASSWORD, 10);

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { password: hashedPassword, name: ADMIN_NAME, role: 'ADMIN', active: true },
    create: {
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      password: hashedPassword,
      role: 'ADMIN',
      provider: 'EMAIL',
      active: true,
    },
  });

  console.log('Admin created:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
