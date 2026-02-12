import React from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/'); // redireciona para a página pública
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <header className="border-b border-neutral-800 bg-neutral-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <span className="text-lg font-semibold tracking-tight">
            Jardel Barber
          </span>
          <div className="flex items-center gap-4">
            <span className="text-xs text-neutral-400">
              Painel do barbeiro premium
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-600 px-3 py-1 rounded text-sm hover:bg-red-700"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;
