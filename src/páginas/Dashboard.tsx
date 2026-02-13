
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
  BrainCircuit, 
  RefreshCcw,
  Zap,
  ArrowRight,
  MoreVertical,
  Clock,
  CheckCircle2,
  Scissors
} from 'lucide-react';
import { MOCK_APPOINTMENTS, SERVICES, PROFESSIONALS, CURRENT_TENANT } from '../constants';
import { getBusinessInsights } from '../services/geminiService';

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
  const [insights, setInsights] = useState<any[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const stats = useMemo(() => {
    const totalAppts = MOCK_APPOINTMENTS.length;
    const totalRevenue = MOCK_APPOINTMENTS.reduce((sum, appt) => {
      const service = SERVICES.find(s => s.id === appt.service_id);
      return sum + (service?.price || 0);
    }, 0);
    const uniqueClients = new Set(MOCK_APPOINTMENTS.map(a => a.user_name)).size;
    const maxCapacity = PROFESSIONALS.length * 10 * 7; 
    const occupancyRate = Math.min(Math.round((totalAppts / maxCapacity) * 100), 100);

    return { totalAppts, totalRevenue, uniqueClients, occupancyRate };
  }, []);

  const chartData = useMemo(() => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    const dailyData = days.map(name => ({ name, appts: 0, revenue: 0 }));
    MOCK_APPOINTMENTS.forEach(appt => {
      const date = new Date(appt.start_time);
      const dayIndex = date.getDay();
      const service = SERVICES.find(s => s.id === appt.service_id);
      dailyData[dayIndex].appts += 1;
      dailyData[dayIndex].revenue += (service?.price || 0);
    });
    return [...dailyData.slice(1), dailyData[0]];
  }, []);

  const fetchInsights = async () => {
    setLoadingInsights(true);
    try {
      const result = await getBusinessInsights(MOCK_APPOINTMENTS, SERVICES, PROFESSIONALS);
      setInsights(result.insights || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingInsights(false);
    }
  };

  useEffect(() => { fetchInsights(); }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Agendamentos" 
          value={stats.totalAppts.toString()} 
          trend="+12%" 
          icon={Calendar} 
          colorClass="bg-neutral-950 text-amber-500 shadow-lg shadow-amber-500/10" 
        />
        <StatCard 
          title="Faturamento" 
          value={`R$ ${stats.totalRevenue.toLocaleString('pt-BR')}`} 
          trend="+8%" 
          icon={DollarSign} 
          colorClass="bg-amber-500 text-neutral-950 shadow-lg shadow-amber-500/20" 
        />
        <StatCard 
          title="Novos Clientes" 
          value={stats.uniqueClients.toString()} 
          trend="+24%" 
          icon={Users} 
          colorClass="bg-neutral-900 text-amber-400 shadow-lg shadow-neutral-950/10" 
        />
        <StatCard 
          title="Ocupação" 
          value={`${stats.occupancyRate}%`} 
          trend="+5%" 
          icon={TrendingUp} 
          colorClass="bg-amber-100 text-amber-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Revenue Chart with Gold theme */}
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-xl font-black text-neutral-950 uppercase italic tracking-tighter">Fluxo de Caixa</h3>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Evolução de ganhos da {CURRENT_TENANT.name}</p>
              </div>
              <select className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all cursor-pointer">
                <option>Semana Atual</option>
                <option>Mês Atual</option>
              </select>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorGold" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    /* Removed textTransform as it is not a valid SVG text property and causes TS errors */
                    tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} 
                  />
                  <Tooltip 
                    cursor={{ stroke: '#f59e0b', strokeWidth: 2 }}
                    formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Receita']}
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(245,158,11,0.15)', padding: '16px' }}
                    labelStyle={{ fontWeight: 900, textTransform: 'uppercase', marginBottom: '8px', color: '#0a0a0a' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#f59e0b" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorGold)" 
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Appointments with Gold accents */}
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-xl font-black text-neutral-950 uppercase italic tracking-tighter">Próximos Estilos</h3>
              <button className="text-amber-600 text-[10px] font-black uppercase tracking-widest hover:underline decoration-amber-500 decoration-2 underline-offset-4">Ver Agenda Completa</button>
            </div>
            <div className="space-y-4">
              {MOCK_APPOINTMENTS.slice(0, 5).map((appt) => {
                const service = SERVICES.find(s => s.id === appt.service_id);
                return (
                  <div key={appt.id} className="flex items-center justify-between p-6 rounded-[2rem] border border-slate-50 hover:bg-slate-50/80 hover:border-amber-500/20 transition-all group cursor-default">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-neutral-950 flex items-center justify-center text-amber-500 font-black text-lg italic shadow-lg shadow-neutral-950/10 group-hover:scale-105 transition-transform">
                        {appt.user_name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-black text-neutral-950 text-base tracking-tight italic uppercase">{appt.user_name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                           <Scissors size={12} className="text-amber-500" />
                           <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{service?.name}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-10">
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-2 text-sm font-black text-neutral-950">
                          <Clock size={14} className="text-amber-500" />
                          {new Date(appt.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">
                          {new Date(appt.start_time).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          appt.status === 'confirmado' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}>
                          {appt.status}
                        </span>
                        <button className="p-2.5 text-slate-300 hover:text-neutral-950 hover:bg-white rounded-xl transition-all shadow-sm">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* AI Insights with Black and Gold premium theme */}
        <div className="bg-neutral-950 text-white p-10 rounded-[3rem] border border-neutral-900 shadow-2xl relative overflow-hidden flex flex-col h-full ring-4 ring-amber-500/5">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500 rounded-full blur-[120px] opacity-10"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-amber-600 rounded-full blur-[120px] opacity-10"></div>
          
          <div className="flex items-center justify-between mb-12 relative z-10">
            <div className="flex items-center gap-4">
              <div className="bg-amber-500/10 p-3 rounded-2xl border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                <BrainCircuit className="text-amber-500" size={28} />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight uppercase italic italic tracking-tighter text-white">Scheduly AI</h3>
                <p className="text-[9px] text-amber-500/70 font-black uppercase tracking-[0.3em] mt-0.5">Analista Virtual</p>
              </div>
            </div>
            <button 
              onClick={fetchInsights}
              disabled={loadingInsights}
              className="p-3 bg-neutral-900 rounded-2xl hover:bg-neutral-800 transition-all disabled:opacity-50 border border-neutral-800 text-amber-500 hover:text-amber-400 active:scale-90"
            >
              <RefreshCcw size={18} className={loadingInsights ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="space-y-6 relative z-10 flex-1">
            {loadingInsights ? (
              <div className="space-y-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse flex gap-5 bg-neutral-900 p-6 rounded-[2rem] border border-neutral-800">
                    <div className="w-1.5 bg-neutral-800 rounded-full h-auto"></div>
                    <div className="flex-1 space-y-4">
                      <div className="h-4 bg-neutral-800 rounded w-3/4"></div>
                      <div className="h-3 bg-neutral-800 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : insights.length > 0 ? (
              insights.map((insight, idx) => (
                <div key={idx} className="group cursor-default">
                  <div className="flex items-start gap-5 p-6 rounded-[2rem] bg-neutral-900/50 hover:bg-neutral-900 transition-all border border-neutral-800/50 hover:border-amber-500/30 group">
                    <div className="mt-1">
                      <Zap size={20} className="text-amber-500 fill-amber-500/10 group-hover:scale-125 transition-transform" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm mb-2 text-white uppercase italic tracking-wide">{insight.title}</h4>
                      <p className="text-neutral-400 text-xs leading-relaxed mb-5 font-medium">{insight.description}</p>
                      <button className="text-amber-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                        {insight.action} <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 flex flex-col items-center gap-6">
                <div className="w-20 h-20 bg-neutral-900 rounded-[2rem] flex items-center justify-center border border-neutral-800 shadow-inner">
                  <Zap className="text-neutral-700" size={40} />
                </div>
                <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest max-w-[180px] leading-relaxed">Pressione recarregar para gerar novas métricas estratégicas.</p>
              </div>
            )}
          </div>
          
          <div className="mt-12 pt-8 border-t border-neutral-900 relative z-10">
            <div className="bg-amber-500/5 p-6 rounded-[2.5rem] border border-amber-500/10 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 size={18} className="text-amber-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-300">Capacidade da Agenda</span>
              </div>
              <div className="w-full bg-neutral-900 h-3 rounded-full overflow-hidden border border-neutral-800">
                <div className="bg-amber-500 h-full rounded-full shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all duration-1000" style={{ width: `${stats.occupancyRate}%` }}></div>
              </div>
              <div className="flex justify-between mt-3 px-1">
                <span className="text-[10px] text-neutral-500 font-black uppercase">{stats.occupancyRate}% ATINGIDO</span>
                <span className="text-[10px] text-amber-500 font-black uppercase tracking-widest">Premium Load</span>
              </div>
            </div>
            <button className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black py-5 rounded-[2rem] transition-all shadow-2xl shadow-amber-500/20 flex items-center justify-center gap-3 active:scale-95 uppercase text-xs tracking-[0.2em] italic">
              <Zap size={20} className="fill-current" /> Otimizar Negócio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

