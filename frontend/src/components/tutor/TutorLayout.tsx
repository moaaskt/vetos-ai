import type { ReactNode } from 'react';
import { useTutorAuth } from '../../context/TutorAuthContext';

interface TutorLayoutProps {
  children: ReactNode;
}

export function TutorLayout({ children }: TutorLayoutProps) {
  const { logout } = useTutorAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-indigo-600 tracking-tight">VetOS</span>
            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">Tutor</span>
          </div>
          <button 
            onClick={logout}
            className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            Sair
          </button>
        </div>
      </header>
      
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
