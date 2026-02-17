
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2, 
  Phone,
  Scissors,
  Smartphone,
  LayoutDashboard,
  Copy,
  CalendarDays,
  Lock
} from 'lucide-react';
import { 
  getTenant, 
  getSettings, 
  getServices, 
  getProfessionals, 
  createAppointment,
  DEFAULT_TENANT,
  DEFAULT_SETTINGS
} from '../constants';
import { useNavigate, useParams } from 'react-router-dom';
import { Tenant, TenantSettings, Service, Professional } from '../types';
import { supabase } from '../supabaseClient';
import { ImageFallback } from '../components/ImageFallback';

type BookingStep = 'service' | 'professional' | 'date' | 'details' | 'payment' | 'success';

export const PublicBooking: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  
  const [tenant, setTenant] = useState<Tenant>(DEFAULT_TENANT);
  const [tenantSettings, setTenantSettings] = useState<TenantSettings>(DEFAULT_SETTINGS);
  
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [availableProfessionals, setAvailableProfessionals] = useState<Professional[]>([]);

  const [step, setStep] = useState<BookingStep>('service');
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [t, s, servs, pros] = await Promise.all([
          getTenant(),
          getSettings(),
          getServices(),
          getProfessionals()
        ]);
        
        setTenant(t);
        setTenantSettings(s);
        setAvailableServices(servs);
        setAvailableProfessionals(pros);

        const { data: { session } } = await (supabase.auth as any).getSession();
        setIsAdmin(!!session || !!localStorage.getItem('jb_admin_session'));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const selectedService = useMemo(() => availableServices.find(s => s.id === selectedServiceId), [availableServices, selectedServiceId]);

  const availableSlots = useMemo(() => {
    const slots: string[] = [];
    if (!tenantSettings.work_start) return slots;

    const [startHour, startMin] = tenantSettings.work_start.split(':').map(Number);
    const [endHour, endMin] = tenantSettings.work_end.split(':').map(Number);
    const stepMin = tenantSettings.slot_step_min;

    const today = new Date().toISOString().split('T')[0];
    const isToday = selectedDate === today;
    const now = new Date();

    let current = new Date();
    current.setHours(startHour, startMin, 0, 0);
    const end = new Date();
    end.setHours(endHour, endMin, 0, 0);

    while (current < end) {
      const hours = current.getHours().toString().padStart(2, '0');
      const minutes = current.getMinutes().toString().padStart(2, '0');
      const timeString = `${hours}:${minutes}`;
      
      // Basic check: if today, don't show past times
      if (!isToday || current > now) {
        slots.push(timeString);
      }
      
      current.setMinutes(current.getMinutes() + stepMin);
    }
    return slots;
  }, [selectedDate, tenantSettings]);

  const handleCreateAppointment = async () => {
    if (!selectedService || !selectedTime) return;

    setSubmitting(true);
    
    // Calculate End Time
    const startDateTime = new Date(`${selectedDate}T${selectedTime}:00`);
    const endDateTime = new Date(startDateTime.getTime() + selectedService.duration_min * 60000);

    const appointmentData = {
      user_name: clientName,
      user_phone: clientPhone,
      service_id: selectedServiceId!,
      professional_id: selectedProfessionalId!,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      status: 'pendente' as const,
    };

    try {
      const { error } = await createAppointment(appointmentData);
      
      if (error) {
        alert('Erro ao agendar. Tente novamente.');
        console.error(error);
      } else {
        setStep('success');
      }
    } catch (error) {
      console.error(error);
      alert('Erro inesperado.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center pb-20 font-sans">
      
      {/* HEADER PREMIUM REFORMULADO */}
      <div className="relative w-full h-[45vh] min-h-[400px] flex flex-col items-center justify-center overflow-hidden">
         {/* Background com Overlay */}
         <div className="absolute inset-0">
           <ImageFallback src={tenant.header_bg_url || 'https://images.unsplash.com/photo-1599351431247-f10b21817021'} className="w-full h-full object-cover opacity-40 blur-sm scale-110" alt="Banner" />
           <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/30 via-neutral-950/50 to-neutral-950"></div>
         </div>
         
         {/* Conteúdo Centralizado */}
         <div className="relative z-10 flex flex-col items-center animate-in zoom-in-90 duration-1000">
           {/* Imagem de Perfil com Borda Dourada */}
           <div className="group relative">
             <div className="absolute -inset-0.5 bg-gradient-to-br from-amber-300 to-amber-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
             <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full p-1.5 bg-neutral-950">
                <ImageFallback 
                  src={tenant.logo_url || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1'} 
                  alt={tenant.name} 
                  className="w-full h-full object-cover rounded-full border-2 border-neutral-800"
                />
             </div>
           </div>

           {/* Tipografia de Impacto */}
           <div className="text-center mt-6 space-y-2">
             <h1 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter drop-shadow-2xl">
               {tenant.name}
             </h1>
             <div className="flex items-center justify-center gap-4 text-amber-500/90">
               <div className="h-px w-8 md:w-16 bg-gradient-to-r from-transparent to-amber-500"></div>
               <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.5em]">Elite Experience</span>
               <div className="h-px w-8 md:w-16 bg-gradient-to-l from-transparent to-amber-500"></div>
             </div>
           </div>
         </div>
      </div>

      {/* ÁREA DE CONTEÚDO */}
      <div className="w-full max-w-lg px-6 relative z-20 -mt-10">
        
        {step !== 'success' && (
           <div className="mb-6 flex items-center justify-between">
             {step !== 'service' && (
                <button 
                  onClick={() => setStep(step === 'professional' ? 'service' : step === 'date' ? 'professional' : step === 'details' ? 'date' : 'details')} 
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-500 hover:text-amber-400 transition-colors bg-neutral-900/50 px-4 py-2 rounded-full border border-neutral-800 backdrop-blur-md"
                >
                  <ChevronLeft size={14} /> Voltar
                </button>
             )}
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 ml-auto">
               Passo {step === 'service' ? '1' : step === 'professional' ? '2' : step === 'date' ? '3' : step === 'details' ? '4' : '5'} / 5
             </span>
           </div>
        )}

        <div className="space-y-6">
            {step === 'service' && (
              <div className="space-y-4 animate-in slide-in-from-bottom-8 duration-700">
                <div className="flex items-center gap-3 mb-4">
                   <div className="bg-amber-500 p-1.5 rounded-lg shadow-lg shadow-amber-500/20 rotate-3">
                     <Scissors size={18} className="text-neutral-950" />
                   </div>
                   <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Escolha o seu Estilo</h2>
                </div>
                
                {availableServices.length === 0 && (
                   <p className="text-neutral-500 italic">Nenhum serviço disponível no momento.</p>
                )}

                {availableServices.map(s => (
                  <button 
                    key={s.id} 
                    onClick={() => { setSelectedServiceId(s.id); setStep('professional'); }} 
                    className="w-full group relative overflow-hidden bg-neutral-900/60 backdrop-blur-xl rounded-[2rem] border border-neutral-800 hover:border-amber-500/50 transition-all duration-300 p-4 flex items-center gap-5 text-left hover:bg-neutral-800/80 active:scale-[0.98]"
                  >
                    <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-neutral-700 group-hover:border-amber-500/30 transition-colors shadow-2xl relative">
                       {s.image_url ? <ImageFallback src={s.image_url} alt={s.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /> : <div className="w-full h-full bg-neutral-800" />}
                       <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 to-transparent"></div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-black uppercase italic text-white group-hover:text-amber-500 transition-colors truncate">{s.name}</h3>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-wider border border-amber-500/20">
                          R$ {s.price.toFixed(2)}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                          <Clock size={12} /> {s.duration_min} min
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-10 h-10 rounded-full bg-neutral-950 border border-neutral-800 flex items-center justify-center text-neutral-600 group-hover:text-amber-500 group-hover:border-amber-500/30 transition-all shadow-xl">
                      <ChevronRight size={18} />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {step === 'professional' && (
               <div className="animate-in slide-in-from-right-8 duration-500">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Quem vai te atender?</h2>
                    <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest mt-2">Selecione o especialista</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {availableProfessionals.map(p => (
                      <button key={p.id} onClick={() => { setSelectedProfessionalId(p.id); setStep('date'); }} className="p-6 bg-neutral-900/60 backdrop-blur-md rounded-[2.5rem] border border-neutral-800 hover:border-amber-500 transition-all text-center group active:scale-95 hover:bg-neutral-800">
                         <div className="w-20 h-20 bg-neutral-950 border-2 border-neutral-800 text-amber-500 rounded-3xl mx-auto mb-4 flex items-center justify-center font-black group-hover:border-amber-500 transition-all shadow-2xl text-3xl italic relative overflow-hidden">
                           <span className="relative z-10">{p.name[0]}</span>
                           <div className="absolute inset-0 bg-amber-500/10 scale-0 group-hover:scale-100 transition-transform rounded-3xl"></div>
                         </div>
                         <p className="font-black uppercase text-sm tracking-tight text-white group-hover:text-amber-500 transition-colors italic">{p.name}</p>
                         <p className="text-[8px] text-neutral-500 font-black uppercase mt-2 tracking-[0.2em]">{p.specialty}</p>
                      </button>
                    ))}
                  </div>
               </div>
            )}

            {step === 'date' && (
              <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                <div className="relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-neutral-950 border border-amber-500/40 rounded-full z-10 shadow-xl">
                    <span className="text-[9px] font-black text-amber-500 uppercase tracking-[0.3em] whitespace-nowrap italic">Escolha o Dia</span>
                  </div>
                  
                  <div className="relative overflow-hidden rounded-[2.5rem] bg-neutral-900/50 border border-neutral-800 p-2">
                    <input 
                      type="date" 
                      className="w-full bg-transparent p-6 rounded-[2rem] text-white font-black text-center text-xl outline-none hover:bg-neutral-800/50 transition-all cursor-pointer italic appearance-none" 
                      value={selectedDate} 
                      onChange={e => setSelectedDate(e.target.value)} 
                    />
                  </div>
                </div>
                
                <div className="space-y-5">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] italic">Horários Disponíveis</span>
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">{availableSlots.length} Vagas</span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                     {availableSlots.length > 0 ? (
                       availableSlots.map(t => (
                         <button 
                           key={t} 
                           onClick={() => { setSelectedTime(t); setStep('details'); }} 
                           className="py-4 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-black text-neutral-300 hover:bg-amber-500 hover:text-black hover:border-amber-500 hover:scale-105 transition-all active:scale-95 shadow-lg"
                         >
                           {t}
                         </button>
                       ))
                     ) : (
                       <div className="col-span-full py-12 text-center bg-neutral-900/30 rounded-3xl border border-dashed border-neutral-800">
                         <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest italic">Agenda lotada para este dia</p>
                       </div>
                     )}
                  </div>
                </div>
              </div>
            )}

            {step === 'details' && (
              <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 p-8 rounded-[2.5rem] border border-neutral-800 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5 text-white pointer-events-none">
                     <CalendarDays size={120} />
                  </div>
                  <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20 -rotate-6">
                      <Clock size={28} className="text-black" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-amber-500/60 uppercase tracking-[0.2em] italic mb-1">Confirmando Horário</p>
                      <p className="text-2xl font-black text-white italic uppercase tracking-tighter">
                        {selectedTime}
                      </p>
                      <p className="text-xs font-bold text-neutral-400 uppercase tracking-wide mt-1">
                        {new Date(selectedDate).toLocaleDateString('pt-BR', {weekday: 'long', day: '2-digit', month: 'long'})}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-amber-500 transition-colors">
                      <Smartphone size={20} />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Seu Nome Completo" 
                      value={clientName} 
                      onChange={e => setClientName(e.target.value)} 
                      className="w-full bg-neutral-900 border border-neutral-800 p-6 pl-14 rounded-3xl text-white font-bold outline-none focus:border-amber-500 focus:bg-neutral-950 transition-all placeholder:text-neutral-700 italic" 
                    />
                  </div>

                  <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-amber-500 transition-colors">
                      <Phone size={20} />
                    </div>
                    <input 
                      type="tel" 
                      placeholder="Seu WhatsApp" 
                      value={clientPhone} 
                      onChange={e => setClientPhone(e.target.value)} 
                      className="w-full bg-neutral-900 border border-neutral-800 p-6 pl-14 rounded-3xl text-white font-bold outline-none focus:border-amber-500 focus:bg-neutral-950 transition-all placeholder:text-neutral-700 italic" 
                    />
                  </div>
                </div>

                <button 
                  onClick={() => setStep('payment')} 
                  disabled={!clientName || !clientPhone}
                  className="w-full py-6 bg-amber-500 text-black font-black rounded-[2.5rem] uppercase italic shadow-[0_20px_40px_-10px_rgba(245,158,11,0.3)] hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all mt-4 tracking-widest text-sm"
                >
                  Ir para Pagamento
                </button>
              </div>
            )}

            {step === 'payment' && (
              <div className="space-y-8 text-center animate-in zoom-in-95 duration-500">
                <div className="bg-neutral-900 p-10 rounded-[3rem] border border-neutral-800 flex flex-col items-center relative shadow-2xl">
                   <div className="absolute -top-4 px-8 py-2 bg-amber-500 text-black rounded-full shadow-lg shadow-amber-500/20">
                     <span className="text-[11px] font-black uppercase tracking-widest italic">Pagamento Instantâneo</span>
                   </div>
                   
                   <div className="bg-white p-4 rounded-3xl mb-8 mt-4 shadow-xl">
                      <ImageFallback src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(tenantSettings.pix_copy_paste || '')}`} alt="QR Code PIX" className="w-48 h-48 rounded-xl" />
                   </div>
                   
                   <button 
                    onClick={() => { navigator.clipboard.writeText(tenantSettings.pix_copy_paste || ''); alert('PIX Copiado!'); }} 
                    className="flex items-center gap-3 text-[10px] font-black uppercase bg-neutral-950 border border-neutral-800 px-8 py-4 rounded-2xl hover:text-amber-500 hover:border-amber-500/50 transition-all shadow-lg text-neutral-400 group active:scale-95 w-full justify-center"
                   >
                     <Copy size={16} className="group-hover:scale-110 transition-transform"/> Copiar Código PIX
                   </button>
                </div>
                
                <button 
                  onClick={handleCreateAppointment} 
                  disabled={submitting} 
                  className="w-full py-7 bg-amber-500 text-black font-black rounded-[3rem] uppercase tracking-[0.2em] italic shadow-[0_20px_40px_-10px_rgba(245,158,11,0.3)] hover:bg-amber-400 transition-all active:scale-95 active:shadow-none text-sm"
                >
                  {submitting ? 'PROCESSANDO...' : 'CONFIRMAR AGENDAMENTO'}
                </button>
              </div>
            )}

            {step === 'success' && (
              <div className="text-center py-12 space-y-8 animate-in zoom-in-95 duration-700">
                <div className="relative mx-auto w-32 h-32">
                  <div className="absolute inset-0 bg-emerald-500/30 blur-3xl rounded-full animate-pulse"></div>
                  <div className="relative w-32 h-32 bg-emerald-500 text-neutral-950 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl rotate-3 border-4 border-neutral-900">
                    <CheckCircle2 size={64} />
                  </div>
                </div>
                <div>
                  <h3 className="text-4xl font-black uppercase italic text-white tracking-tighter leading-none mb-4">Sucesso!</h3>
                  <p className="text-neutral-400 text-xs font-bold uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
                    Seu horário foi reservado. <br/> Te esperamos no {tenant.name}.
                  </p>
                </div>
                <button 
                  onClick={() => window.location.reload()} 
                  className="w-full py-6 bg-neutral-900 rounded-[2rem] font-black uppercase italic border border-neutral-800 hover:bg-neutral-800 transition-all tracking-widest shadow-xl text-xs text-neutral-300"
                >
                  Novo Agendamento
                </button>
              </div>
            )}
        </div>

        <div className="mt-20 text-center pb-12 border-t border-neutral-900/50 pt-10">
           {isAdmin ? (
             <button onClick={() => navigate('/admin')} className="text-amber-500 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:opacity-80 transition-opacity bg-amber-500/5 px-8 py-4 rounded-full border border-amber-500/20 italic mx-auto"><LayoutDashboard size={14}/> Voltar ao Admin</button>
           ) : (
             <button onClick={() => navigate('/login')} className="text-neutral-700 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:text-neutral-500 transition-colors italic tracking-[0.3em] mx-auto"><Lock size={12}/> Acesso Corporativo</button>
           )}
        </div>
      </div>
    </div>
  );
};
