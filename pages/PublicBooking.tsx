*** Begin Patch
*** Add File: páginas/PublicBooking.tsx
+import React, { useEffect, useMemo, useState } from 'react';
+import { useNavigate } from 'react-router-dom';
+import { supabase } from '../supabaseClient';
+import {
+  Mail,
+  AlertCircle,
+  Scissors,
+  Calendar as CalendarIcon,
+  Lock,
+  CheckCircle2,
+  Smartphone,
+  MapPin,
+} from 'lucide-react';
+
+type Appointment = {
+  id?: number;
+  client_name: string;
+  client_email: string;
+  client_phone: string;
+  service_id: number;
+  professional_id: number;
+  start_time: string;
+  end_time: string;
+  status?: string;
+  created_at?: string;
+};
+
+type Service = {
+  id: number;
+  name: string;
+  duration_min: number;
+  active?: boolean;
+};
+
+type Professional = {
+  id: number;
+  name: string;
+  active?: boolean;
+};
+
+export default function PublicBooking() {
+  const navigate = useNavigate();
+
+  // Steps
+  const [step, setStep] = useState<'service' | 'professional' | 'date' | 'details' | 'payment' | 'success'>('service');
+
+  // Selections
+  const [availableServices, setAvailableServices] = useState<Service[]>([]);
+  const [professionals, setProfessionals] = useState<Professional[]>([]);
+  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
+  const [selectedProfessionalId, setSelectedProfessionalId] = useState<number | null>(null);
+  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
+  const [selectedTime, setSelectedTime] = useState<string | null>(null);
+  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
+
+  // Client details
+  const [clientName, setClientName] = useState('');
+  const [clientEmail, setClientEmail] = useState('');
+  const [clientPhone, setClientPhone] = useState('');
+  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'at_shop' | null>(null);
+
+  // Login modal / admin
+  const [showLoginModal, setShowLoginModal] = useState(false);
+  const [loginEmail, setLoginEmail] = useState('');
+  const [loginPassword, setLoginPassword] = useState('');
+  const [isLoggingIn, setIsLoggingIn] = useState(false);
+  const [loginError, setLoginError] = useState('');
+
+  // Fetch services and professionals from Supabase on mount
+  useEffect(() => {
+    const load = async () => {
+      try {
+        const { data: servicesData } = await supabase.from<Service>('services').select('*').eq('active', true);
+        if (servicesData) setAvailableServices(servicesData);
+
+        const { data: prosData } = await supabase.from<Professional>('professionals').select('*').eq('active', true);
+        if (prosData) setProfessionals(prosData);
+      } catch (err) {
+        console.error('Erro ao carregar dados:', err);
+      }
+    };
+    load();
+  }, []);
+
+  // Generate simple available slots for the selected date and professional/service
+  useEffect(() => {
+    // If no service selected, fallback duration 30
+    const duration = availableServices.find(s => s.id === selectedServiceId)?.duration_min ?? 30;
+
+    // Simple mock: slots from 09:00 to 17:00 every duration minutes
+    const slots: string[] = [];
+    const startHour = 9;
+    const endHour = 17;
+    for (let h = startHour; h < endHour; h++) {
+      for (let m = 0; m < 60; m += Math.max(15, duration)) {
+        const hh = String(h).padStart(2, '0');
+        const mm = String(m).padStart(2, '0');
+        slots.push(`${hh}:${mm}`);
+      }
+    }
+    setAvailableSlots(slots);
+    setSelectedTime(null);
+  }, [selectedDate, selectedServiceId, selectedProfessionalId, availableServices]);
+
+  const selectedService = useMemo(() => availableServices.find(s => s.id === selectedServiceId) ?? null, [availableServices, selectedServiceId]);
+
+  const handleNext = () => {
+    if (step === 'service') setStep('professional');
+    else if (step === 'professional') setStep('date');
+    else if (step === 'date') setStep('details');
+    else if (step === 'details') setStep('payment');
+    else if (step === 'payment') setStep('success');
+  };
+
+  const handlePrev = () => {
+    if (step === 'professional') setStep('service');
+    else if (step === 'date') setStep('professional');
+    else if (step === 'details') setStep('date');
+    else if (step === 'payment') setStep('details');
+    else if (step === 'success') setStep('service');
+  };
+
+  // --- SUBSTITUIR AQUI: handleCreateAppointment com Supabase ---
+  const handleCreateAppointment = async () => {
+    if (!selectedServiceId || !selectedProfessionalId || !selectedTime) {
+      alert('Preencha todos os campos antes de confirmar.');
+      return;
+    }
+
+    const startTimeStr = `${selectedDate}T${selectedTime}:00`;
+    const startDate = new Date(startTimeStr);
+    const endDate = new Date(startDate.getTime() + (selectedService?.duration_min ?? 30) * 60000);
+
+    try {
+      const { error } = await supabase.from('appointments').insert([
+        {
+          client_name: clientName,
+          client_email: clientEmail,
+          client_phone: clientPhone,
+          service_id: selectedServiceId,
+          professional_id: selectedProfessionalId,
+          start_time: startDate.toISOString(),
+          end_time: endDate.toISOString(),
+          status: 'pendente',
+        } as Appointment,
+      ]);
+
+      if (error) {
+        console.error('Erro ao salvar agendamento:', error.message);
+        alert('Erro ao marcar agendamento.');
+      } else {
+        setStep('success');
+      }
+    } catch (err) {
+      console.error('Erro inesperado ao salvar agendamento:', err);
+      alert('Erro ao marcar agendamento.');
+    }
+  };
+  // --- FIM handleCreateAppointment ---
+
+  // --- SUBSTITUIR AQUI: handleLogin com Supabase Auth ---
+  const handleLogin = async (e: React.FormEvent) => {
+    e.preventDefault();
+    setIsLoggingIn(true);
+    setLoginError('');
+
+    try {
+      const { data, error } = await supabase.auth.signInWithPassword({
+        email: loginEmail,
+        password: loginPassword,
+      });
+
+      if (error) {
+        setLoginError(error.message);
+      } else {
+        setShowLoginModal(false);
+        navigate('/admin');
+      }
+    } catch (err: any) {
+      setLoginError(err?.message ?? 'Erro ao autenticar');
+    } finally {
+      setIsLoggingIn(false);
+    }
+  };
+  // --- FIM handleLogin ---
+
+  const formatDate = (dateStr: string | null) => {
+    if (!dateStr) return '';
+    const date = new Date(dateStr + 'T00:00:00');
+    return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
+  };
+
+  const renderContent = () => {
+    switch (step) {
+      case 'service':
+        return (
+          <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
+            {availableServices.filter(s => s.active ?? true).map(service => (
+              <button
+                key={service.id}
+                onClick={() => {
+                  setSelectedServiceId(service.id);
+                  handleNext();
+                }}
+                className={`p-6 rounded-2xl border-2 font-black transition-all ${selectedServiceId === service.id ? 'border-amber-500 bg-neutral-900 shadow' : 'border-neutral-800 bg-neutral-900/50'}`}
+              >
+                {service.name}
+              </button>
+            ))}
+          </div>
+        );
+      case 'professional':
+        return (
+          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
+            {professionals.filter(p => p.active ?? true).map(prof => (
+              <button
+                key={prof.id}
+                onClick={() => {
+                  setSelectedProfessionalId(prof.id);
+                  handleNext();
+                }}
+                className={`p-10 rounded-[2.5rem] border-2 text-center transition-all ${selectedProfessionalId === prof.id ? 'border-amber-500 bg-neutral-900' : 'border-neutral-800 bg-neutral-900/50'}`}
+              >
+                <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center text-3xl font-black ${selectedProfessionalId === prof.id ? 'bg-amber-500 text-neutral-950' : 'bg-neutral-800 text-neutral-500'}`}>
+                  {prof.name.split(' ').map(n => n[0]).join('')}
+                </div>
+                <div className="font-black">{prof.name}</div>
+              </button>
+            ))}
+          </div>
+        );
+      case 'date':
+        return (
+          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
+            <div className="text-center">
+              <input
+                type="date"
+                value={selectedDate}
+                min={new Date().toISOString().split('T')[0]}
+                onChange={(e) => {
+                  setSelectedDate(e.target.value);
+                  setSelectedTime(null);
+                }}
+                className="w-full bg-transparent p-0 text-3xl text-center border-none focus:ring-0 outline-none text-neutral-100 font-black appearance-none cursor-pointer"
+              />
+            </div>
+
+            <div>
+              <h5 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-6 text-center">Horários Disponíveis</h5>
+              {availableSlots.length > 0 ? (
+                <div className="grid grid-cols-3 gap-3">
+                  {availableSlots.map(t => (
+                    <button
+                      key={t}
+                      onClick={() => {
+                        setSelectedTime(t);
+                        handleNext();
+                      }}
+                      className={`py-5 rounded-2xl border-2 font-black transition-all text-sm tracking-widest ${selectedTime === t ? 'border-amber-500 bg-amber-500 text-neutral-950' : 'border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-amber-400 hover:bg-neutral-800'}`}
+                    >
+                      {t}
+                    </button>
+                  ))}
+                </div>
+              ) : (
+                <div className="text-center py-10 text-neutral-500 font-bold uppercase tracking-widest text-xs border border-dashed border-neutral-800 rounded-3xl">
+                  Não há mais horários disponíveis para hoje.
+                </div>
+              )}
+            </div>
+          </div>
+        );
+      case 'details':
+        return (
+          <form className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
+            <div className="bg-amber-500/5 p-6 rounded-3xl border border-amber-500/20 flex items-center gap-5 relative overflow-hidden">
+              <div className="absolute top-0 right-0 p-4 text-amber-500 opacity-5 pointer-events-none">
+                <Scissors size={80} />
+              </div>
+              <div className="bg-amber-500 text-neutral-950 p-3 rounded-2xl shadow-lg">
+                <CalendarIcon size={24} />
+              </div>
+              <div className="relative z-10">
+                <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-1">Seu Atendimento</p>
+                <p className="text-lg font-black text-neutral-100 tracking-tight leading-tight">
+                  {selectedService?.name} <span className="text-neutral-500 mx-1">/</span> {selectedTime}h
+                </p>
+                <p className="text-sm text-neutral-400 font-bold uppercase tracking-wide">
+                  {formatDate(selectedDate)}
+                </p>
+              </div>
+            </div>
+
+            <div className="grid grid-cols-1 gap-6">
+              <div>
+                <label className="block text-[9px] font-black text-neutral-500 uppercase tracking-widest ml-1">Nome</label>
+                <input value={clientName} onChange={(e) => setClientName(e.target.value)} className="w-full bg-neutral-900/50 p-5 rounded-2xl border-2 border-neutral-800 outline-none text-neutral-100 font-bold" placeholder="Seu nome" required />
+              </div>
+
+              <div>
+                <label className="block text-[9px] font-black text-neutral-500 uppercase tracking-widest ml-1">E-mail</label>
+                <div className="relative">
+                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-600" size={18} />
+                  <input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 p-5 pl-14 rounded-2xl text-white font-bold outline-none" placeholder="seu@email.com" required />
+                </div>
+              </div>
+
+              <div>
+                <label className="block text-[9px] font-black text-neutral-500 uppercase tracking-widest ml-1">Telefone</label>
+                <input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} className="w-full bg-neutral-900/50 p-5 rounded-2xl border-2 border-neutral-800 outline-none text-neutral-100 font-bold" placeholder="(00) 00000-0000" required />
+              </div>
+            </div>
+
+            <div className="pt-4">
+              <button type="button" onClick={handleNext} className="w-full py-6 bg-amber-500 text-neutral-950 font-black rounded-[2rem] hover:bg-amber-400 transition-all shadow active:scale-[0.98] uppercase tracking-[0.2em] text-sm italic">
+                Continuar
+              </button>
+            </div>
+          </form>
+        );
+      case 'payment':
+        return (
+          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
+            <div className="space-y-4">
+              <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Forma de Pagamento</h3>
+              <div className="flex flex-col gap-4">
+                <button onClick={() => setPaymentMethod('pix')} className={`p-6 rounded-3xl border-2 transition-all flex items-center justify-between ${paymentMethod === 'pix' ? 'border-amber-500 bg-amber-500/10 text-amber-500' : 'border-neutral-800 text-neutral-500 hover:border-neutral-700'}`}>
+                  <div className="flex items-center gap-4"><Smartphone size={24} /><span className="font-black uppercase tracking-widest text-[10px]">PIX Instantâneo</span></div>
+                  {paymentMethod === 'pix' && <CheckCircle2 size={18} />}
+                </button>
+                <button onClick={() => setPaymentMethod('at_shop')} className={`p-6 rounded-3xl border-2 transition-all flex items-center justify-between ${paymentMethod === 'at_shop' ? 'border-amber-500 bg-amber-500/10 text-amber-500' : 'border-neutral-800 text-neutral-500 hover:border-neutral-700'}`}>
+                  <div className="flex items-center gap-4"><MapPin size={24} /><span className="font-black uppercase tracking-widest text-[10px]">Pagar na Unidade</span></div>
+                  {paymentMethod === 'at_shop' && <CheckCircle2 size={18} />}
+                </button>
+              </div>
+            </div>
+
+            <button onClick={handleCreateAppointment} className="w-full py-6 bg-amber-500 text-neutral-950 font-black rounded-[2rem] hover:bg-amber-400 transition-all shadow-xl active:scale-[0.98] uppercase tracking-[0.2em] text-sm italic">
+              Finalizar Reserva
+            </button>
+          </div>
+        );
+      case 'success':
+        return (
+          <div className="text-center py-10 space-y-10 animate-in zoom-in duration-500">
+            <div className="w-28 h-28 bg-amber-500 text-neutral-950 rounded-[2.5rem] flex items-center justify-center mx-auto shadow rotate-3">
+              <CheckCircle2 size={56} />
+            </div>
+            <div>
+              <h3 className="text-2xl font-black text-white">Agendamento Confirmado</h3>
+              <p className="text-neutral-400">Recebemos seu pedido. Verifique seu e-mail para confirmação.</p>
+            </div>
+            <button onClick={() => { setStep('service'); setSelectedServiceId(null); setSelectedProfessionalId(null); }} className="py-4 px-8 bg-neutral-800 rounded-2xl text-white font-black">
+              Fazer outro agendamento
+            </button>
+          </div>
+        );
+      default:
+        return null;
+    }
+  };
+
+  return (
+    <div className="max-w-3xl mx-auto p-6">
+      <div className="p-10 pt-6">
+        {renderContent()}
+      </div>
+
+      {/* Footer info for Public Page */}
+      <div className="mt-12 text-center">
+        <button onClick={() => setShowLoginModal(true)} className="text-sm text-neutral-400 underline">Área de Gestão</button>
+      </div>
+
+      {/* Login Modal */}
+      {showLoginModal && (
+        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
+          <div className="w-full max-w-md bg-neutral-950 rounded-3xl border border-neutral-800 overflow-hidden">
+            <div className="p-8">
+              <h2 className="text-xl font-black text-white">Área de Gestão</h2>
+              <p className="text-sm text-neutral-500 mt-2">Identifique-se para acessar o painel.</p>
+
+              <form className="mt-6 space-y-4" onSubmit={handleLogin}>
+                <div>
+                  <label className="block text-[9px] font-black text-neutral-500 uppercase tracking-widest ml-1">E-mail Corporativo</label>
+                  <div className="relative">
+                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-600" size={18} />
+                    <input
+                      type="email"
+                      value={loginEmail}
+                      onChange={(e) => setLoginEmail(e.target.value)}
+                      className="w-full bg-neutral-950 border border-neutral-800 p-5 pl-14 rounded-2xl text-white font-bold outline-none"
+                      placeholder="seu@email.com"
+                      required
+                    />
+                  </div>
+                </div>
+
+                <div>
+                  <label className="block text-[9px] font-black text-neutral-500 uppercase tracking-widest ml-1">Senha</label>
+                  <input
+                    type="password"
+                    value={loginPassword}
+                    onChange={(e) => setLoginPassword(e.target.value)}
+                    className="w-full bg-neutral-950 border border-neutral-800 p-5 rounded-2xl text-white font-bold outline-none"
+                    placeholder="sua senha"
+                    required
+                  />
+                </div>
+
+                {loginError && (
+                  <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-center gap-3 text-rose-500 text-sm">
+                    <AlertCircle size={16} /> {loginError}
+                  </div>
+                )}
+
+                <div className="flex gap-4">
+                  <button type="submit" disabled={isLoggingIn} className="flex-1 py-4 bg-amber-500 text-neutral-950 font-black rounded-2xl">
+                    {isLoggingIn ? 'Entrando...' : 'Entrar'}
+                  </button>
+                  <button type="button" onClick={() => setShowLoginModal(false)} className="flex-1 py-4 bg-neutral-800 text-white rounded-2xl">
+                    Cancelar
+                  </button>
+                </div>
+              </form>
+            </div>
+
+            <div className="px-10 py-6 bg-neutral-950/50 border-t border-neutral-800 flex items-center gap-4">
+              <Lock className="text-neutral-700" size={16} />
+              <p className="text-[8px] text-neutral-600 font-bold uppercase tracking-widest leading-relaxed">
+                Acesso monitorado. Tentativas não autorizadas serão registradas pelo sistema de segurança.
+              </p>
+            </div>
+          </div>
+        </div>
+      )}
+    </div>
+  );
+}
*** End Patch
