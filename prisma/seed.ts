import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SUPER_ADMIN_EMAIL || 'admin@festival.com';
  const password = process.env.SUPER_ADMIN_PASSWORD || 'admin1234';

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    console.log(`Super admin already exists: ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await prisma.adminUser.create({
    data: {
      email,
      passwordHash,
      name: '최고관리자',
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });

  console.log(`Super admin created: ${admin.email} (${admin.id})`);

  // Create a default festival
  const festival = await prisma.festival.create({
    data: {
      name: '충주 축제',
      description: '충주에서 열리는 특별한 축제입니다.',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      location: '충주시',
      isActive: true,
      metadata: {},
    },
  });

  console.log(`Default festival created: ${festival.name} (${festival.id})`);

  // Create a default stamp campaign
  const campaign = await prisma.stampCampaign.create({
    data: {
      festivalId: festival.id,
      name: '스탬프 투어',
      description: '부스를 방문하고 스탬프를 모아보세요!',
      requiredStamps: 5,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  });

  console.log(`Default campaign created: ${campaign.name} (${campaign.id})`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
