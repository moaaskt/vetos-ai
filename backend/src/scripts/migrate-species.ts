import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  console.log('Iniciando migração de espécies de pets...');
  const pets = await prisma.pet.findMany();
  let updatedCount = 0;

  for (const pet of pets) {
    const original = pet.species?.toLowerCase() || '';
    let target = 'OTHER';

    if (
      ['cão', 'cao', 'canina', 'canino', 'dog', 'cachorro', 'cadela', 'cadelas', 'cachorros'].some(
        (term) => original.includes(term),
      )
    ) {
      target = 'DOG';
    } else if (
      ['gato', 'gata', 'felino', 'felina', 'cat', 'gatos', 'gatas'].some((term) =>
        original.includes(term),
      )
    ) {
      target = 'CAT';
    }

    if (target !== pet.species) {
      await prisma.pet.update({
        where: { id: pet.id },
        data: { species: target },
      });
      console.log(`Pet ${pet.name}: "${pet.species}" -> "${target}"`);
      updatedCount++;
    }
  }

  console.log(`Migração concluída! ${updatedCount} pets atualizados.`);
}

run()
  .catch((e) => {
    console.error('Erro durante a migração:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
