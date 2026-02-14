
import React, { useState, useEffect, useMemo } from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  Users, 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  RefreshCcw,
  Zap,
  ArrowRight,
  MoreVertical,
  Clock,
  CheckCircle2,
  Scissors,
  Lightbulb
} from 'lucide-react';
import { MOCK_APPOINTMENTS, SERVICES, PROFESSIONALS, CURRENT_TENANT } from '../constants';

const StatCard: React.FC<{
  title: string;
  value: string;
  trend: string;
  icon: React.ElementType;
  colorClass: string;
}> = ({ title, value, trend, icon: Icon, colorClass }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
    <div className="flex justify-between items-start mb-6">
      <div className={`p-4 rounded-2xl ${colorClass}`}>
        <Icon size={24} />
      </div>
      <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-lg">
        <TrendingUp size={12} /> {trend}
      </span>
    </div>
    <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1.5">{title}</h3>
    <p className="text-3xl font-black text-neutral-950 tracking-tighter italic uppercase">{value}</p>
  </div>
);

export const Dashboard: React.FC = () => {
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [chartReady, setChartReady] = useState(false);

  // Delay para garantir que o container do gráfico tenha largura antes de renderizar (evita tela preta/erro de SVG)
  useEffect(() => {
    const timer = setTimeout(() => setChartReady(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const stats = useMemo(() => {
    try {
      const totalAppts = MOCK_APPOINTMENTS?.length || 0;
      const totalRevenue = (MOCK_APPOINTMENTS || []).reduce((sum, appt) => {
        const service = SERVICES.find(s => s.id === appt.service_id);
        return sum + (service?.price || 0);
      }, 0);
      const uniqueClients = new Set((MOCK_APPOINTMENTS || []).map(a => a.user_name)).size;
      const maxCapacity = (PROFESSIONALS?.length || 1) * 10 * 7; 
      const occupancyRate = Math.min(Math.round((totalAppts / (maxCapacity || 1)) * 100), 100);

      return { totalAppts, totalRevenue, uniqueClients, occupancyRate };
    } catch (e) {
      return { totalAppts: 0, totalRevenue: 0, uniqueClients: 0, occupancyRate: 0 };
    }
  }, []);

  const localInsights = useMemo(() => ([
    {
      title: "Ticket Médio",
      description: `Com ${stats.totalAppts} agendamentos, o combo 'Corte + Barba' é sua maior chance de lucro hoje.`,
      action: "Ver Combos"
    },
    {
      title: "Retenção",
      description: "Clientes frequentes voltam a cada 15 dias. Ative lembretes automáticos para garantir a volta.",
      action: "Configurar"
    },
    {
      title: "Upsell",
      description: "Oferecer pomadas modeladoras no checkout pode aumentar seu lucro líquido em 15%.",
      action: "Estoque"
    }
  ]), [stats]);

  const chartData = useMemo(() => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    const dailyData = days.map(name => ({ name, appts: 0, revenue: 0 }));
    
    (MOCK_APPOINTMENTS || []).forEach(appt => {
      try {
        const date = new Date(appt.start_time);
        const dayIndex = date.getDay();
        const service = SERVICES.find(s => s.id === appt.service_id);
        if (dailyData[dayIndex]) {
          dailyData[dayIndex].appts += 1;
          dailyData[dayIndex].revenue += (service?.price || 0);
        }
      } catch (e) {}
    });
    
    return [...dailyData.slice(1), dailyData[0]];
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Agenda" value={stats.totalAppts.toString()} trend="+12%" icon={Calendar} colorClass="bg-neutral-950 text-amber-500 shadow-lg shadow-amber-500/10" />
        <StatCard title="Faturamento" value={`R$ ${stats.totalRevenue.toLocaleString('pt-BR')}`} trend="+8%" icon={DollarSign} colorClass="bg-amber-500 text-neutral-950 shadow-lg shadow-amber-500/20" />
        <StatCard title="Clientes" value={stats.uniqueClients.toString()} trend="+24%" icon={Users} colorClass="bg-neutral-900 text-amber-400 shadow-lg shadow-neutral-950/10" />
        <StatCard title="Ocupação" value={`${stats.occupancyRate}%`} trend="+5%" icon={TrendingUp} colorClass="bg-amber-100 text-amber-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm min-h-[450px]">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-xl font-black text-neutral-950 uppercase italic tracking-tighter">Fluxo Financeiro</h3>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Ganhos da {CURRENT_TENANT?.name}</p>
              </div>
            </div>
            <div className="h-[350px] w-full">
              {chartReady && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorGold" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', padding: '16px' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={4} fillOpacity={1} fill="url(#colorGold)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-black text-neutral-950 uppercase italic tracking-tighter mb-10">Próximos Clientes</h3>
            <div className="space-y-4">
              {(MOCK_APPOINTMENTS || []).slice(0, 5).map((appt) => (
                <div key={appt.id} className="flex items-center justify-between p-6 rounded-[2rem] border border-slate-50 hover:bg-slate-50 transition-all group">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-neutral-950 flex items-center justify-center text-amber-500 font-black text-lg italic shadow-lg shadow-neutral-950/10">
                      {appt.user_name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-black text-neutral-950 text-base tracking-tight italic uppercase">{appt.user_name}</h4>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                        {SERVICES.find(s => s.id === appt.service_id)?.name || 'Serviço'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-2 text-sm font-black text-neutral-950">
                      <Clock size={14} className="text-amber-500" />
                      {new Date(appt.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-neutral-950 text-white p-10 rounded-[3rem] border border-neutral-900 shadow-2xl flex flex-col h-full ring-4 ring-amber-500/5">
          <div className="flex items-center gap-4 mb-12">
            <div className="bg-amber-500/10 p-3 rounded-2xl border border-amber-500/30">
              <Lightbulb className="text-amber-500" size={28} />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">Estratégia</h3>
              <p className="text-[9px] text-amber-500/70 font-black uppercase tracking-[0.3em]">Gestão de Negócio</p>
            </div>
          </div>

          <div className="space-y-6 flex-1">
            {localInsights.map((insight, idx) => (
              <div key={idx} className="p-6 rounded-[2rem] bg-neutral-900/50 border border-neutral-800/50 hover:border-amber-500/30 transition-all">
                <Zap size={20} className="text-amber-500 mb-4" />
                <h4 className="font-black text-sm mb-2 text-white uppercase italic tracking-wide">{insight.title}</h4>
                <p className="text-neutral-400 text-xs leading-relaxed mb-5">{insight.description}</p>
                <button className="text-amber-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:translate-x-2 transition-transform">
                  {insight.action} <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
          
          <div className="mt-12 pt-8 border-t border-neutral-900">
            <div className="bg-amber-500/5 p-6 rounded-[2.5rem] border border-amber-500/10 mb-8">
              <div className="flex justify-between mb-2">
                <span className="text-[10px] text-neutral-500 font-black uppercase">Ocupação Agenda</span>
                <span className="text-[10px] text-amber-500 font-black uppercase">{stats.occupancyRate}%</span>
              </div>
              <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${stats.occupancyRate}%` }}></div>
              </div>
            </div>
            <button onClick={() => window.location.reload()} className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black py-5 rounded-[2rem] transition-all shadow-2xl shadow-amber-500/20 flex items-center justify-center gap-3 uppercase text-xs italic">
              <RefreshCcw size={18} /> Atualizar Painel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
