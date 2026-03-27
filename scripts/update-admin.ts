import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const p = new PrismaClient();

async function main() {
  const h = await bcrypt.hash('zxcv25801!', 12);
  const e = await p.adminUser.findFirst();
  if (e) {
    await p.adminUser.update({
      where: { id: e.id },
      data: { email: 'skkse150@gmail.com', passwordHash: h, name: '최고관리자' },
    });
    console.log('Updated:', e.id);
  } else {
    const a = await p.adminUser.create({
      data: { email: 'skkse150@gmail.com', passwordHash: h, name: '최고관리자', role: 'SUPER_ADMIN' },
    });
    console.log('Created:', a.id);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await p.$disconnect();
  });
