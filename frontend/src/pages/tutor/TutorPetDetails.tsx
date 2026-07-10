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

// ─── Skeletons ────────────────────────────────────────────────────────────────
function PetDetailsSkeleton() {
  return (
    <TutorLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8" aria-busy="true" aria-label="Carregando detalhes do pet">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (Hero & Resumos) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="h-64 rounded-2xl bg-white border border-border p-6 animate-pulse space-y-4">
              <div className="h-20 w-20 rounded-full bg-muted mx-auto" />
              <div className="h-6 w-32 rounded bg-muted mx-auto" />
              <div className="h-4 w-48 rounded bg-muted mx-auto" />
              <div className="h-4 w-40 rounded bg-muted mx-auto" />
            </div>
            <div className="h-48 rounded-2xl bg-white border border-border p-6 animate-pulse space-y-4">
              <div className="h-5 w-36 rounded bg-muted" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-14 rounded bg-muted" />
                <div className="h-14 rounded bg-muted" />
              </div>
            </div>
          </div>
          {/* Right Column (Timeline) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="h-12 w-96 rounded bg-muted animate-pulse" />
            <div className="space-y-6 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-10 w-10 rounded-full bg-muted shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 rounded bg-muted" />
                    <div className="h-3 w-64 rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </TutorLayout>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────
function EmptyTimeline({ petName }: { petName: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white rounded-2xl border border-border transition-all duration-300">
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-2xl"
        aria-hidden="true"
      >
        🐾
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">
        Nenhum evento registrado nesta categoria
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        Não encontramos nenhum evento correspondente ao filtro selecionado para {petName}.
      </p>
    </div>
  );
}

// ─── Error state ─────────────────────────────────────────────────────────────
function ErrorState({ message }: { message: string }) {
  return (
    <TutorLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white rounded-2xl border border-border" role="alert">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-2xl" aria-hidden="true">
            ⚠️
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">{message}</h3>
          <p className="text-sm text-muted-foreground mb-6">Verifique se você possui permissão para acessar este pet ou tente novamente.</p>
          <Link
            to="/tutor"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            ← Voltar para meus pets
          </Link>
        </div>
      </div>
    </TutorLayout>
  );
}

// ─── Reusable Pet Hero Card ──────────────────────────────────────────────────
interface PetHeroCardProps {
  pet: TutorPet & {
    sex?: string;
    client?: {
      name: string;
    };
  };
}

function PetHeroCard({ pet }: PetHeroCardProps) {
  const speciesEmoji: Record<string, string> = {
    Cão: '🐕',
    Gato: '🐈',
    Cachorro: '🐕',
    Dog: '🐕',
    Cat: '🐈',
  };
  const avatar = speciesEmoji[pet.species] ?? '🐾';

  return (
    <div className="bg-white rounded-2xl border border-border p-6 flex flex-col items-center text-center transition-all duration-300 relative overflow-hidden group">
      {/* Soft sanctuary backdrop effect */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary/30 via-primary/50 to-primary/30" />

      {/* Avatar Container with future image upload capability */}
      <div className="relative mt-2">
        <div
          className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-5xl flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
          aria-hidden="true"
        >
          {avatar}
        </div>
        <div className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-white border border-border shadow-sm flex items-center justify-center text-xs">
          {pet.sex === 'Fêmea' ? '♀' : pet.sex === 'Macho' ? '♂' : '🐾'}
        </div>
      </div>

      {/* Pet Information */}
      <h1 className="text-2xl font-extrabold text-foreground leading-tight mt-4">
        {pet.name}
      </h1>
      <p className="text-sm font-medium text-muted-foreground mt-1">
        {pet.species} {pet.breed ? ` · ${pet.breed}` : ''}
      </p>

      <div className="w-full border-t border-border/80 my-4" />

      <div className="w-full text-left space-y-2.5 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Idade</span>
          <span className="font-semibold text-foreground">
            {pet.age ? `${pet.age} ano${pet.age !== 1 ? 's' : ''}` : 'Não informada'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tutor</span>
          <span className="font-semibold text-foreground">
            {pet.client?.name || 'Carregando...'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Clínica</span>
          <span className="font-semibold text-foreground text-right max-w-[180px] truncate">
            {pet.clinic?.name || 'Não cadastrada'}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Health Summary Dashboard ───────────────────────────────────────────────
interface HealthSummaryProps {
  vaccinesSummary: string;
  weightSummary: string;
  allergiesSummary: string;
  treatmentsSummary: string;
  nextAppointmentSummary: string;
}

function HealthSummary({
  vaccinesSummary,
  weightSummary,
  allergiesSummary,
  treatmentsSummary,
  nextAppointmentSummary,
}: HealthSummaryProps) {
  const items = [
    { label: 'Vacinas', val: vaccinesSummary, icon: '🛡️' },
    { label: 'Peso', val: weightSummary, icon: '⚖️' },
    { label: 'Alergias', val: allergiesSummary, icon: '⚠️' },
    { label: 'Tratamentos', val: treatmentsSummary, icon: '💊' },
    { label: 'Próxima Consulta', val: nextAppointmentSummary, icon: '📅' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
      <h2 className="text-base font-bold text-foreground flex items-center gap-2">
        <span className="text-primary">✨</span> Resumo de Saúde
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((item, idx) => (
          <div
            key={idx}
            className={cn(
              "p-3.5 rounded-xl border border-border/80 bg-background/50 flex flex-col justify-between transition-colors hover:bg-background/80",
              item.label === 'Próxima Consulta' && "sm:col-span-2"
            )}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-lg" aria-hidden="true">{item.icon}</span>
              <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                {item.label}
              </span>
            </div>
            <span className="text-sm font-bold text-foreground leading-snug">
              {item.val}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Chips for Filters ───────────────────────────────────────────────────────
type FilterType = 'ALL' | 'VACCINE' | 'APPOINTMENT' | 'PRESCRIPTION' | 'EXAM';

interface FilterChipsProps {
  activeFilter: FilterType;
  onChange: (filter: FilterType) => void;
  counts: Record<FilterType, number>;
}

function FilterChips({ activeFilter, onChange, counts }: FilterChipsProps) {
  const filters: { type: FilterType; label: string; icon: string }[] = [
    { type: 'ALL', label: 'Tudo', icon: '📋' },
    { type: 'VACCINE', label: 'Vacinas', icon: '💉' },
    { type: 'APPOINTMENT', label: 'Consultas', icon: '🩺' },
    { type: 'PRESCRIPTION', label: 'Receitas', icon: '💊' },
    { type: 'EXAM', label: 'Exames', icon: '🧪' },
  ];

  return (
    <div className="flex flex-wrap gap-2 pb-2 overflow-x-auto scrollbar-none">
      {filters.map((f) => {
        const isSelected = activeFilter === f.type;
        return (
          <button
            key={f.type}
            onClick={() => onChange(f.type)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0",
              isSelected
                ? "bg-primary text-primary-foreground shadow-sm scale-102"
                : "bg-white border border-border text-foreground hover:bg-accent"
            )}
          >
            <span>{f.icon}</span>
            <span>{f.label}</span>
            <span
              className={cn(
                "text-xs px-1.5 py-0.5 rounded-full ml-0.5",
                isSelected ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
              )}
            >
              {counts[f.type]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Timeline event icon ──────────────────────────────────────────────────────
function TimelineIcon({ event }: { event: TimelineEvent }) {
  const tone = getToneStyle(event.tone);
  return (
    <div
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-full ring-4 ring-white text-lg flex-shrink-0 transition-transform duration-300 hover:scale-110',
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
  const [pet, setPet] = useState<any>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');

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

  // ─── Extract Health Summary Data (No placeholder invention) ────────────────
  // Read real values from database fields when available
  const vaccinesSummary = timeline.some(t => t.type === 'VACCINE')
    ? `${timeline.filter(t => t.type === 'VACCINE').length} aplicadas`
    : 'Nenhuma vacina registrada';

  const weightSummary = pet.weightRecords && pet.weightRecords.length > 0
    ? `${pet.weightRecords[0].weight} kg`
    : timeline.some(t => t.type === 'WEIGHT')
    ? timeline.filter(t => t.type === 'WEIGHT')[0].subtitle || 'Registrado'
    : 'Não registrado';

  const allergiesSummary = pet.allergies && pet.allergies.length > 0
    ? pet.allergies.map((a: any) => a.name).join(', ')
    : 'Nenhuma alergia relatada';

  // Active treatments (can be derived from prescriptions)
  const treatmentsSummary = timeline.some(t => t.type === 'PRESCRIPTION')
    ? timeline.filter(t => t.type === 'PRESCRIPTION')[0].subtitle || 'Tratamento em curso'
    : 'Sem tratamentos ativos';

  // Next scheduled appointment
  const nextApptEvent = timeline.find(t => t.type === 'APPOINTMENT' && new Date(t.occurredAt) > new Date());
  const nextAppointmentSummary = nextApptEvent
    ? `${new Date(nextApptEvent.occurredAt).toLocaleDateString('pt-BR')} - ${nextApptEvent.title}`
    : 'Sem consultas agendadas';

  // ─── Filter & Group Timeline ────────────────────────────────────────────────
  const filteredEvents = timeline.filter((event) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'EXAM') {
      // Exams are typically attachments or labeled as EXAM
      return event.type === 'ATTACHMENT' || event.title.toLowerCase().includes('exame');
    }
    return event.type === activeFilter;
  });

  // Calculate counts for chips
  const counts: Record<FilterType, number> = {
    ALL: timeline.length,
    VACCINE: timeline.filter(t => t.type === 'VACCINE').length,
    APPOINTMENT: timeline.filter(t => t.type === 'APPOINTMENT').length,
    PRESCRIPTION: timeline.filter(t => t.type === 'PRESCRIPTION').length,
    EXAM: timeline.filter(t => t.type === 'ATTACHMENT' || t.title.toLowerCase().includes('exame')).length,
  };

  // Group events by Month and Year
  const groupedEvents: Record<string, TimelineEvent[]> = {};
  filteredEvents.forEach((event) => {
    const dateObj = new Date(event.occurredAt);
    const monthYear = dateObj.toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    });
    // Capitalize first letter of month
    const formattedGroupHeader = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
    if (!groupedEvents[formattedGroupHeader]) {
      groupedEvents[formattedGroupHeader] = [];
    }
    groupedEvents[formattedGroupHeader].push(event);
  });

  return (
    <TutorLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-opacity duration-300">
        
        {/* Navigation Breadcrumb with safe back link */}
        <div className="mb-6 flex justify-between items-center">
          <Link
            to="/tutor"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:opacity-80 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Voltar para a página inicial do tutor"
          >
            ← Meus Pets
          </Link>
          <span className="text-xs text-muted-foreground">Portal do Tutor · Detalhes de Saúde</span>
        </div>

        {/* 2-Column Responsive Layout: Hero/Resumo (Left) & Timeline (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Hero + Resumo de Saúde */}
          <div className="lg:col-span-5 space-y-6">
            <PetHeroCard pet={pet} />
            <HealthSummary
              vaccinesSummary={vaccinesSummary}
              weightSummary={weightSummary}
              allergiesSummary={allergiesSummary}
              treatmentsSummary={treatmentsSummary}
              nextAppointmentSummary={nextAppointmentSummary}
            />
          </div>

          {/* RIGHT COLUMN: Timeline with category chips and grouped events */}
          <div className="lg:col-span-7 space-y-6 bg-white/40 rounded-2xl p-6 border border-border/50">
            <div>
              <h2 className="text-xl font-bold text-foreground">Diário de Saúde</h2>
              <p className="text-sm text-muted-foreground mt-0.5 mb-4">Acompanhe o histórico de cuidados do seu pet.</p>
            </div>

            {/* Filter chips */}
            <FilterChips
              activeFilter={activeFilter}
              onChange={setActiveFilter}
              counts={counts}
            />

            {/* Event list */}
            {filteredEvents.length === 0 ? (
              <EmptyTimeline petName={pet.name} />
            ) : (
              <div className="space-y-8 pt-4">
                {Object.entries(groupedEvents).map(([monthYear, events]) => (
                  <div key={monthYear} className="space-y-4">
                    {/* Month/Year Divider heading */}
                    <h3 className="text-xs font-bold text-muted-foreground/80 tracking-wider uppercase border-b border-border/60 pb-1.5">
                      {monthYear}
                    </h3>

                    <ul role="list" className="space-y-6">
                      {events.map((event, idx) => (
                        <li key={event.id} className="relative group">
                          {/* Timeline connector line */}
                          {idx !== events.length - 1 && (
                            <span
                              className="absolute left-5 top-10 -ml-px h-full w-0.5 bg-border/60"
                              aria-hidden="true"
                            />
                          )}

                          <div className="relative flex items-start gap-4">
                            {/* Category Icon Badge */}
                            <TimelineIcon event={event} />

                            {/* Standardized Content Container */}
                            <div className="min-w-0 flex-1 bg-white border border-border/80 rounded-xl p-4 transition-all duration-300 hover:border-primary/40 hover:shadow-sm">
                              <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                                <span className="text-sm font-bold text-foreground">
                                  {event.title}
                                </span>
                                <time
                                  dateTime={event.occurredAt}
                                  className="text-xs text-muted-foreground font-medium"
                                >
                                  {new Date(event.occurredAt).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: 'short',
                                  })}
                                </time>
                              </div>

                              {event.subtitle && (
                                <p className="mt-0.5 text-xs font-semibold text-primary">
                                  {event.subtitle}
                                </p>
                              )}

                              {event.description && (
                                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                                  {event.description}
                                </p>
                              )}

                              {event.action && (
                                <div className="mt-3">
                                  <a
                                    href={event.action.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`${event.action.label} (abre em nova aba)`}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-semibold text-foreground hover:bg-accent transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                  >
                                    {event.action.label}
                                    <span className="text-muted-foreground text-xs" aria-hidden="true">↗</span>
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </TutorLayout>
  );
}
