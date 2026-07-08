import { useState } from 'react';
import { api } from '../../lib/api';

export function TutorLogin() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await api.post('/tutor/auth/request-link', { email });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ocorreu um erro ao solicitar o acesso.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="flex justify-center items-center gap-2 mb-6">
          <span className="text-3xl font-bold text-indigo-600 tracking-tight">VetOS</span>
          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full mt-1">Tutor</span>
        </div>
        
        <h2 className="mt-2 text-center text-2xl font-bold tracking-tight text-gray-900">
          Acesso dos Tutores
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Acompanhe a saúde do seu pet de forma simples.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {success ? (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Verifique seu e-mail</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>
                      Enviamos um link de acesso seguro para <strong>{email}</strong>. 
                      Clique no link para entrar na plataforma.
                    </p>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => setSuccess(false)}
                      className="text-sm font-medium text-green-800 hover:text-green-700"
                    >
                      Solicitar com outro e-mail
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Qual o seu e-mail cadastrado na clínica?
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    placeholder="voce@email.com"
                  />
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-600 font-medium">
                  {error}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-3 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {isLoading ? 'Solicitando...' : 'Receber link de acesso seguro'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
