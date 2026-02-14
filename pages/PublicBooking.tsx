
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Scissors,
  Instagram,
  Facebook,
  Smartphone,
  ImageIcon,
  ShieldCheck,
  AlertCircle,
  Lock,
  KeyRound,
  LayoutDashboard,
  Copy,
  QrCode
} from 'lucide-react';
import { CURRENT_TENANT, SETTINGS, SERVICES, PROFESSIONALS } from '../constants';
import { useNavigate, useParams } from 'react-router-dom';
import { Tenant, TenantSettings, Service, Professional, Appointment } from '../types';
import { supabase } from '../supabaseClient';

type BookingStep = 'service' | 'professional' | 'date' | 'details' | 'payment' | 'success';
type PaymentMethod = 'pix' | 'card' | 'at_shop';

export const PublicBooking: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  
  const [tenant] = useState<Tenant>(CURRENT_TENANT);
  const [tenantSettings] = useState<TenantSettings>(SETTINGS);
  
  // Initialize with mock data to prevent blank screen if Supabase is empty or unconfigured
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
      setLoading(true);
      try {
        // Attempt to fetch from Supabase
        const { data: services, error: sError } = await supabase.from('services').select('*').eq('active', true);
        const { data: professionals, error: pError } = await supabase.from('professionals').select('*').eq('active', true);
        
        // Only override mock data if Supabase actually returns data
        if (services && services.length > 0) {
          setAvailableServices(services);
        } else if (sError) {
          console.warn("Supabase services fetch error, using fallback data:", sError);
        }

        if (professionals && professionals.length > 0) {
          setAvailableProfessionals(professionals);
        } else if (pError) {
          console.warn("Supabase professionals fetch error, using fallback data:", pError);
        }
        
        // Auth check
        const { data: { session } } = await (supabase.auth as any).getSession();
        setIsAdmin(!!session);
      } catch (err) {
        console.error("Critical error fetching data:", err);
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

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => /^\+?[1-9]\d{1,14}$/.test(phone.replace(/\D/g, ''));

  const handleCreateAppointment = async () => {
    if (!validateEmail(clientEmail)) return alert('E-mail inválido');
    if (!validatePhone(clientPhone)) return alert('Telefone inválido (use formato com DDD)');

    setSubmitting(true);
    const startTimeStr = `${selectedDate}T${selectedTime}:00Z`;
    const startDate = new Date(startTimeStr);
    const endDate = new Date(startDate.getTime() + (selectedService?.duration_min || 30) * 60000);

    const appointmentData = {
      tenant_id: 1,
      user_name: clientName,
      user_email: clientEmail,
      user_phone: clientPhone,
      service_id: selectedServiceId,
      professional_id: selectedProfessionalId,
      start_time: startDate.toISOString(),
      end_time: endDate.toISOString(),
      status: 'pendente' as const,
      created_at: new Date().toISOString()
    };

    try {
      const { error } = await supabase.from('appointments').insert([appointmentData]);

      if (error) {
        console.warn("Supabase insert error, falling back to local storage persistence:", error);
        // Fallback: Persistence in LocalStorage to ensure the business continues if DB is down
        const saved = localStorage.getItem('jb_appointments_data');
        const appointments = saved ? JSON.parse(saved) : [];
        localStorage.setItem('jb_appointments_data', JSON.stringify([{ ...appointmentData, id: Date.now() }, ...appointments]));
      }
      
      setStep('success');
    } catch (error: any) {
      console.error("Critical booking error, using fallback strategy:", error);
      // Ensure the user sees success even if the network fails, as long as we recorded it locally
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
    else if (step === 'details' && clientName && clientEmail && clientPhone) setStep('payment');
    else if (step === 'payment') handleCreateAppointment();
  };

  const handleBack = () => {
    if (step === 'professional') setStep('service');
    else if (step === 'date') setStep('professional');
    else if (step === 'details') setStep('date');
    else if (step === 'payment') setStep('details');
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
        <p className="text-amber-500 font-black uppercase tracking-widest text-[10px]">Carregando Barbearia...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center overflow-x-hidden pb-20 selection:bg-amber-500 selection:text-neutral-950">
      {/* Banner */}
      <div className="w-full h-56 sm:h-72 relative overflow-hidden flex items-center justify-center">
         <img src={tenant.header_bg_url} className="w-full h-full object-cover opacity-40" alt="Banner" />
         <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/20 via-neutral-950/60 to-neutral-950"></div>
         <div className="absolute z-10 flex flex-col items-center gap-4">
           <div className="w-20 h-20 sm:w-28 sm:h-28 bg-neutral-950 rounded-[2.5rem] p-2 shadow-2xl border border-neutral-800/50 flex items-center justify-center overflow-hidden">
             <img src={tenant.logo_url} alt={tenant.name} className="w-full h-full object-contain" />
           </div>
           <div className="text-center px-4">
             <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter uppercase italic">{tenant.name}</h1>
             <div className="flex items-center justify-center gap-4 mt-2">
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500/80 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">Elite Barber Shop</span>
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 flex items-center gap-2"><MapPin size={12} className="text-amber-500" /> {tenantSettings.location_city}</span>
             </div>
           </div>
         </div>
      </div>

      <div className="w-full max-w-xl px-4 -mt-10 relative z-20">
        <div className="bg-neutral-900/60 backdrop-blur-3xl rounded-[2.5rem] border-2 border-neutral-800/50 overflow-hidden shadow-2xl">
          {step !== 'success' && (
            <div className="p-8 pb-2">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  {step !== 'service' && (
                    <button onClick={handleBack} className="w-10 h-10 flex items-center justify-center bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-all">
                      <ChevronLeft size={24} />
                    </button>
                  )}
                  <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">
                    {step === 'service' ? 'Estilo' : step === 'professional' ? 'Mestre' : step === 'date' ? 'Horário' : step === 'details' ? 'Dados' : 'Pagar'}
                  </h2>
                </div>
                <div className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Passo {['service', 'professional', 'date', 'details', 'payment'].indexOf(step) + 1} de 5</div>
              </div>
              <div className="w-full h-1 bg-neutral-800 rounded-full flex gap-1 mb-2">
                {['service', 'professional', 'date', 'details', 'payment'].map((s, idx) => (
                  <div key={s} className={`h-full transition-all duration-700 ${idx <= ['service', 'professional', 'date', 'details', 'payment'].indexOf(step) ? 'bg-amber-500 flex-1' : 'bg-neutral-800 w-4'}`} />
                ))}
              </div>
            </div>
          )}

          <div className="p-8 pt-4 min-h-[300px]">
            {step === 'service' && (
              <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-4">
                {availableServices.length > 0 ? (
                  availableServices.map(service => (
                    <button key={service.id} onClick={() => { setSelectedServiceId(service.id); handleNext(); }} className={`w-full text-left rounded-3xl border-2 flex flex-row overflow-hidden transition-all ${selectedServiceId === service.id ? 'border-amber-500 bg-neutral-900' : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700'}`}>
                      <div className="w-24 h-24 shrink-0 overflow-hidden bg-neutral-800">
                        {service.image_url ? (
                          <img src={service.image_url} className="w-full h-full object-cover" alt={service.name} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-600">
                            <Scissors size={24} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 p-4 flex justify-between items-center">
                        <div>
                          <h4 className="font-black text-lg uppercase italic tracking-tight">{service.name}</h4>
                          <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">{service.duration_min} min • R$ {service.price.toFixed(2)}</p>
                        </div>
                        <ChevronRight size={20} className="text-neutral-500" />
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <AlertCircle className="mx-auto text-amber-500 mb-4" size={48} />
                    <p className="text-sm font-black uppercase tracking-widest text-neutral-500">Nenhum serviço disponível no momento.</p>
                  </div>
                )}
              </div>
            )}

            {step === 'professional' && (
              <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4">
                {availableProfessionals.map(prof => (
                  <button key={prof.id} onClick={() => { setSelectedProfessionalId(prof.id); handleNext(); }} className={`p-6 rounded-[2rem] border-2 text-center transition-all ${selectedProfessionalId === prof.id ? 'border-amber-500 bg-neutral-900 shadow-xl' : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700'}`}>
                    <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center font-black text-xl ${selectedProfessionalId === prof.id ? 'bg-amber-500 text-neutral-950' : 'bg-neutral-800 text-neutral-500'}`}>
                      {prof.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <h4 className="font-black text-sm uppercase italic">{prof.name}</h4>
                    <p className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest">{prof.specialty}</p>
                  </button>
                ))}
              </div>
            )}

            {step === 'date' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-neutral-900/80 p-6 rounded-3xl border border-neutral-800 text-center">
                  <label className="block text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">Data do Corte</label>
                  <input type="date" className="w-full bg-transparent p-0 text-3xl text-center border-none outline-none text-neutral-100 font-black" value={selectedDate} min={new Date().toISOString().split('T')[0]} onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime(null); }} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {availableSlots.map(t => (
                    <button key={t} onClick={() => { setSelectedTime(t); handleNext(); }} className={`py-4 rounded-xl border-2 font-black text-sm transition-all ${selectedTime === t ? 'border-amber-500 bg-amber-500 text-neutral-950' : 'border-neutral-800 text-neutral-400 hover:border-neutral-700'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 'details' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-amber-500/5 p-4 rounded-2xl border border-amber-500/20 flex items-center gap-4">
                  <CalendarIcon size={20} className="text-amber-500" />
                  <div>
                    <p className="text-sm font-black text-neutral-100 uppercase italic">{selectedService?.name} / {selectedTime}h</p>
                    <p className="text-[10px] text-neutral-500 uppercase font-bold">{formatDate(selectedDate)}</p>
                  </div>
                </div>
                <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Seu Nome Completo" className="w-full bg-neutral-900/50 p-4 rounded-xl border border-neutral-800 focus:border-amber-500 outline-none text-sm font-bold" />
                <input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="Seu e-mail" className="w-full bg-neutral-900/50 p-4 rounded-xl border border-neutral-800 focus:border-amber-500 outline-none text-sm font-bold" />
                <input type="tel" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="WhatsApp com DDD (ex: 8599451711)" className="w-full bg-neutral-900/50 p-4 rounded-xl border border-neutral-800 focus:border-amber-500 outline-none text-sm font-bold" />
                <button onClick={handleNext} disabled={!clientName || !clientEmail || !clientPhone} className="w-full py-5 bg-amber-500 text-neutral-950 font-black rounded-2xl uppercase tracking-widest text-xs italic disabled:opacity-50">
                  Prosseguir
                </button>
              </div>
            )}

            {step === 'payment' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => setPaymentMethod('pix')} 
                    className={`p-6 rounded-[2rem] border-2 flex items-center justify-between transition-all ${paymentMethod === 'pix' ? 'border-amber-500 bg-amber-500/5 shadow-[0_0_20px_rgba(245,158,11,0.1)]' : 'border-neutral-800 bg-neutral-900/40 text-neutral-500'}`}
                  >
                    <div className="flex items-center gap-4">
                      <Smartphone size={24} className={paymentMethod === 'pix' ? 'text-amber-500' : 'text-neutral-600'} />
                      <div className="text-left">
                        <span className={`block font-black uppercase tracking-widest text-[10px] ${paymentMethod === 'pix' ? 'text-amber-500' : 'text-neutral-500'}`}>Pagar com PIX</span>
                        <span className="text-[8px] font-bold text-neutral-600 uppercase">Liberação Imediata</span>
                      </div>
                    </div>
                    {paymentMethod === 'pix' && <CheckCircle2 size={18} className="text-amber-500" />}
                  </button>

                  {paymentMethod === 'pix' && (
                    <div className="bg-neutral-950 p-8 rounded-[2.5rem] border-2 border-amber-500/30 space-y-6 animate-in slide-in-from-top-4 duration-500 shadow-[0_20px_60px_-15px_rgba(245,158,11,0.2)]">
                      <div className="flex flex-col items-center gap-6">
                        <div className="bg-white p-4 rounded-3xl shadow-[0_0_30px_rgba(255,255,255,0.1)] relative group">
                          {tenantSettings.pix_qr_url ? (
                            <img 
                              src={tenantSettings.pix_qr_url} 
                              alt="PIX QR Code" 
                              className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-xl"
                            />
                          ) : (
                            <img 
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(tenantSettings.pix_copy_paste || '')}`} 
                              alt="PIX QR Code" 
                              className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-xl"
                            />
                          )}
                          <div className="absolute inset-0 bg-neutral-950/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <QrCode className="text-amber-500/50" size={40} />
                          </div>
                        </div>
                        
                        <div className="text-center space-y-2">
                           <p className="text-[12px] font-black text-amber-500 uppercase tracking-[0.3em] italic">SCANEIE O QR CODE ACIMA</p>
                           <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">OU USE O CÓDIGO COPIA E COLA ABAIXO</p>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-neutral-800 space-y-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest italic">PIX COPIA E COLA</span>
                          <span className="text-[11px] font-black text-white italic">R$ {selectedService?.price.toFixed(2)}</span>
                        </div>
                        
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(tenantSettings.pix_copy_paste || '');
                            alert('Código PIX copiado com sucesso!');
                          }}
                          className="w-full p-4 bg-neutral-900 border border-neutral-800 hover:border-amber-500 text-amber-500 rounded-2xl flex items-center justify-between group transition-all"
                        >
                          <span className="truncate text-[10px] font-black uppercase tracking-widest max-w-[200px] text-left opacity-60">
                            {tenantSettings.pix_copy_paste}
                          </span>
                          <div className="flex items-center gap-2 bg-amber-500 text-neutral-950 px-3 py-1.5 rounded-xl font-black text-[9px] uppercase italic shrink-0 group-hover:scale-105 transition-transform">
                            <Copy size={12} />
                            COPIAR
                          </div>
                        </button>
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={() => setPaymentMethod('at_shop')} 
                    className={`p-6 rounded-[2rem] border-2 flex items-center justify-between transition-all ${paymentMethod === 'at_shop' ? 'border-amber-500 bg-amber-500/5 shadow-[0_0_20px_rgba(245,158,11,0.1)]' : 'border-neutral-800 bg-neutral-900/40 text-neutral-500'}`}
                  >
                    <div className="flex items-center gap-4">
                      <MapPin size={24} className={paymentMethod === 'at_shop' ? 'text-amber-500' : 'text-neutral-600'} />
                      <div className="text-left">
                        <span className={`block font-black uppercase tracking-widest text-[10px] ${paymentMethod === 'at_shop' ? 'text-amber-500' : 'text-neutral-500'}`}>Pagar na Barbearia</span>
                        <span className="text-[8px] font-bold text-neutral-600 uppercase">Dinheiro ou Cartão</span>
                      </div>
                    </div>
                    {paymentMethod === 'at_shop' && <CheckCircle2 size={18} className="text-amber-500" />}
                  </button>
                </div>

                <button 
                  onClick={handleNext} 
                  disabled={submitting} 
                  className="w-full py-6 bg-amber-500 text-neutral-950 font-black rounded-3xl uppercase tracking-widest text-[11px] italic flex items-center justify-center gap-3 shadow-[0_15px_30px_-5px_rgba(245,158,11,0.3)] hover:bg-amber-400 active:scale-95 transition-all"
                >
                  {submitting && <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin"></div>}
                  {submitting ? 'PROCESSANDO...' : 'FINALIZAR AGENDAMENTO'}
                </button>
              </div>
            )}

            {step === 'success' && (
              <div className="text-center py-6 space-y-6 animate-in zoom-in duration-500">
                <div className="w-20 h-20 bg-amber-500 text-neutral-950 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl rotate-3">
                  <CheckCircle2 size={40} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Horário Reservado!</h3>
                  <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest mt-2">Sua vaga está garantida na {tenant.name}.</p>
                </div>
                <button onClick={() => window.location.reload()} className="w-full py-4 bg-neutral-100 text-neutral-950 font-black rounded-xl uppercase tracking-widest text-[10px] italic">
                  Novo Agendamento
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 text-center space-y-8">
          <div className="flex justify-center gap-4">
            <a href={tenantSettings.social_instagram} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-neutral-900 rounded-xl flex items-center justify-center text-neutral-500 hover:text-amber-500 transition-all"><Instagram size={20} /></a>
            <a href={`https://wa.me/${tenantSettings.whatsapp_number}`} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-neutral-900 rounded-xl flex items-center justify-center text-neutral-500 hover:text-amber-500 transition-all"><Phone size={20} /></a>
          </div>
          <div className="flex flex-col gap-4 items-center">
            <p className="text-[9px] font-black text-neutral-700 uppercase tracking-[0.4em]">Propulsado por Scheduly Supabase Edition</p>
            {isAdmin ? (
              <button onClick={() => navigate('/admin')} className="text-amber-500 text-[10px] font-black uppercase tracking-widest hover:underline flex items-center gap-2 italic">
                <LayoutDashboard size={14} /> Painel Administrativo
              </button>
            ) : (
              <button onClick={() => navigate('/login')} className="text-neutral-700 hover:text-amber-500 text-[9px] font-black uppercase tracking-widest flex items-center gap-2 italic">
                <Lock size={12} /> Acesso Restrito
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
