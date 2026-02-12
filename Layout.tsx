import React from 'react';
import { supabase } from './supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

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
    <div className="min-h-screen flex bg-neutral-950 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col">
        <div className="p-4 border-b border-neutral-800">
          <h1 className="text-lg font-semibold tracking-tight">Jardel Barber</h1>
          <p className="text-xs text-neutral-400">Painel premium</p>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-2">
          <Link to="/admin" className="hover:bg-neutral-800 p-2 rounded">
            Dashboard
          </Link>
          <Link to="/appointments" className="hover:bg-neutral-800 p-2 rounded">
            Agendamentos
          </Link>
          <Link to="/services" className="hover:bg-neutral-800 p-2 rounded">
            Serviços
          </Link>
          <Link to="/professionals" className="hover:bg-neutral-800 p-2 rounded">
            Profissionais
          </Link>
          <Link to="/revenue" className="hover:bg-neutral-800 p-2 rounded">
            Receita
          </Link>
          <Link to="/settings" className="hover:bg-neutral-800 p-2 rounded">
            Configurações
          </Link>
        </nav>
        <div className="p-4 border-t border-neutral-800">
          <button
            onClick={handleLogout}
            className="bg-red-600 w-full py-2 rounded hover:bg-red-700"
          >
            Sair
          </button>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
};

export default Layout;
