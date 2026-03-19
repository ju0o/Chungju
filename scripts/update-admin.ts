const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const p = new PrismaClient();

(async () => {
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
  process.exit(0);
})();
