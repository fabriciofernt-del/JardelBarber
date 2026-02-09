
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  User, 
  Briefcase, 
  Clock, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Star,
  Scissors,
  Instagram,
  Facebook,
  QrCode,
  CreditCard,
  Smartphone,
  Info,
  Copy,
  Image as ImageIcon,
  ShieldCheck,
  X,
  LogOut,
  LayoutDashboard,
  HelpCircle,
  Upload,
  FileText,
  AlertCircle,
  Lock,
  KeyRound
} from 'lucide-react';
import { SERVICES, PROFESSIONALS, CURRENT_TENANT, SETTINGS, MOCK_APPOINTMENTS } from '../constants';
import { useNavigate, useParams } from 'react-router-dom';
import { Tenant, TenantSettings, Service, Professional, Appointment } from '../types';

type BookingStep = 'service' | 'professional' | 'date' | 'details' | 'payment' | 'success';
type PaymentMethod = 'pix' | 'card' | 'at_shop';

export const PublicBooking: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  
  // State for dynamic tenant data
  const [tenant, setTenant] = useState<Tenant>(CURRENT_TENANT);
  const [tenantSettings, setTenantSettings] = useState<TenantSettings>(SETTINGS);
  const [availableServices, setAvailableServices] = useState<Service[]>(SERVICES);
  const [availableProfessionals, setAvailableProfessionals] = useState<Professional[]>(PROFESSIONALS);

  const [step, setStep] = useState<BookingStep>('service');
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  
  // Client Details
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  const [copied, setCopied] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginError, setLoginError] = useState('');

  // Load latest data on mount
  useEffect(() => {
    const savedTenant = localStorage.getItem('jb_tenant_data');
    const savedSettings = localStorage.getItem('jb_settings_data');
    const savedServices = localStorage.getItem('jb_services_data');
    const savedProfessionals = localStorage.getItem('jb_professionals_data');
    
    if (savedTenant) setTenant(JSON.parse(savedTenant));
    if (savedSettings) setTenantSettings(JSON.parse(savedSettings));
    if (savedServices) setAvailableServices(JSON.parse(savedServices));
    if (savedProfessionals) setAvailableProfessionals(JSON.parse(savedProfessionals));

    const adminSession = localStorage.getItem('jb_admin_session');
    if (adminSession === 'true') {
      setIsAdmin(true);
    }
  }, []);

  const pixCode = "00020101021126790014BR.GOV.BCB.PIX2557pix-qr.mercadopago.com/instore/ol/v2/8361661b-99d8-4f81-817c-659f8c1f938c";

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

      if (isToday) {
        if (current > now) {
          slots.push(timeString);
        }
      } else {
        slots.push(timeString);
      }
      
      current.setMinutes(current.getMinutes() + stepMin);
    }

    return slots;
  }, [selectedDate, tenantSettings]);

  const handleCreateAppointment = () => {
    const existingAppointments: Appointment[] = JSON.parse(localStorage.getItem('jb_appointments_data') || JSON.stringify(MOCK_APPOINTMENTS));
    
    const startTimeStr = `${selectedDate}T${selectedTime}:00`;
    const startDate = new Date(startTimeStr);
    const endDate = new Date(startDate.getTime() + (selectedService?.duration_min || 30) * 60000);

    const newAppointment: Appointment = {
      id: Date.now(),
      tenant_id: 1,
      user_name: clientName,
      user_email: clientEmail,
      user_phone: clientPhone,
      service_id: selectedServiceId!,
      professional_id: selectedProfessionalId!,
      start_time: startDate.toISOString(),
      end_time: endDate.toISOString(),
      status: 'pendente',
      created_at: new Date().toISOString()
    };

    const updatedAppointments = [newAppointment, ...existingAppointments];
    localStorage.setItem('jb_appointments_data', JSON.stringify(updatedAppointments));
    
    setStep('success');
  };

  const handleNext = () => {
    if (step === 'service') setStep('professional');
    else if (step === 'professional') setStep('date');
    else if (step === 'date') setStep('details');
    else if (step === 'details') setStep('payment');
    else if (step === 'payment') handleCreateAppointment();
  };

  const handleBack = () => {
    if (step === 'professional') setStep('service');
    else if (step === 'date') setStep('professional');
    else if (step === 'details') setStep('date');
    else if (step === 'payment') setStep('details');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    const authorizedEmails = [
      'admin@jardelbarber.com',
      'jardel@barber.com',
      'fabriciofernt@gmail.com',
      'jardeldss99@gmail.com'
    ];

    setTimeout(() => {
      const email = loginEmail.toLowerCase().trim();
      if (authorizedEmails.includes(email)) {
        localStorage.setItem('jb_admin_session', 'true');
        setIsAdmin(true);
        setShowLoginModal(false);
        navigate('/');
      } else {
        setLoginError('Acesso não autorizado para este e-mail.');
      }
      setIsLoggingIn(false);
    }, 1500);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
  };

  const renderContent = () => {
    switch (step) {
      case 'service':
        return (
          <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {availableServices.filter(s => s.active).map(service => (
              <button
                key={service.id}
                onClick={() => {
                  setSelectedServiceId(service.id);
                  handleNext();
                }}
                className={`w-full text-left rounded-3xl border-2 transition-all group relative overflow-hidden flex flex-col sm:flex-row ${
                  selectedServiceId === service.id 
                    ? 'border-amber-500 bg-neutral-900 shadow-[0_0_20px_rgba(245,158,11,0.2)]' 
                    : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 hover:bg-neutral-800'
                }`}
              >
                <div className="w-full sm:w-32 h-32 shrink-0 relative overflow-hidden">
                  {service.image_url ? (
                    <img src={service.image_url} alt={service.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-neutral-600">
                      <ImageIcon size={24} />
                    </div>
                  )}
                  {selectedServiceId === service.id && (
                    <div className="absolute inset-0 bg-amber-500/20 mix-blend-overlay"></div>
                  )}
                </div>
                
                <div className="flex-1 p-6 flex justify-between items-center relative z-10">
                  <div>
                    <h4 className={`font-black text-xl mb-1 transition-colors tracking-tight italic uppercase ${selectedServiceId === service.id ? 'text-amber-500' : 'text-neutral-100 group-hover:text-amber-400'}`}>
                      {service.name}
                    </h4>
                    <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-neutral-500">
                      <span className="flex items-center gap-1.5"><Clock size={12} className="text-amber-500" /> {service.duration_min} min</span>
                      <span className="text-neutral-300">R$ {service.price.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${selectedServiceId === service.id ? 'bg-amber-500 text-neutral-950 shadow-lg shadow-amber-500/20' : 'bg-neutral-800 text-neutral-500 group-hover:bg-neutral-700 group-hover:text-amber-500'}`}>
                    <ChevronRight size={20} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        );
      case 'professional':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {availableProfessionals.filter(p => p.active).map(prof => (
              <button
                key={prof.id}
                onClick={() => {
                  setSelectedProfessionalId(prof.id);
                  handleNext();
                }}
                className={`p-10 rounded-[2.5rem] border-2 text-center transition-all group relative ${
                  selectedProfessionalId === prof.id 
                    ? 'border-amber-500 bg-neutral-900 shadow-[0_0_30px_rgba(245,158,11,0.15)]' 
                    : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700'
                }`}
              >
                <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center text-3xl font-black transition-all ring-offset-4 ring-offset-neutral-950 ring-2 ${
                  selectedProfessionalId === prof.id ? 'bg-amber-500 text-neutral-950 ring-amber-500' : 'bg-neutral-800 text-neutral-500 ring-neutral-800 group-hover:ring-amber-500/50'
                }`}>
                  {prof.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h4 className={`font-black text-xl mb-1 uppercase italic ${selectedProfessionalId === prof.id ? 'text-amber-500' : 'text-neutral-100 group-hover:text-amber-400'}`}>
                  {prof.name}
                </h4>
                <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest">{prof.specialty}</p>
              </button>
            ))}
          </div>
        );
      case 'date':
        return (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-neutral-900/80 p-6 rounded-3xl border border-neutral-800 focus-within:border-amber-500/50 transition-colors shadow-inner text-center">
              <label className="block text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-4">Data Preferencial</label>
              <input 
                type="date" 
                className="w-full bg-transparent p-0 text-3xl text-center border-none focus:ring-0 outline-none text-neutral-100 font-black appearance-none cursor-pointer"
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedTime(null);
                }}
              />
            </div>
            <div>
              <h5 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-6 text-center">Horários Disponíveis</h5>
              {availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {availableSlots.map(t => (
                    <button
                      key={t}
                      onClick={() => {
                        setSelectedTime(t);
                        handleNext();
                      }}
                      className={`py-5 rounded-2xl border-2 font-black transition-all text-sm tracking-widest ${
                        selectedTime === t 
                          ? 'border-amber-500 bg-amber-500 text-neutral-950 shadow-[0_0_25px_rgba(245,158,11,0.3)] scale-105' 
                          : 'border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-amber-400 hover:bg-neutral-800'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-neutral-500 font-bold uppercase tracking-widest text-xs border border-dashed border-neutral-800 rounded-3xl">
                  Não há mais horários disponíveis para hoje.
                </div>
              )}
            </div>
          </div>
        );
      case 'details':
        return (
          <form className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
            <div className="bg-amber-500/5 p-6 rounded-3xl border border-amber-500/20 flex items-center gap-5 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 text-amber-500 opacity-5 pointer-events-none">
                 <Scissors size={80} />
               </div>
              <div className="bg-amber-500 text-neutral-950 p-3 rounded-2xl shadow-lg shadow-amber-900/20">
                <CalendarIcon size={24} />
              </div>
              <div className="relative z-10">
                <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-1">Seu Atendimento</p>
                <p className="text-lg font-black text-neutral-100 tracking-tight leading-tight">
                  {selectedService?.name} <span className="text-neutral-500 mx-1">/</span> {selectedTime}h
                </p>
                <p className="text-sm text-neutral-400 font-bold uppercase tracking-wide">
                  {formatDate(selectedDate)}
                </p>
              </div>
            </div>
            
            <div className="space-y-5">
              <div className="group">
                <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2 ml-1 transition-colors group-focus-within:text-amber-500">Nome Completo</label>
                <input 
                  type="text" 
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-neutral-900/50 p-5 rounded-2xl border-2 border-neutral-800 focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/5 outline-none transition-all text-neutral-100 font-bold placeholder:text-neutral-700" 
                  placeholder="Digite seu nome" required 
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="group">
                  <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2 ml-1 transition-colors group-focus-within:text-amber-500">E-mail</label>
                  <input 
                    type="email" 
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full bg-neutral-900/50 p-5 rounded-2xl border-2 border-neutral-800 focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/5 outline-none transition-all text-neutral-100 font-bold placeholder:text-neutral-700" 
                    placeholder="seu@email.com" required 
                  />
                </div>
                <div className="group">
                  <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2 ml-1 transition-colors group-focus-within:text-amber-500">WhatsApp</label>
                  <input 
                    type="tel" 
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full bg-neutral-900/50 p-5 rounded-2xl border-2 border-neutral-800 focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/5 outline-none transition-all text-neutral-100 font-bold placeholder:text-neutral-700" 
                    placeholder="(00) 00000-0000" required 
                  />
                </div>
              </div>
            </div>
            <div className="pt-4">
              <button className="w-full py-6 bg-amber-500 text-neutral-950 font-black rounded-[2rem] hover:bg-amber-400 transition-all shadow-[0_20px_40px_-10px_rgba(245,158,11,0.3)] active:scale-[0.98] uppercase tracking-[0.2em] text-sm italic">
                Confirmar Agendamento
              </button>
            </div>
          </form>
        );
      case 'payment':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
             <div className="space-y-4">
               <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Forma de Pagamento</h3>
               <div className="flex flex-col gap-4">
                 <button onClick={() => setPaymentMethod('pix')} className={`p-6 rounded-3xl border-2 transition-all flex items-center justify-between ${paymentMethod === 'pix' ? 'border-amber-500 bg-amber-500/10 text-amber-500' : 'border-neutral-800 text-neutral-500 hover:border-neutral-700'}`}>
                   <div className="flex items-center gap-4"><Smartphone size={24} /><span className="font-black uppercase tracking-widest text-[10px]">PIX Instantâneo</span></div>
                   {paymentMethod === 'pix' && <CheckCircle2 size={18} />}
                 </button>
                 <button onClick={() => setPaymentMethod('at_shop')} className={`p-6 rounded-3xl border-2 transition-all flex items-center justify-between ${paymentMethod === 'at_shop' ? 'border-amber-500 bg-amber-500/10 text-amber-500' : 'border-neutral-800 text-neutral-500 hover:border-neutral-700'}`}>
                   <div className="flex items-center gap-4"><MapPin size={24} /><span className="font-black uppercase tracking-widest text-[10px]">Pagar na Unidade</span></div>
                   {paymentMethod === 'at_shop' && <CheckCircle2 size={18} />}
                 </button>
               </div>
             </div>
             <button onClick={handleNext} className="w-full py-6 bg-amber-500 text-neutral-950 font-black rounded-[2rem] hover:bg-amber-400 transition-all shadow-xl active:scale-[0.98] uppercase tracking-[0.2em] text-sm italic">
               Finalizar Reserva
             </button>
          </div>
        );
      case 'success':
        return (
          <div className="text-center py-10 space-y-10 animate-in zoom-in duration-500">
            <div className="w-28 h-28 bg-amber-500 text-neutral-950 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(245,158,11,0.3)] rotate-3">
              <CheckCircle2 size={56} />
            </div>
            <div className="space-y-3">
              <h3 className="text-3xl font-black text-neutral-100 tracking-tight leading-tight italic uppercase tracking-tighter">Sucesso!</h3>
              <p className="text-neutral-500 text-sm font-bold leading-relaxed uppercase tracking-widest">Sua vaga está garantida na {tenant.name}.</p>
            </div>
            <div className="bg-neutral-900 p-6 rounded-3xl border border-neutral-800 text-left space-y-2">
               <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Resumo da Reserva</p>
               <p className="text-white font-black uppercase italic tracking-tight">{selectedService?.name}</p>
               <p className="text-neutral-400 text-xs font-bold uppercase tracking-widest">{formatDate(selectedDate)} às {selectedTime}h</p>
               <p className="text-neutral-500 text-[10px] font-medium uppercase tracking-widest">Profissional: {selectedProfessional?.name}</p>
            </div>
            <button onClick={() => { setStep('service'); setSelectedServiceId(null); setSelectedTime(null); setClientName(''); setClientEmail(''); setClientPhone(''); }} className="w-full py-5 bg-neutral-100 text-neutral-950 font-black rounded-3xl hover:bg-white transition-all uppercase tracking-widest text-xs italic">
              Nova Reserva
            </button>
          </div>
        );
    }
  };

  const whatsappUrl = tenantSettings.whatsapp_number ? `https://wa.me/${tenantSettings.whatsapp_number}` : '#';

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center overflow-x-hidden selection:bg-amber-500 selection:text-neutral-950 pb-20">
      
      {/* Header Banner */}
      <div className="w-full h-72 relative overflow-hidden flex items-center justify-center">
         {tenant.header_bg_url ? (
           <img src={tenant.header_bg_url} className="w-full h-full object-cover opacity-40" />
         ) : (
           <div className="w-full h-full bg-neutral-900" />
         )}
         <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/20 via-neutral-950/60 to-neutral-950"></div>
         
         <div className="absolute z-10 flex flex-col items-center gap-6 animate-in slide-in-from-top-12 duration-1000">
           <div className="w-28 h-28 bg-neutral-950 rounded-[2.5rem] p-2 shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-neutral-800/50 flex items-center justify-center overflow-hidden">
             {tenant.logo_url ? (
               <img src={tenant.logo_url} alt={tenant.name} className="w-full h-full object-contain" />
             ) : (
               <span className="text-3xl font-black text-amber-500 italic">JB</span>
             )}
           </div>
           <div className="text-center">
             <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic drop-shadow-2xl">{tenant.name}</h1>
             <div className="flex items-center justify-center gap-4 mt-3">
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500/80 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">Elite Barber Shop</span>
               <div className="w-1 h-1 bg-neutral-800 rounded-full"></div>
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 flex items-center gap-2"><MapPin size={12} className="text-amber-500" /> {tenantSettings.location_city}</span>
             </div>
           </div>
         </div>
      </div>

      <div className="w-full max-w-xl px-4 -mt-10 relative z-20">
        <div className="bg-neutral-900/60 backdrop-blur-3xl rounded-[3rem] border-2 border-neutral-800/50 overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
          {step !== 'success' && (
            <div className="p-10 pb-2">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  {step !== 'service' && (
                    <button onClick={handleBack} className="w-12 h-12 flex items-center justify-center bg-neutral-800 hover:bg-neutral-700 rounded-2xl transition-all text-neutral-400 hover:text-white border border-neutral-700/50 active:scale-90">
                      <ChevronLeft size={24} />
                    </button>
                  )}
                  <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">{
                    step === 'service' ? 'Estilo' : step === 'professional' ? 'Mestre' : step === 'date' ? 'Horário' : step === 'details' ? 'Dados' : 'Pagar'
                  }</h2>
                </div>
                <div className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Passo {['service', 'professional', 'date', 'details', 'payment'].indexOf(step) + 1} de 5</div>
              </div>
              <div className="w-full h-1 bg-neutral-800 rounded-full flex gap-1 mb-2 overflow-hidden">
                {['service', 'professional', 'date', 'details', 'payment'].map((s, idx) => (
                  <div key={s} className={`h-full transition-all duration-700 ${idx <= ['service', 'professional', 'date', 'details', 'payment'].indexOf(step) ? 'bg-amber-500 flex-1' : 'bg-neutral-800 w-4'}`} />
                ))}
              </div>
            </div>
          )}

          <div className="p-10 pt-6">
            {renderContent()}
          </div>
        </div>

        {/* Footer info for Public Page */}
        <div className="mt-12 text-center space-y-8 animate-in fade-in duration-1000">
          <div className="flex justify-center gap-4">
            {tenantSettings.social_instagram && (
              <a href={tenantSettings.social_instagram} target="_blank" rel="noopener noreferrer" className="w-14 h-14 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-center text-neutral-500 hover:text-amber-500 transition-all"><Instagram size={24} /></a>
            )}
            {tenantSettings.social_facebook && (
              <a href={tenantSettings.social_facebook} target="_blank" rel="noopener noreferrer" className="w-14 h-14 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-center text-neutral-500 hover:text-amber-500 transition-all"><Facebook size={24} /></a>
            )}
            {tenantSettings.whatsapp_number && (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-14 h-14 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-center text-neutral-500 hover:text-amber-500 transition-all"><Phone size={24} /></a>
            )}
          </div>
          
          <div className="flex flex-col gap-4 items-center">
            <p className="text-[9px] font-black text-neutral-700 uppercase tracking-[0.4em]">Propulsado por Scheduly Premium</p>
            
            <div className="flex items-center gap-4">
              {isAdmin ? (
                <button onClick={() => navigate('/')} className="text-amber-500 text-[10px] font-black uppercase tracking-widest hover:underline flex items-center gap-2 italic">
                  <LayoutDashboard size={14} /> Painel Administrativo
                </button>
              ) : (
                <button 
                  onClick={() => setShowLoginModal(true)}
                  className="text-neutral-700 hover:text-amber-500 transition-colors text-[9px] font-black uppercase tracking-widest flex items-center gap-2 italic"
                >
                  <Lock size={12} /> Acesso Restrito
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Restricted Access Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-neutral-950/90 backdrop-blur-xl z-[150] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-neutral-900 w-full max-w-md rounded-[3rem] border border-neutral-800 overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-500">
              <div className="p-10 text-center space-y-8">
                 <div className="w-20 h-20 bg-amber-500/10 text-amber-500 rounded-[2rem] flex items-center justify-center mx-auto border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                    <KeyRound size={36} />
                 </div>
                 
                 <div>
                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Área de Gestão</h3>
                    <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest mt-2">Identifique-se para acessar o painel mestre.</p>
                 </div>

                 <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2 text-left">
                       <label className="block text-[9px] font-black text-neutral-500 uppercase tracking-widest ml-1">E-mail Corporativo</label>
                       <div className="relative">
                          <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-600" size={18} />
                          <input 
                            type="email" 
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-800 p-5 pl-14 rounded-2xl text-white font-bold outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 transition-all"
                            placeholder="seu@email.com"
                            required
                          />
                       </div>
                    </div>

                    {loginError && (
                      <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-center gap-3 text-rose-500 text-[10px] font-black uppercase tracking-widest animate-in slide-in-from-top-2">
                         <AlertCircle size={16} /> {loginError}
                      </div>
                    )}

                    <div className="flex gap-4">
                       <button 
                        type="button"
                        onClick={() => setShowLoginModal(false)}
                        className="flex-1 py-5 text-neutral-500 font-black uppercase tracking-widest text-[10px] hover:bg-neutral-800 rounded-2xl transition-all"
                       >
                         Cancelar
                       </button>
                       <button 
                        type="submit"
                        disabled={isLoggingIn}
                        className="flex-[2] py-5 bg-amber-500 text-neutral-950 font-black rounded-2xl hover:bg-amber-400 transition-all shadow-xl active:scale-95 disabled:opacity-50 uppercase tracking-widest text-[10px] italic flex items-center justify-center gap-3"
                       >
                         {isLoggingIn ? <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin"></div> : <ShieldCheck size={18} />}
                         {isLoggingIn ? 'Verificando...' : 'Entrar no Sistema'}
                       </button>
                    </div>
                 </form>
              </div>
              
              <div className="px-10 py-6 bg-neutral-950/50 border-t border-neutral-800 flex items-center gap-4">
                 <Lock className="text-neutral-700" size={16} />
                 <p className="text-[8px] text-neutral-600 font-bold uppercase tracking-widest leading-relaxed">
                    Acesso monitorado. Tentativas não autorizadas serão registradas pelo sistema de segurança.
                 </p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
