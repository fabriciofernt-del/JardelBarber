
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2,
  Phone,
  MapPin,
  Scissors,
  Instagram,
  Smartphone,
  AlertCircle,
  Lock,
  LayoutDashboard,
  Copy,
  QrCode,
  CalendarDays
} from 'lucide-react';
import { CURRENT_TENANT, SETTINGS, SERVICES, PROFESSIONALS } from '../constants';
import { useNavigate, useParams } from 'react-router-dom';
import { Tenant, TenantSettings, Service, Professional } from '../types';
import { supabase } from '../supabaseClient';

type BookingStep = 'service' | 'professional' | 'date' | 'details' | 'payment' | 'success';

export const PublicBooking: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  
  const [tenant] = useState<Tenant>(CURRENT_TENANT);
  const [tenantSettings] = useState<TenantSettings>(SETTINGS);
  
  const [availableServices, setAvailableServices] = useState<Service[]>(SERVICES);
  const [availableProfessionals, setAvailableProfessionals] = useState<Professional[]>(PROFESSIONALS);

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
        const servicesPromise = supabase.from('services').select('*').eq('active', true);
        const professionalsPromise = supabase.from('professionals').select('*').eq('active', true);
        const [sRes, pRes] = await Promise.all([servicesPromise, professionalsPromise]);
        
        if (sRes.data && sRes.data.length > 0) setAvailableServices(sRes.data);
        if (pRes.data && pRes.data.length > 0) setAvailableProfessionals(pRes.data);

        const { data: { session } } = await (supabase.auth as any).getSession();
        setIsAdmin(!!session || !!localStorage.getItem('jb_admin_session'));
      } catch (err) {
        setIsAdmin(!!localStorage.getItem('jb_admin_session'));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const availableSlots = useMemo(() => {
    const slots: string[] = [];
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
      if (!isToday || current > now) slots.push(timeString);
      current.setMinutes(current.getMinutes() + stepMin);
    }
    return slots;
  }, [selectedDate, tenantSettings]);

  const handleCreateAppointment = async () => {
    setSubmitting(true);
    const appointmentData = {
      tenant_id: 1,
      user_name: clientName,
      user_phone: clientPhone,
      service_id: selectedServiceId,
      professional_id: selectedProfessionalId,
      start_time: `${selectedDate}T${selectedTime}:00Z`,
      status: 'pendente' as const,
      created_at: new Date().toISOString()
    };

    try {
      await supabase.from('appointments').insert([appointmentData]);
      const saved = localStorage.getItem('jb_appointments_data');
      const appointments = saved ? JSON.parse(saved) : [];
      localStorage.setItem('jb_appointments_data', JSON.stringify([{ ...appointmentData, id: Date.now() }, ...appointments]));
      setStep('success');
    } catch (error) {
      const saved = localStorage.getItem('jb_appointments_data');
      const appointments = saved ? JSON.parse(saved) : [];
      localStorage.setItem('jb_appointments_data', JSON.stringify([{ ...appointmentData, id: Date.now() }, ...appointments]));
      setStep('success');
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
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center pb-20">
      <div className="w-full h-56 relative overflow-hidden flex items-center justify-center">
         <img src={tenant.header_bg_url} className="w-full h-full object-cover opacity-40" alt="Banner" />
         <div className="absolute inset-0 bg-gradient-to-b from-transparent to-neutral-950"></div>
         <div className="absolute z-10 flex flex-col items-center gap-4">
           <div className="w-24 h-24 bg-neutral-950 rounded-[2rem] p-2 border border-neutral-800 flex items-center justify-center overflow-hidden shadow-2xl">
             <img src={tenant.logo_url} alt={tenant.name} className="w-full h-full object-contain" />
           </div>
           <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">{tenant.name}</h1>
         </div>
      </div>

      <div className="w-full max-w-lg px-4 -mt-6 relative z-20">
        <div className="bg-neutral-900/90 backdrop-blur-3xl rounded-[3rem] border border-neutral-800/50 shadow-[0_0_50px_-20px_rgba(0,0,0,1)] overflow-hidden">
          {step !== 'success' && (
            <div className="p-8 pb-0">
               <div className="flex items-center gap-4 mb-2">
                  {step !== 'service' && (
                    <button onClick={() => setStep(step === 'professional' ? 'service' : step === 'date' ? 'professional' : step === 'details' ? 'date' : 'details')} className="p-2.5 bg-neutral-800 rounded-xl hover:bg-neutral-700 transition-colors border border-neutral-700 active:scale-95">
                      <ChevronLeft size={20} className="text-amber-500" />
                    </button>
                  )}
                  <h2 className="text-xl font-black uppercase italic text-amber-500 tracking-tighter">{step}</h2>
               </div>
            </div>
          )}

          <div className="p-8 pt-6">
            {step === 'service' && (
              <div className="space-y-3">
                {availableServices.map(s => (
                  <button key={s.id} onClick={() => { setSelectedServiceId(s.id); setStep('professional'); }} className="w-full flex items-center gap-4 p-4 bg-neutral-800/40 rounded-2xl border border-neutral-800 hover:border-amber-500 transition-all group">
                    <div className="w-16 h-16 bg-neutral-800 rounded-xl overflow-hidden shadow-lg group-hover:scale-105 transition-transform border border-neutral-700">
                       {s.image_url && <img src={s.image_url} className="w-full h-full object-cover" />}
                    </div>
                    <div className="text-left">
                      <p className="font-black uppercase italic text-sm group-hover:text-amber-500 transition-colors">{s.name}</p>
                      <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-1">R$ {s.price.toFixed(2)} • {s.duration_min} min</p>
                    </div>
                    <ChevronRight className="ml-auto text-neutral-600 group-hover:text-amber-500 transition-colors" size={18} />
                  </button>
                ))}
              </div>
            )}

            {step === 'professional' && (
               <div className="grid grid-cols-2 gap-4">
                  {availableProfessionals.map(p => (
                    <button key={p.id} onClick={() => { setSelectedProfessionalId(p.id); setStep('date'); }} className="p-6 bg-neutral-800/40 rounded-3xl border border-neutral-800 hover:border-amber-500 transition-all text-center group active:scale-95">
                       <div className="w-14 h-14 bg-neutral-950 border-2 border-neutral-800 text-amber-500 rounded-2xl mx-auto mb-4 flex items-center justify-center font-black group-hover:border-amber-500 transition-all shadow-xl text-xl italic">{p.name[0]}</div>
                       <p className="font-black uppercase text-xs tracking-tight group-hover:text-amber-500 transition-colors italic">{p.name}</p>
                       <p className="text-[8px] text-neutral-500 font-bold uppercase mt-1 tracking-widest">{p.specialty}</p>
                    </button>
                  ))}
               </div>
            )}

            {step === 'date' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-neutral-950 border border-amber-500/30 rounded-full z-10 shadow-xl">
                    <span className="text-[9px] font-black text-amber-500 uppercase tracking-[0.2em] whitespace-nowrap italic">Selecione o Dia</span>
                  </div>
                  
                  <div className="relative overflow-hidden rounded-[2rem] group">
                    <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none">
                      <CalendarDays className="text-amber-500/40 group-hover:text-amber-500 transition-colors" size={24} />
                    </div>
                    <input 
                      type="date" 
                      className="w-full bg-neutral-950 border-2 border-amber-500/60 p-6 pl-16 rounded-[2rem] text-amber-500 font-black text-center text-lg outline-none ring-4 ring-amber-500/5 shadow-[0_0_40px_-15px_rgba(245,158,11,0.4)] transition-all hover:border-amber-500 cursor-pointer italic" 
                      value={selectedDate} 
                      onChange={e => setSelectedDate(e.target.value)} 
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 px-2">
                    <div className="h-px flex-1 bg-neutral-800"></div>
                    <span className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.3em] italic">Horários Disponíveis</span>
                    <div className="h-px flex-1 bg-neutral-800"></div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                     {availableSlots.length > 0 ? (
                       availableSlots.map(t => (
                         <button 
                           key={t} 
                           onClick={() => { setSelectedTime(t); setStep('details'); }} 
                           className="p-5 bg-neutral-800/40 border border-neutral-800 rounded-2xl text-xs font-black text-neutral-400 hover:bg-amber-500 hover:text-neutral-950 hover:border-amber-500 transition-all shadow-lg active:scale-95 group relative overflow-hidden"
                         >
                           <span className="relative z-10 italic">{t}</span>
                           <div className="absolute inset-0 bg-gradient-to-tr from-amber-400 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                         </button>
                       ))
                     ) : (
                       <div className="col-span-3 py-10 text-center">
                         <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest italic">Nenhum horário livre para este dia</p>
                       </div>
                     )}
                  </div>
                </div>
              </div>
            )}

            {step === 'details' && (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-neutral-800/30 p-4 rounded-2xl border border-neutral-800 flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                    <Scissors size={20} className="text-amber-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest italic">Resumo do Corte</p>
                    <p className="text-sm font-black text-white italic uppercase tracking-tight">
                      {selectedTime} • {new Date(selectedDate).toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'})}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-amber-500 transition-colors">
                      <Smartphone size={18} />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Seu Nome Completo" 
                      value={clientName} 
                      onChange={e => setClientName(e.target.value)} 
                      className="w-full bg-neutral-950 border border-neutral-800 p-5 pl-14 rounded-2xl text-white font-bold outline-none focus:border-amber-500 transition-all placeholder:text-neutral-700 italic" 
                    />
                  </div>

                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-amber-500 transition-colors">
                      <Phone size={18} />
                    </div>
                    <input 
                      type="tel" 
                      placeholder="WhatsApp (ex: 8599451711)" 
                      value={clientPhone} 
                      onChange={e => setClientPhone(e.target.value)} 
                      className="w-full bg-neutral-950 border border-neutral-800 p-5 pl-14 rounded-2xl text-white font-bold outline-none focus:border-amber-500 transition-all placeholder:text-neutral-700 italic" 
                    />
                  </div>
                </div>

                <button 
                  onClick={() => setStep('payment')} 
                  disabled={!clientName || !clientPhone}
                  className="w-full py-6 bg-amber-500 text-neutral-950 font-black rounded-[2rem] uppercase italic shadow-2xl shadow-amber-500/20 active:scale-95 disabled:opacity-30 disabled:grayscale transition-all mt-4 tracking-widest"
                >
                  Confirmar Dados
                </button>
              </div>
            )}

            {step === 'payment' && (
              <div className="space-y-8 text-center animate-in zoom-in-95 duration-500">
                <div className="bg-neutral-950 p-8 rounded-[3rem] border border-neutral-800 flex flex-col items-center relative shadow-2xl">
                   <div className="absolute -top-3 px-6 py-1 bg-amber-500 text-neutral-950 rounded-full">
                     <span className="text-[10px] font-black uppercase tracking-widest italic">Pagar via PIX</span>
                   </div>
                   <div className="p-4 bg-white rounded-3xl mb-6 shadow-2xl mt-4">
                     <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(tenantSettings.pix_copy_paste || '')}`} className="w-44 h-44 rounded-xl" />
                   </div>
                   <button 
                    onClick={() => { navigator.clipboard.writeText(tenantSettings.pix_copy_paste || ''); alert('PIX Copiado!'); }} 
                    className="flex items-center gap-3 text-[10px] font-black uppercase bg-neutral-900 border border-neutral-800 px-8 py-4 rounded-2xl hover:text-amber-500 transition-all shadow-lg text-neutral-400 group active:scale-95"
                   >
                     <Copy size={16} className="group-hover:scale-110 transition-transform"/> Copiar Código PIX
                   </button>
                </div>
                
                <div className="space-y-4">
                  <p className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest leading-relaxed">
                    A reserva será confirmada automaticamente após o pagamento.
                  </p>
                  <button 
                    onClick={handleCreateAppointment} 
                    disabled={submitting} 
                    className="w-full py-6 bg-amber-500 text-neutral-950 font-black rounded-[2.5rem] uppercase tracking-[0.2em] italic shadow-[0_20px_40px_-10px_rgba(245,158,11,0.3)] transition-all active:scale-95 active:shadow-none"
                  >
                    {submitting ? 'RESERVANDO...' : 'JÁ REALIZEI O PAGAMENTO'}
                  </button>
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="text-center py-12 space-y-8 animate-in zoom-in-95 duration-500">
                <div className="relative mx-auto w-24 h-24">
                  <div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full"></div>
                  <div className="relative w-24 h-24 bg-amber-500 text-neutral-950 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl rotate-6 border-4 border-neutral-900">
                    <CheckCircle2 size={48} />
                  </div>
                </div>
                <div>
                  <h3 className="text-4xl font-black uppercase italic text-white tracking-tighter leading-none">Reservado!</h3>
                  <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3">Sua cadeira está te esperando.</p>
                </div>
                <button 
                  onClick={() => window.location.reload()} 
                  className="w-full py-5 bg-neutral-800 rounded-2xl font-black uppercase italic border border-neutral-700 hover:bg-neutral-700 transition-colors tracking-widest shadow-xl"
                >
                  Novo Agendamento
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-10 text-center pb-10">
           {isAdmin ? (
             <button onClick={() => navigate('/admin')} className="text-amber-500 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-80 transition-opacity bg-amber-500/5 px-6 py-3 rounded-full border border-amber-500/10 italic"><LayoutDashboard size={14}/> Voltar ao Painel Admin</button>
           ) : (
             <button onClick={() => navigate('/login')} className="text-neutral-700 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:text-neutral-500 transition-colors italic"><Lock size={12}/> Acesso Administrativo</button>
           )}
        </div>
      </div>
    </div>
  );
};
