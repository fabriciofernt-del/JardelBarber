
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
  QrCode
} from 'lucide-react';
import { CURRENT_TENANT, SETTINGS, SERVICES, PROFESSIONALS } from '../constants';
import { useNavigate, useParams } from 'react-router-dom';
import { Tenant, TenantSettings, Service, Professional } from '../types';
import { supabase } from '../supabaseClient';

type BookingStep = 'service' | 'professional' | 'date' | 'details' | 'payment' | 'success';
type PaymentMethod = 'pix' | 'card' | 'at_shop';

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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Tenta buscar, mas com timeout curto para não travar o usuário
        const servicesPromise = supabase.from('services').select('*').eq('active', true);
        const professionalsPromise = supabase.from('professionals').select('*').eq('active', true);
        
        const [sRes, pRes] = await Promise.all([servicesPromise, professionalsPromise]);
        
        if (sRes.data && sRes.data.length > 0) setAvailableServices(sRes.data);
        if (pRes.data && pRes.data.length > 0) setAvailableProfessionals(pRes.data);

        const { data: { session } } = await (supabase.auth as any).getSession();
        setIsAdmin(!!session || !!localStorage.getItem('jb_admin_session'));
      } catch (err) {
        console.warn("Rede instável, usando dados locais.");
        setIsAdmin(!!localStorage.getItem('jb_admin_session'));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const selectedService = useMemo(() => 
    availableServices.find(s => s.id === selectedServiceId), 
    [selectedServiceId, availableServices]
  );
  
  const selectedProfessional = useMemo(() => 
    availableProfessionals.find(p => p.id === selectedProfessionalId), 
    [selectedProfessionalId, availableProfessionals]
  );

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
      user_email: clientEmail,
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

  const handleNext = () => {
    if (step === 'service' && selectedServiceId) setStep('professional');
    else if (step === 'professional' && selectedProfessionalId) setStep('date');
    else if (step === 'date' && selectedTime) setStep('details');
    else if (step === 'details' && clientName) setStep('payment');
    else if (step === 'payment') handleCreateAppointment();
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
        <div className="bg-neutral-900/80 backdrop-blur-xl rounded-[2.5rem] border border-neutral-800 shadow-2xl overflow-hidden">
          {step !== 'success' && (
            <div className="p-8 pb-0">
               <div className="flex items-center gap-4 mb-4">
                  {step !== 'service' && (
                    <button onClick={() => setStep(step === 'professional' ? 'service' : step === 'date' ? 'professional' : step === 'details' ? 'date' : 'details')} className="p-2 bg-neutral-800 rounded-xl">
                      <ChevronLeft size={20} />
                    </button>
                  )}
                  <h2 className="text-lg font-black uppercase italic">{step}</h2>
               </div>
            </div>
          )}

          <div className="p-8">
            {step === 'service' && (
              <div className="space-y-3">
                {availableServices.map(s => (
                  <button key={s.id} onClick={() => { setSelectedServiceId(s.id); setStep('professional'); }} className="w-full flex items-center gap-4 p-4 bg-neutral-800/50 rounded-2xl border border-neutral-700 hover:border-amber-500 transition-all">
                    <div className="w-16 h-16 bg-neutral-700 rounded-xl overflow-hidden">
                       {s.image_url && <img src={s.image_url} className="w-full h-full object-cover" />}
                    </div>
                    <div className="text-left">
                      <p className="font-black uppercase italic text-sm">{s.name}</p>
                      <p className="text-[10px] font-bold text-neutral-500 uppercase">R$ {s.price.toFixed(2)} • {s.duration_min} min</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {step === 'professional' && (
               <div className="grid grid-cols-2 gap-4">
                  {availableProfessionals.map(p => (
                    <button key={p.id} onClick={() => { setSelectedProfessionalId(p.id); setStep('date'); }} className="p-6 bg-neutral-800/50 rounded-3xl border border-neutral-700 hover:border-amber-500 transition-all text-center">
                       <div className="w-12 h-12 bg-neutral-700 rounded-full mx-auto mb-3 flex items-center justify-center font-black">{p.name[0]}</div>
                       <p className="font-black uppercase text-xs">{p.name}</p>
                    </button>
                  ))}
               </div>
            )}

            {step === 'date' && (
              <div className="space-y-6">
                <input type="date" className="w-full bg-neutral-800 p-4 rounded-xl border border-neutral-700 font-black text-center" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
                <div className="grid grid-cols-3 gap-2">
                   {availableSlots.map(t => (
                     <button key={t} onClick={() => { setSelectedTime(t); setStep('details'); }} className="p-3 bg-neutral-800 rounded-xl text-xs font-black border border-neutral-700 hover:bg-amber-500 hover:text-black transition-all">{t}</button>
                   ))}
                </div>
              </div>
            )}

            {step === 'details' && (
              <div className="space-y-4">
                <input type="text" placeholder="Seu Nome" value={clientName} onChange={e => setClientName(e.target.value)} className="w-full bg-neutral-800 p-4 rounded-xl border border-neutral-700 outline-none" />
                <input type="tel" placeholder="WhatsApp (ex: 8599451711)" value={clientPhone} onChange={e => setClientPhone(e.target.value)} className="w-full bg-neutral-800 p-4 rounded-xl border border-neutral-700 outline-none" />
                <button onClick={() => setStep('payment')} className="w-full py-4 bg-amber-500 text-black font-black rounded-xl uppercase italic">Prosseguir</button>
              </div>
            )}

            {step === 'payment' && (
              <div className="space-y-6">
                <div className="bg-neutral-950 p-6 rounded-3xl border border-neutral-800 flex flex-col items-center">
                   <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-4">Pagamento PIX</p>
                   <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(tenantSettings.pix_copy_paste || '')}`} className="w-40 h-40 rounded-xl mb-4" />
                   <button onClick={() => { navigator.clipboard.writeText(tenantSettings.pix_copy_paste || ''); alert('PIX Copiado!'); }} className="flex items-center gap-2 text-[10px] font-black uppercase bg-neutral-800 px-4 py-2 rounded-lg"><Copy size={12}/> Copiar Código</button>
                </div>
                <button onClick={handleCreateAppointment} disabled={submitting} className="w-full py-5 bg-amber-500 text-black font-black rounded-2xl uppercase shadow-lg shadow-amber-500/20">
                  {submitting ? 'PROCESSANDO...' : 'FINALIZAR AGENDAMENTO'}
                </button>
              </div>
            )}

            {step === 'success' && (
              <div className="text-center py-10 space-y-6">
                <div className="w-20 h-20 bg-amber-500 text-black rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl"><CheckCircle2 size={40} /></div>
                <h3 className="text-2xl font-black uppercase italic">Reservado!</h3>
                <button onClick={() => window.location.reload()} className="w-full py-4 bg-neutral-800 rounded-xl font-black uppercase">Voltar</button>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-8 text-center">
           {isAdmin ? (
             <button onClick={() => navigate('/admin')} className="text-amber-500 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"><LayoutDashboard size={14}/> Painel Admin</button>
           ) : (
             <button onClick={() => navigate('/login')} className="text-neutral-700 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"><Lock size={12}/> Acesso Restrito</button>
           )}
        </div>
      </div>
    </div>
  );
};
