import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Delete in order to respect foreign keys
  await prisma.report.deleteMany();
  await prisma.moderationLog.deleteMany();
  await prisma.savedItem.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.content.deleteMany();
  await prisma.user.deleteMany({
    where: { role: { not: 'ADMIN' } },
  });

  const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
  console.log('Database cleared. Admin users remaining:', adminCount);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
