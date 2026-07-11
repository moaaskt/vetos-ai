import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TutorLayout } from '../../components/tutor/TutorLayout';
import { tutorApi } from '../../services/api/tutor';
import type { TimelineEvent } from '../../services/api/tutor';
import { cn } from '../../lib/utils';
import { PetHeroCard } from '../../components/tutor/PetHeroCard';
import { HealthSummary } from '../../components/tutor/HealthSummary';
import { FilterChips, type FilterType } from '../../components/tutor/FilterChips';
import {
  TimelineBadge,
  TimelineIcon,
  TimelineGroupHeader,
  EmptyTimelineState,
} from '../../components/tutor/timeline';

// ─── Tone category labels ────────────────────────────────────────────────────
// Immutable map outside render cycle — used for accessible labels on icons.
const toneCategoryLabels: Record<string, string> = {
  blue: 'Consulta',
  green: 'Vacinação',
  amber: 'Atenção',
  red: 'Alerta',
  purple: 'Prescrição',
  neutral: 'Evento',
};

// ─── Skeletons ────────────────────────────────────────────────────────────────
function PetDetailsSkeleton() {
  return (
    <TutorLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8" aria-busy="true" aria-label="Carregando detalhes do pet">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (Hero & Resumos) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="h-72 rounded-2xl bg-white border border-border p-6 animate-pulse space-y-4">
              <div className="h-24 w-24 rounded-full bg-muted mx-auto" />
              <div className="h-6 w-32 rounded-lg bg-muted mx-auto" />
              <div className="h-4 w-48 rounded bg-muted mx-auto" />
              <div className="h-4 w-40 rounded bg-muted mx-auto" />
            </div>
            <div className="h-52 rounded-2xl bg-white border border-border p-6 animate-pulse space-y-4">
              <div className="h-5 w-36 rounded bg-muted" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-16 rounded-xl bg-muted" />
                <div className="h-16 rounded-xl bg-muted" />
                <div className="h-16 rounded-xl bg-muted" />
                <div className="h-16 rounded-xl bg-muted" />
              </div>
            </div>
          </div>
          {/* Right Column (Timeline) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="h-12 w-72 rounded-xl bg-muted animate-pulse" />
            <div className="space-y-6 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-10 w-10 rounded-full bg-muted shrink-0" />
                  <div className="flex-1 space-y-2.5">
                    <div className="h-4 w-40 rounded bg-muted" />
                    <div className="h-3 w-56 rounded bg-muted" />
                    <div className="h-3 w-32 rounded bg-muted" />
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

// ─── Error state ─────────────────────────────────────────────────────────────
function ErrorState({ message }: { message: string }) {
  return (
    <TutorLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white rounded-2xl border border-border" role="alert">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-2xl" aria-hidden="true">
            ⚠️
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1.5">{message}</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs">Verifique se você possui permissão para acessar este pet ou tente novamente.</p>
          <Link
            to="/tutor"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            ← Voltar para meus pets
          </Link>
        </div>
      </div>
    </TutorLayout>
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

  // ─── Extract Health Summary Data (No placeholder invention) ────────────────
  const healthSummaries = useMemo(() => {
    if (!pet) return null;

    const vaccinesVal = timeline.some(t => t.type === 'VACCINE')
      ? `${timeline.filter(t => t.type === 'VACCINE').length} aplicadas`
      : 'Nenhuma vacina registrada';

    const weightVal = pet.weightRecords && pet.weightRecords.length > 0
      ? `${pet.weightRecords[0].weight} kg`
      : timeline.some(t => t.type === 'WEIGHT')
      ? timeline.filter(t => t.type === 'WEIGHT')[0].subtitle || 'Registrado'
      : 'Não registrado';

    const allergiesVal = pet.allergies && pet.allergies.length > 0
      ? pet.allergies.map((a: any) => a.name).join(', ')
      : 'Nenhuma alergia relatada';

    const treatmentsVal = timeline.some(t => t.type === 'PRESCRIPTION')
      ? timeline.filter(t => t.type === 'PRESCRIPTION')[0].subtitle || 'Tratamento em curso'
      : 'Sem tratamentos ativos';

    const nextAppt = pet.appointments && pet.appointments[0];
    const nextApptVal = nextAppt
      ? `${new Date(nextAppt.date).toLocaleDateString('pt-BR')} às ${new Date(nextAppt.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - ${nextAppt.reason || 'Consulta de rotina'}`
      : 'Sem consultas agendadas';

    return {
      vaccinesSummary: vaccinesVal,
      weightSummary: weightVal,
      allergiesSummary: allergiesVal,
      treatmentsSummary: treatmentsVal,
      nextAppointmentSummary: nextApptVal,
    };
  }, [pet, timeline]);

  // ─── Filter & Group Timeline ────────────────────────────────────────────────
  const counts = useMemo<Record<FilterType, number>>(() => {
    return {
      ALL: timeline.length,
      VACCINE: timeline.filter(t => t.type === 'VACCINE').length,
      APPOINTMENT: timeline.filter(t => t.type === 'APPOINTMENT').length,
      PRESCRIPTION: timeline.filter(t => t.type === 'PRESCRIPTION').length,
      EXAM: timeline.filter(t => t.type === 'ATTACHMENT' || t.title.toLowerCase().includes('exame')).length,
    };
  }, [timeline]);

  const filteredEvents = useMemo(() => {
    return timeline.filter((event) => {
      if (activeFilter === 'ALL') return true;
      if (activeFilter === 'EXAM') {
        return event.type === 'ATTACHMENT' || event.title.toLowerCase().includes('exame');
      }
      return event.type === activeFilter;
    });
  }, [timeline, activeFilter]);

  const groupedEvents = useMemo<Record<string, TimelineEvent[]>>(() => {
    const groups: Record<string, TimelineEvent[]> = {};
    filteredEvents.forEach((event) => {
      const dateObj = new Date(event.occurredAt);
      const monthYear = dateObj.toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
      });
      const formattedGroupHeader = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
      if (!groups[formattedGroupHeader]) {
        groups[formattedGroupHeader] = [];
      }
      groups[formattedGroupHeader].push(event);
    });
    return groups;
  }, [filteredEvents]);

  // ─── Early returns (all hooks above) ───────────────────────────────────────
  if (loading) return <PetDetailsSkeleton />;
  if (error) return <ErrorState message={error} />;
  if (!pet) return <ErrorState message="Pet não encontrado." />;

  const {
    vaccinesSummary,
    weightSummary,
    allergiesSummary,
    treatmentsSummary,
    nextAppointmentSummary,
  } = healthSummaries!;

  return (
    <TutorLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation Breadcrumb */}
        <nav className="mb-6 flex justify-between items-center" aria-label="Navegação">
          <Link
            to="/tutor"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-1 -ml-1"
            aria-label="Voltar para a página inicial do tutor"
          >
            <span aria-hidden="true">←</span>
            Meus Pets
          </Link>
          <span className="text-xs text-muted-foreground hidden sm:inline">Portal do Tutor · Detalhes de Saúde</span>
        </nav>

        {/* 2-Column Responsive Layout: Hero/Resumo (Left) & Timeline (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* LEFT COLUMN: Hero + Resumo de Saúde */}
          <aside className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            <PetHeroCard pet={pet} />
            <HealthSummary
              vaccinesSummary={vaccinesSummary}
              weightSummary={weightSummary}
              allergiesSummary={allergiesSummary}
              treatmentsSummary={treatmentsSummary}
              nextAppointmentSummary={nextAppointmentSummary}
            />
          </aside>

          {/* RIGHT COLUMN: Timeline with category chips and grouped events */}
          <section className="lg:col-span-7 space-y-5 bg-white/50 rounded-2xl p-5 sm:p-6 border border-border/40" aria-label="Diário de Saúde">
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

            {/* Event list with filter transition */}
            <div
              key={activeFilter}
              className="animate-in fade-in-0 duration-300"
            >
              {filteredEvents.length === 0 ? (
                <EmptyTimelineState petName={pet.name} />
              ) : (
                <div className="space-y-8 pt-2">
                  {Object.entries(groupedEvents).map(([monthYear, events]) => (
                    <div key={monthYear} className="space-y-4">
                      {/* Month/Year centered divider */}
                      <TimelineGroupHeader label={monthYear} />

                      <ul role="list" className="space-y-5">
                        {events.map((event, idx) => (
                          <li key={event.id} className="relative group">
                            {/* Timeline vertical connector */}
                            {idx !== events.length - 1 && (
                              <span
                                className="absolute left-5 top-12 -ml-px h-[calc(100%-8px)] w-0.5 bg-gradient-to-b from-border/60 to-border/20"
                                aria-hidden="true"
                              />
                            )}

                            <div className="relative flex items-start gap-4">
                              {/* Category Icon Badge */}
                              <TimelineIcon
                                icon={event.icon}
                                tone={event.tone}
                                title={event.title}
                                categoryLabel={toneCategoryLabels[event.tone ?? 'neutral']}
                              />

                              {/* Content Card */}
                              <div className={cn(
                                'min-w-0 flex-1 rounded-xl p-4',
                                'bg-white border border-border/60',
                                'transition-all duration-300 ease-out',
                                'hover:border-primary/30 hover:shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)]',
                                'focus-within:border-primary/30 focus-within:shadow-sm',
                              )}>
                                <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-sm font-bold text-foreground truncate">
                                      {event.title}
                                    </span>
                                    {event.type === 'APPOINTMENT' && (
                                      <TimelineBadge
                                        variant={event.icon === '⏰' ? 'scheduled' : 'completed'}
                                      />
                                    )}
                                  </div>
                                  <time
                                    dateTime={event.occurredAt}
                                    className="text-xs text-muted-foreground font-medium tabular-nums"
                                  >
                                    {new Date(event.occurredAt).toLocaleDateString('pt-BR', {
                                      day: '2-digit',
                                      month: 'short',
                                    })}
                                  </time>
                                </div>

                                {event.subtitle && (
                                  <p className="mt-1 text-xs font-semibold text-primary/90">
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
                                      className={cn(
                                        'inline-flex items-center gap-1.5 rounded-lg border border-border bg-background',
                                        'px-3 py-1.5 text-sm font-semibold text-foreground',
                                        'hover:bg-accent hover:border-border/80 hover:shadow-sm',
                                        'transition-all duration-200',
                                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                                      )}
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
          </section>

        </div>
      </div>
    </TutorLayout>
  );
}
