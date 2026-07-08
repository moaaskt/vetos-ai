import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { useTutorAuth } from '../../context/TutorAuthContext';

export function TutorVerify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useTutorAuth();
  
  const [status, setStatus] = useState<'verifying' | 'error'>('verifying');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setErrorMsg('Link inválido. Nenhum token de acesso encontrado na URL.');
        return;
      }

      try {
        const response = await api.post('/tutor/auth/verify', { token });
        const { accessToken, refreshToken, tutor } = response.data;
        
        loginWithToken(accessToken, refreshToken, tutor);
        navigate('/tutor', { replace: true });
      } catch (err: any) {
        setStatus('error');
        setErrorMsg(err.response?.data?.message || 'O link de acesso é inválido ou expirou.');
      }
    };

    verifyToken();
  }, [searchParams, navigate, loginWithToken]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          {status === 'verifying' ? (
            <div>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-medium text-gray-900">Autenticando...</h2>
              <p className="mt-2 text-sm text-gray-500">
                Verificando seu acesso seguro. Aguarde um momento.
              </p>
            </div>
          ) : (
            <div>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-medium text-gray-900">Acesso negado</h2>
              <p className="mt-2 text-sm text-gray-500 mb-6">
                {errorMsg}
              </p>
              <button
                onClick={() => navigate('/tutor/login')}
                className="w-full inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
              >
                Solicitar novo acesso
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
