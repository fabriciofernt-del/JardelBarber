
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  Settings, 
  Clock, 
  ChevronRight,
  LogOut,
  Sparkles,
  Briefcase,
  Scissors,
  DollarSign,
  User,
  Share2,
  Menu,
  X
} from 'lucide-react';
import { CURRENT_TENANT } from '../constants';
import { supabase } from '../supabaseClient';

const SidebarItem: React.FC<{
  to: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick?: () => void;
}> = ({ to, icon: Icon, label, active, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
      active 
        ? 'bg-amber-500 text-neutral-950 shadow-lg shadow-amber-500/20 font-bold' 
        : 'text-neutral-400 hover:text-amber-400 hover:bg-neutral-900'
    }`}
  >
    <Icon size={20} className={active ? 'text-neutral-950' : 'text-amber-500/70'} />
    <span className="text-sm uppercase tracking-widest font-black">{label}</span>
    {active && <ChevronRight size={16} className="ml-auto" />}
  </Link>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await (supabase.auth as any).signOut();
    localStorage.removeItem('jb_admin_session');
    navigate('/login');
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans selection:bg-amber-500 selection:text-neutral-950 overflow-x-hidden">
      {/* Overlay para Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-neutral-950/60 backdrop-blur-sm z-[60] lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar - Agora Responsiva */}
      <aside className={`
        fixed inset-y-0 left-0 z-[70] w-72 bg-neutral-950 flex flex-col border-r border-neutral-900 shadow-2xl transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:w-64
      `}>
        <div className="p-8">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <div className="bg-amber-500 p-2.5 rounded-2xl shadow-lg shadow-amber-500/20 rotate-3">
                <Scissors className="text-neutral-950" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-black text-white tracking-tighter uppercase italic">Scheduly</h1>
                <p className="text-[8px] font-black text-amber-500 uppercase tracking-[0.3em]">Premium Engine</p>
              </div>
            </div>
            {/* Botão de fechar apenas mobile */}
            <button onClick={closeSidebar} className="lg:hidden text-neutral-500 hover:text-white">
              <X size={24} />
            </button>
          </div>

          <nav className="space-y-2">
            <SidebarItem to="/admin" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/admin'} onClick={closeSidebar} />
            <SidebarItem to="/appointments" icon={Clock} label="Agenda" active={location.pathname === '/appointments'} onClick={closeSidebar} />
            <SidebarItem to="/professionals" icon={Users} label="Equipe" active={location.pathname === '/professionals'} onClick={closeSidebar} />
            <SidebarItem to="/services" icon={Briefcase} label="Serviços" active={location.pathname === '/services'} onClick={closeSidebar} />
            <SidebarItem to="/revenue" icon={DollarSign} label="Faturamento" active={location.pathname === '/revenue'} onClick={closeSidebar} />
            <SidebarItem to="/social" icon={Share2} label="Conexões" active={location.pathname === '/social'} onClick={closeSidebar} />
            <SidebarItem to="/settings" icon={Settings} label="Ajustes" active={location.pathname === '/settings'} onClick={closeSidebar} />
          </nav>
        </div>

        <div className="mt-auto p-6 space-y-4">
          <Link 
            to={`/booking/${CURRENT_TENANT.slug}`} 
            className="flex items-center justify-center gap-2 px-4 py-4 bg-amber-500/5 text-amber-500 rounded-2xl hover:bg-amber-500 hover:text-neutral-950 transition-all border border-amber-500/20 group shadow-lg shadow-amber-500/5"
          >
            <Sparkles size={18} className="group-hover:animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest italic">Página Pública</span>
          </Link>
          <div className="pt-6 border-t border-neutral-900">
            <div className="flex items-center gap-3 px-2 mb-6">
              <div className="w-10 h-10 rounded-xl border-2 border-neutral-800 overflow-hidden flex items-center justify-center bg-neutral-900 shrink-0 shadow-inner">
                {CURRENT_TENANT.logo_url ? (
                   <img src={CURRENT_TENANT.logo_url} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-black text-amber-500">JB</span>
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-black text-white truncate italic uppercase tracking-tighter">Admin Master</span>
                <span className="text-[8px] text-amber-500/60 uppercase tracking-widest font-black truncate">{CURRENT_TENANT.name}</span>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-neutral-500 hover:text-rose-500 hover:bg-rose-500/5 rounded-xl transition-all font-black text-[9px] uppercase tracking-[0.2em]"
            >
              <LogOut size={16} />
              <span>Sair do Painel</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Bar */}
        <header className="lg:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="bg-neutral-950 p-2 rounded-lg">
              <Scissors className="text-amber-500" size={18} />
            </div>
            <span className="font-black italic uppercase tracking-tighter text-neutral-950">Scheduly</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 bg-slate-100 text-neutral-950 rounded-lg active:scale-95 transition-all"
          >
            <Menu size={24} />
          </button>
        </header>

        <main className="flex-1 lg:ml-64 p-4 md:p-8 lg:p-10 transition-all duration-300">
          <header className="hidden lg:flex justify-between items-center mb-12">
            <div className="flex items-center gap-6">
              <Link to="/settings" className="w-20 h-20 rounded-[2rem] bg-neutral-950 p-1 shadow-2xl border-4 border-white overflow-hidden flex items-center justify-center group relative cursor-pointer">
                {CURRENT_TENANT.logo_url ? (
                  <img src={CURRENT_TENANT.logo_url} alt="Profile" className="w-full h-full object-contain" />
                ) : (
                  <User className="text-amber-500" size={32} />
                )}
                <div className="absolute inset-0 bg-neutral-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Settings size={20} className="text-white animate-spin" />
                </div>
              </Link>
              <div>
                <h2 className="text-3xl font-black text-neutral-950 tracking-tighter uppercase italic">
                  Bem-vindo, <span className="text-amber-500 underline decoration-amber-500/30 underline-offset-8">Jardel</span>!
                </h2>
                <p className="text-slate-500 text-sm font-medium mt-2">Sua barbearia está operando com <span className="text-emerald-600 font-bold">excelência hoje</span>.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="Pesquisar..." 
                  className="pl-12 pr-6 py-3.5 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all w-72 font-medium shadow-sm"
                />
                <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </header>

          {/* Versão mobile simplificada do cabeçalho de boas vindas */}
          <div className="lg:hidden mb-8 mt-2">
            <h2 className="text-2xl font-black text-neutral-950 tracking-tighter uppercase italic">
              Olá, <span className="text-amber-500">Jardel</span>!
            </h2>
          </div>

          <div className="relative">
             {children}
          </div>
        </main>
      </div>
    </div>
  );
};
