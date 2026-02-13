import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import {
  Mail,
  AlertCircle,
  Scissors,
  Calendar as CalendarIcon,
  Lock,
  CheckCircle2,
  Smartphone,
  MapPin,
} from 'lucide-react';

type Appointment = {
  id?: number;
  client_name: string;
  client_email: string;
  client_phone: string;
  service_id: number;
  professional_id: number;
  start_time: string;
  end_time: string;
  status?: string;
  created_at?: string;
};

type Service = {
  id: number;
  name: string;
  duration_min: number;
  active?: boolean;
};

type Professional = {
  id: number;
  name: string;
  active?: boolean;
};

export default function PublicBooking() {
  const navigate = useNavigate();

  const [step, setStep] = useState<'service' | 'professional' | 'date' | 'details' | 'payment' | 'success'>('service');

  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'at_shop' | null>(null);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    const load = async () => {
      const { data: servicesData } = await supabase.from<Service>('services').select('*').eq('active', true);
      if (servicesData) setAvailableServices(servicesData);

      const { data: prosData } = await supabase.from<Professional>('professionals').select('*').eq('active', true);
      if (prosData) setProfessionals(prosData);
    };
    load();
  }, []);

  useEffect(() => {
    const duration = availableServices.find(s => s.id === selectedServiceId)?.duration_min ?? 30;
    const slots: string[] = [];
    for (let h = 9; h < 17; h++) {
      for (let m = 0; m < 60; m += Math.max(15, duration)) {
        slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      }
    }
    setAvailableSlots(slots);
    setSelectedTime(null);
  }, [selectedDate, selectedServiceId, selectedProfessionalId, availableServices]);

  const selectedService = useMemo(() => availableServices.find(s => s.id === selectedServiceId) ?? null, [availableServices, selectedServiceId]);

  const handleNext = () => {
    if (step === 'service') setStep('professional');
    else if (step === 'professional') setStep('date');
    else if (step === 'date') setStep('details');
    else if (step === 'details') setStep('payment');
    else if (step === 'payment') setStep('success');
  };

  const handleCreateAppointment = async () => {
    if (!selectedServiceId || !selectedProfessionalId || !selectedTime) {
      alert('Preencha todos os campos antes de confirmar.');
      return;
    }

    const startTimeStr = `${selectedDate}T${selectedTime}:00`;
    const startDate = new Date(startTimeStr);
    const endDate = new Date(startDate.getTime() + (selectedService?.duration_min ?? 30) * 60000);

    const { error } = await supabase.from('appointments').insert([
      {
        client_name: clientName,
        client_email: clientEmail,
        client_phone: clientPhone,
        service_id: selectedServiceId,
        professional_id: selectedProfessionalId,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        status: 'pendente',
      } as Appointment,
    ]);

    if (error) {
      console.error('Erro ao salvar agendamento:', error.message);
      alert('Erro ao marcar agendamento.');
    } else {
      setStep('success');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (error) {
      setLoginError(error.message);
    } else {
      setShowLoginModal(false);
      navigate('/admin');
    }

    setIsLoggingIn(false);
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
          <div className="grid gap-6">
            {availableServices.map(service => (
              <button key={service.id} onClick={() => { setSelectedServiceId(service.id); handleNext(); }}>
                {service.name}
              </button>
            ))}
          </div>
        );
      case 'professional':
        return (
          <div className="grid grid-cols-2 gap-6">
            {professionals.map(prof => (
              <button key={prof.id} onClick={() => { setSelectedProfessionalId(prof.id); handleNext(); }}>
                {prof.name}
              </button>
            ))}
          </div>
        );
      case 'date':
        return (
          <div>
            <input type="date" value={selectedDate} min={new Date().toISOString().split('T')[0]} onChange={(e) => setSelectedDate(e.target.value)} />
            <div>
              {availableSlots.map(t => (
                <button key={t} onClick={() => { setSelectedTime(t); handleNext(); }}>{t}</button>
              ))}
            </div>
          </div>
        );
      case 'details':
        return (
          <form onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
            <input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Nome" required />
            <input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="Email" required />
            <input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="Telefone" required />
            <button type="submit">Continuar</button>
          </form>
        );
      case 'payment':
        return (
          <div>
            <button onClick={() => setPaymentMethod('pix')}>PIX</button>
            <button onClick={() => setPaymentMethod('at_shop')}>Na Unidade</button>
            <button onClick={handleCreateAppointment}>Finalizar Reserva</button>
          </div>
        );
      case 'success':
        return <div>Agendamento Confirmado!</div>;
      default:
        return null;
    }
  };

  return (
    <div>
      {renderContent()}
      {showLoginModal && (
        <form onSubmit={handleLogin}>
          <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="Email" required />
          <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Senha" required />
          {loginError && <div>{loginError}</div>}
          <button type="submit" disabled={isLoggingIn}>{isLoggingIn ? 'Entrando...' : 'Entrar'}</button>
        </form>
      )}
    </div>
  );
}

