import type { TutorPet } from '../../services/api/tutor';

interface PetHeroCardProps {
  pet: TutorPet & {
    sex?: string;
    client?: {
      name: string;
    };
  };
}

// ─── Immutable constant — outside component to avoid re-creation ─────────────
const speciesEmoji: Record<string, string> = {
  Cão: '🐕',
  Gato: '🐈',
  Cachorro: '🐕',
  Dog: '🐕',
  Cat: '🐈',
};

export function PetHeroCard({ pet }: PetHeroCardProps) {
  const avatar = speciesEmoji[pet.species] ?? '🐾';

  return (
    <div className="bg-white rounded-2xl border border-border p-6 flex flex-col items-center text-center transition-all duration-300 relative overflow-hidden group hover:shadow-[0_4px_20px_-6px_rgba(0,0,0,0.06)]">
      {/* Soft sanctuary gradient accent strip */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />

      {/* Avatar Container with future image upload capability */}
      <div className="relative mt-3">
        <div
          className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/8 text-5xl flex-shrink-0 transition-transform duration-500 ease-out group-hover:scale-105 ring-4 ring-primary/5"
          aria-hidden="true"
        >
          {avatar}
        </div>
        <div
          className="absolute -bottom-0.5 -right-0.5 h-7 w-7 rounded-full bg-white border-2 border-border shadow-sm flex items-center justify-center text-xs font-bold"
          aria-label={pet.sex === 'Fêmea' ? 'Sexo: Fêmea' : pet.sex === 'Macho' ? 'Sexo: Macho' : 'Sexo não informado'}
        >
          {pet.sex === 'Fêmea' ? '♀' : pet.sex === 'Macho' ? '♂' : '🐾'}
        </div>
      </div>

      {/* Pet Identity */}
      <h1 className="text-2xl font-extrabold text-foreground leading-tight mt-4">
        {pet.name}
      </h1>
      <p className="text-sm font-medium text-muted-foreground mt-1">
        {pet.species}{pet.breed ? ` · ${pet.breed}` : ''}
      </p>

      <div className="w-full border-t border-border/60 my-4" />

      {/* Pet metadata rows */}
      <dl className="w-full text-left space-y-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Idade</dt>
          <dd className="font-semibold text-foreground">
            {pet.age ? `${pet.age} ano${pet.age !== 1 ? 's' : ''}` : 'Não informada'}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Tutor</dt>
          <dd className="font-semibold text-foreground">
            {pet.client?.name || 'Carregando...'}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Clínica</dt>
          <dd className="font-semibold text-foreground text-right max-w-[180px] truncate">
            {pet.clinic?.name || 'Não cadastrada'}
          </dd>
        </div>
      </dl>
    </div>
  );
}
