import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Senha123!', 10);

  // 1. Garante a existência dos Planos SaaS (Starter, Professional, Enterprise)
  await prisma.plan.upsert({
    where: { name: 'Starter' },
    update: {},
    create: {
      name: 'Starter',
      maxStaffSeats: 3,
      maxNotifications: 150,
      maxStorage: 1024,
      features: JSON.stringify(['email_notifications', 'calendar']),
    },
  });

  await prisma.plan.upsert({
    where: { name: 'Professional' },
    update: {},
    create: {
      name: 'Professional',
      maxStaffSeats: 10,
      maxNotifications: 1000,
      maxStorage: 10240,
      features: JSON.stringify(['email_notifications', 'whatsapp_notifications', 'calendar', 'analytics', 'signatures']),
    },
  });

  await prisma.plan.upsert({
    where: { name: 'Enterprise' },
    update: {},
    create: {
      name: 'Enterprise',
      maxStaffSeats: 999,
      maxNotifications: 99999,
      maxStorage: 102400,
      features: JSON.stringify(['email_notifications', 'whatsapp_notifications', 'calendar', 'analytics', 'signatures', 'ai_copilot']),
    },
  });

  // 2. Garante a existência do SuperAdmin global sem apagar nada
  await prisma.user.upsert({
    where: { email: 'superadmin@vetos.ai' },
    update: {
      role: Role.SUPERADMIN,
    },
    create: {
      email: 'superadmin@vetos.ai',
      password: hashedPassword,
      role: Role.SUPERADMIN,
    },
  });

  console.log('✅ Seed de produção executado com sucesso (idempotente).');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed de produção:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
