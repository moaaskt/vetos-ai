import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TutorLayout } from '../../components/tutor/TutorLayout';
import { tutorApi } from '../../services/api/tutor';
import type { TimelineEvent, TutorPet } from '../../services/api/tutor';
import { cn } from '../../lib/utils';

// ─── Semantic tone tokens ────────────────────────────────────────────────────
// Colors chosen to meet WCAG AA (4.5:1) on a white card background.
// Hue references are aligned with the DESIGN.md OKLCH palette.
const toneStyles: Record<string, { badge: string; label: string }> = {
  blue: {
    badge: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    label: 'Consulta',
  },
  green: {
    badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    label: 'Vacinação',
  },
  amber: {
    badge: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    label: 'Atenção',
  },
  red: {
    badge: 'bg-red-50 text-red-700 ring-1 ring-red-200',
    label: 'Alerta',
  },
  purple: {
    badge: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200',
    label: 'Prescrição',
  },
  neutral: {
    badge: 'bg-gray-100 text-gray-700 ring-1 ring-gray-200',
    label: 'Evento',
  },
};

function getToneStyle(tone?: string) {
  return toneStyles[tone ?? 'neutral'] ?? toneStyles.neutral;
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
function PetDetailsSkeleton() {
  return (
    <TutorLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8" aria-busy="true" aria-label="Carregando detalhes do pet">
        {/* Pet card skeleton */}
        <div className="mb-8 bg-white rounded-xl border border-border p-6 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-muted flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-40 rounded bg-muted" />
              <div className="h-3.5 w-56 rounded bg-muted" />
            </div>
            <div className="h-8 w-20 rounded-lg bg-muted" />
          </div>
        </div>

        {/* Timeline section heading skeleton */}
        <div className="h-5 w-28 rounded bg-muted mb-6 animate-pulse" />

        {/* Timeline items skeleton */}
        <ul className="-mb-8" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <li key={i}>
              <div className="relative pb-8 animate-pulse">
                {i < 2 && (
                  <span className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-border" />
                )}
                <div className="relative flex items-start space-x-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex-shrink-0" />
                  <div className="flex-1 pt-1.5 space-y-2">
                    <div className="h-3.5 w-48 rounded bg-muted" />
                    <div className="h-3 w-64 rounded bg-muted" />
                    <div className="h-3 w-32 rounded bg-muted" />
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </TutorLayout>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────
function EmptyTimeline({ petName }: { petName: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white rounded-xl border border-border">
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-2xl"
        aria-hidden="true"
      >
        🐾
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">
        Nenhum evento registrado ainda
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        Quando {petName} tiver consultas, vacinas ou exames registrados, eles aparecerão aqui na linha do tempo.
      </p>
    </div>
  );
}

// ─── Error state ─────────────────────────────────────────────────────────────
function ErrorState({ message }: { message: string }) {
  return (
    <TutorLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white rounded-xl border border-border" role="alert">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-2xl" aria-hidden="true">
            ⚠️
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">{message}</h3>
          <p className="text-sm text-muted-foreground mb-6">Verifique sua conexão e tente novamente.</p>
          <Link
            to="/tutor"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            ← Voltar para meus pets
          </Link>
        </div>
      </div>
    </TutorLayout>
  );
}

// ─── Pet profile card ─────────────────────────────────────────────────────────
function PetProfileCard({ pet }: { pet: TutorPet }) {
  const speciesEmoji: Record<string, string> = {
    Cão: '🐕',
    Gato: '🐈',
    Cachorro: '🐕',
    Dog: '🐕',
    Cat: '🐈',
  };
  const avatar = speciesEmoji[pet.species] ?? '🐾';

  return (
    <div className="mb-8 bg-white rounded-xl border border-border p-5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-3xl flex-shrink-0"
          aria-hidden="true"
        >
          {avatar}
        </div>

        {/* Identity */}
        <div>
          <h1 className="text-xl font-bold text-foreground leading-tight">
            {pet.name}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {pet.species}
            {pet.breed ? ` · ${pet.breed}` : ''}
            {pet.age ? ` · ${pet.age} ano${pet.age !== 1 ? 's' : ''}` : ''}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Clínica: <span className="font-medium text-foreground">{pet.clinic.name}</span>
          </p>
        </div>
      </div>

      {/* Back navigation */}
      <Link
        to="/tutor"
        className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Voltar para a lista de pets"
      >
        ← Voltar
      </Link>
    </div>
  );
}

// ─── Timeline event icon ──────────────────────────────────────────────────────
function TimelineIcon({ event }: { event: TimelineEvent }) {
  const tone = getToneStyle(event.tone);
  return (
    <div
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-full ring-4 ring-background text-lg flex-shrink-0',
        tone.badge,
      )}
      aria-label={`${tone.label}: ${event.title}`}
      role="img"
    >
      {event.icon}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function TutorPetDetails() {
  const { id } = useParams<{ id: string }>();
  const [pet, setPet] = useState<TutorPet | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const [petData, timelineData] = await Promise.all([
          tutorApi.getPetDetails(id),
          tutorApi.getPetTimeline(id),
        ]);
        setPet(petData);
        setTimeline(timelineData);
      } catch (err) {
        console.error('Error fetching pet details:', err);
        setError('Não foi possível carregar as informações do pet.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <PetDetailsSkeleton />;
  if (error) return <ErrorState message={error} />;
  if (!pet) return <ErrorState message="Pet não encontrado." />;

  return (
    <TutorLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Pet profile header card */}
        <PetProfileCard pet={pet} />

        {/* Timeline heading */}
        <h2 className="text-base font-semibold text-foreground mb-5">
          Linha do Tempo
        </h2>

        {timeline.length === 0 ? (
          <EmptyTimeline petName={pet.name} />
        ) : (
          <div className="flow-root">
            <ul role="list" className="-mb-8" aria-label={`Histórico de saúde de ${pet.name}`}>
              {timeline.map((event, eventIdx) => (
                <li key={event.id}>
                  <div className="relative pb-8">
                    {/* Connector line */}
                    {eventIdx !== timeline.length - 1 && (
                      <span
                        className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-border"
                        aria-hidden="true"
                      />
                    )}

                    <div className="relative flex items-start space-x-3">
                      {/* Icon badge */}
                      <TimelineIcon event={event} />

                      {/* Content */}
                      <div className="min-w-0 flex-1 py-1">
                        <div className="flex flex-wrap items-baseline gap-x-2">
                          <span className="text-sm font-semibold text-foreground">
                            {event.title}
                          </span>
                          <time
                            dateTime={event.occurredAt}
                            className="text-xs text-muted-foreground whitespace-nowrap"
                          >
                            {new Date(event.occurredAt).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </time>
                        </div>

                        {event.subtitle && (
                          <p className="mt-0.5 text-sm font-medium text-foreground/80">
                            {event.subtitle}
                          </p>
                        )}

                        {event.description && (
                          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                            {event.description}
                          </p>
                        )}

                        {event.action && (
                          <div className="mt-2">
                            <a
                              href={event.action.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`${event.action.label} (abre em nova aba)`}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              {event.action.label}
                              {/* External link indicator – WCAG 2.4.4 */}
                              <span className="text-muted-foreground text-xs" aria-hidden="true">↗</span>
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </TutorLayout>
  );
}
