import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { api } from '../lib/api';

interface Tutor {
  id: string;
  publicId: string;
}

interface TutorAuthContextType {
  tutor: Tutor | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithToken: (accessToken: string, refreshToken: string, tutorData: Tutor) => void;
  logout: () => void;
}

const TutorAuthContext = createContext<TutorAuthContextType | undefined>(undefined);

export function TutorAuthProvider({ children }: { children: ReactNode }) {
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = localStorage.getItem('tutor_access_token');
      const refreshToken = localStorage.getItem('tutor_refresh_token');
      const storedTutor = localStorage.getItem('tutor_data');

      if (accessToken && storedTutor) {
        setTutor(JSON.parse(storedTutor));
        setIsAuthenticated(true);
      } else if (refreshToken) {
        try {
          const response = await api.post('/tutor/auth/refresh', { refreshToken });
          const { accessToken: newAccess, refreshToken: newRefresh, tutor: newTutor } = response.data;
          
          localStorage.setItem('tutor_access_token', newAccess);
          localStorage.setItem('tutor_refresh_token', newRefresh);
          localStorage.setItem('tutor_data', JSON.stringify(newTutor));
          
          setTutor(newTutor);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Failed to refresh tutor token', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const loginWithToken = (accessToken: string, refreshToken: string, tutorData: Tutor) => {
    localStorage.setItem('tutor_access_token', accessToken);
    localStorage.setItem('tutor_refresh_token', refreshToken);
    localStorage.setItem('tutor_data', JSON.stringify(tutorData));
    setTutor(tutorData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('tutor_access_token');
    localStorage.removeItem('tutor_refresh_token');
    localStorage.removeItem('tutor_data');
    setTutor(null);
    setIsAuthenticated(false);
  };

  return (
    <TutorAuthContext.Provider value={{ tutor, isAuthenticated, isLoading, loginWithToken, logout }}>
      {children}
    </TutorAuthContext.Provider>
  );
}

export function useTutorAuth() {
  const context = useContext(TutorAuthContext);
  if (context === undefined) {
    throw new Error('useTutorAuth must be used within a TutorAuthProvider');
  }
  return context;
}
