
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  Share2
} from 'lucide-react';
import { CURRENT_TENANT } from '../constants';

const SidebarItem: React.FC<{
  to: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
}> = ({ to, icon: Icon, label, active }) => (
  <Link
    to={to}
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

  return (
    <div className="flex min-h-screen bg-white font-sans selection:bg-amber-500 selection:text-neutral-950">
      {/* Sidebar - Deep Black for Luxury feel */}
      <aside className="w-64 bg-neutral-950 flex flex-col fixed inset-y-0 z-50 border-r border-neutral-900 shadow-2xl">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-12">
            <div className="bg-amber-500 p-2.5 rounded-2xl shadow-lg shadow-amber-500/20 rotate-3">
              <Scissors className="text-neutral-950" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tighter uppercase italic">Scheduly</h1>
              <p className="text-[8px] font-black text-amber-500 uppercase tracking-[0.3em]">Premium Engine</p>
            </div>
          </div>

          <nav className="space-y-2">
            <SidebarItem 
              to="/" 
              icon={LayoutDashboard} 
              label="Dashboard" 
              active={location.pathname === '/'} 
            />
            <SidebarItem 
              to="/appointments" 
              icon={Clock} 
              label="Agenda" 
              active={location.pathname === '/appointments'} 
            />
            <SidebarItem 
              to="/professionals" 
              icon={Users} 
              label="Equipe" 
              active={location.pathname === '/professionals'} 
            />
            <SidebarItem 
              to="/services" 
              icon={Briefcase} 
              label="Serviços" 
              active={location.pathname === '/services'} 
            />
            <SidebarItem 
              to="/revenue" 
              icon={DollarSign} 
              label="Faturamento" 
              active={location.pathname === '/revenue'} 
            />
            <SidebarItem 
              to="/social" 
              icon={Share2} 
              label="Conexões" 
              active={location.pathname === '/social'} 
            />
            <SidebarItem 
              to="/settings" 
              icon={Settings} 
              label="Ajustes" 
              active={location.pathname === '/settings'} 
            />
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
              <div className="w-12 h-12 rounded-2xl border-2 border-neutral-800 overflow-hidden flex items-center justify-center bg-neutral-900 shrink-0 shadow-inner">
                {CURRENT_TENANT.logo_url ? (
                   <img src={CURRENT_TENANT.logo_url} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-black text-amber-500">JB</span>
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-black text-white truncate italic uppercase tracking-tighter">Admin Master</span>
                <span className="text-[9px] text-amber-500/60 uppercase tracking-widest font-black truncate">{CURRENT_TENANT.name}</span>
              </div>
            </div>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-neutral-500 hover:text-rose-500 hover:bg-rose-500/5 rounded-xl transition-all font-black text-[10px] uppercase tracking-[0.2em]">
              <LogOut size={16} />
              <span>Sair do Painel</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content - Maintaining White for Clarity */}
      <main className="flex-1 ml-64 p-10 bg-slate-50/50 min-h-screen">
        <header className="flex justify-between items-center mb-12">
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

        <div className="relative">
           {children}
        </div>
      </main>
    </div>
  );
};
