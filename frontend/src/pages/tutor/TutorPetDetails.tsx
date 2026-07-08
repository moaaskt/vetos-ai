import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TutorLayout } from '../../components/tutor/TutorLayout';
import { tutorApi } from '../../services/api/tutor';
import type { TimelineEvent, TutorPet } from '../../services/api/tutor';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const toneStyles = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  amber: 'bg-amber-100 text-amber-600',
  red: 'bg-red-100 text-red-600',
  purple: 'bg-purple-100 text-purple-600',
  neutral: 'bg-gray-100 text-gray-600',
};

export function TutorPetDetails() {
  const { id } = useParams<{ id: string }>();
  const [pet, setPet] = useState<TutorPet | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

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
      } catch (error) {
        console.error('Error fetching pet details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <TutorLayout>
        <div className="text-center py-12">Carregando história do pet...</div>
      </TutorLayout>
    );
  }

  if (!pet) {
    return (
      <TutorLayout>
        <div className="text-center py-12 text-red-500">Pet não encontrado.</div>
      </TutorLayout>
    );
  }

  return (
    <TutorLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pet.name}</h1>
            <p className="text-sm text-gray-500">
              {pet.species} • {pet.breed} {pet.age ? `• ${pet.age} anos` : ''}
            </p>
          </div>
          <Link to="/tutor" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            &larr; Voltar
          </Link>
        </div>

        <h2 className="text-lg font-medium text-gray-900 mb-6">Linha do Tempo</h2>

        {timeline.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white shadow rounded-lg border border-gray-200">
            Nenhum evento registrado na história do pet ainda.
          </div>
        ) : (
          <div className="flow-root">
            <ul role="list" className="-mb-8">
              {timeline.map((event, eventIdx) => (
                <li key={event.id}>
                  <div className="relative pb-8">
                    {eventIdx !== timeline.length - 1 ? (
                      <span
                        className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex items-start space-x-3">
                      <div>
                        <div
                          className={classNames(
                            event.tone ? toneStyles[event.tone] : toneStyles.neutral,
                            'flex h-10 w-10 items-center justify-center rounded-full ring-8 ring-white text-lg'
                          )}
                        >
                          {event.icon}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1 py-1.5">
                        <div className="text-sm text-gray-500">
                          <span className="font-medium text-gray-900">{event.title}</span>
                          <span className="whitespace-nowrap ml-2">
                            {new Date(event.occurredAt).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        {event.subtitle && (
                          <div className="mt-1 text-sm text-gray-700">{event.subtitle}</div>
                        )}
                        {event.description && (
                          <div className="mt-2 text-sm text-gray-500">{event.description}</div>
                        )}
                        {event.action && (
                          <div className="mt-2">
                            <a
                              href={event.action.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                            >
                              {event.action.label}
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
