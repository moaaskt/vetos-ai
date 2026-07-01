import { useEffect, useState } from 'react';
import { TutorLayout } from '../../components/tutor/TutorLayout';
import { tutorApi } from '../../services/api/tutor';
import type { TutorPet, TutorProfile } from '../../services/api/tutor';
import { Link } from 'react-router-dom';

export function TutorDashboard() {
  const [profile, setProfile] = useState<TutorProfile | null>(null);
  const [pets, setPets] = useState<TutorPet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, petsData] = await Promise.all([
          tutorApi.getProfile(),
          tutorApi.getPets(),
        ]);
        setProfile(profileData);
        setPets(petsData);
      } catch (error) {
        console.error('Error fetching tutor data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <TutorLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">Carregando...</div>
        ) : (
          <>
            <div className="bg-white shadow sm:rounded-lg overflow-hidden mb-8">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Olá, {profile?.name}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Bem-vindo ao Portal do Tutor VetOS.
                </p>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">Meus Pets</h2>
            
            {pets.length === 0 ? (
              <div className="bg-white shadow sm:rounded-lg px-4 py-5 sm:p-6 text-center text-gray-500">
                Nenhum pet encontrado.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {pets.map((pet) => (
                  <Link
                    key={pet.id}
                    to={`/tutor/pets/${pet.id}`}
                    className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-gray-400"
                  >
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-xl">
                        {pet.species === 'Canina' ? '🐶' : pet.species === 'Felina' ? '🐱' : '🐾'}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="absolute inset-0" aria-hidden="true" />
                      <p className="text-sm font-medium text-gray-900">{pet.name}</p>
                      <p className="truncate text-sm text-gray-500">
                        {pet.breed || pet.species} • {pet.clinic.name}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </TutorLayout>
  );
}
