const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const tutorIdentities = await prisma.tutorIdentity.findMany({
    include: { clients: { include: { pets: true } } }
  });
  console.log("TUTOR IDENTITIES:", JSON.stringify(tutorIdentities, null, 2));

  const clients = await prisma.client.findMany({
    include: { pets: true }
  });
  console.log("\nALL CLIENTS:", JSON.stringify(clients, null, 2));
}

run().catch(console.error).finally(() => prisma.$disconnect());
