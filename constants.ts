
import { supabase } from './supabaseClient';
import { Tenant, TenantSettings, Professional, Service, Appointment, RevenueEntry } from './types';

export const TENANT_ID = 1;

// --- INITIAL STATE PLACEHOLDERS (For UI initialization before fetch) ---

export const DEFAULT_TENANT: Tenant = {
  id: 1,
  name: 'Carregando...',
  slug: 'loading',
  status: 'ativo',
  created_at: new Date().toISOString(),
  logo_url: '',
  header_bg_url: ''
};

export const DEFAULT_SETTINGS: TenantSettings = {
  id: 1,
  tenant_id: 1,
  work_start: '09:00',
  work_end: '20:00',
  slot_step_min: 30,
  buffer_min: 15,
  timezone: 'America/Sao_Paulo',
  location_address: '',
  location_city: '',
  location_state: '',
  social_instagram: '',
  social_facebook: '',
  whatsapp_number: '',
  pix_copy_paste: '',
  pix_qr_url: ''
};

// --- API FUNCTIONS ---

export const getTenant = async (): Promise<Tenant> => {
  // Alterado de .single() para .maybeSingle() para evitar erro 406/JSON se vazio
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', TENANT_ID)
    .maybeSingle();
  
  if (error) {
    console.warn('Warning fetching tenant (using default):', error.message);
    return DEFAULT_TENANT;
  }
  
  return data || DEFAULT_TENANT;
};

export const updateTenant = async (updates: Partial<Tenant>) => {
  const { error } = await supabase.from('tenants').update(updates).eq('id', TENANT_ID);
  if (error) console.warn('Error updating tenant:', error.message);
  return { error };
};

export const getSettings = async (): Promise<TenantSettings> => {
  // Alterado de .single() para .maybeSingle()
  const { data, error } = await supabase
    .from('tenant_settings')
    .select('*')
    .eq('tenant_id', TENANT_ID)
    .maybeSingle();

  if (error || !data) {
    console.warn('Settings not found or error, returning defaults:', error?.message);
    return DEFAULT_SETTINGS;
  }
  return data;
};

export const updateSettings = async (updates: Partial<TenantSettings>) => {
  // Check if settings exist first using maybeSingle
  const { data } = await supabase
    .from('tenant_settings')
    .select('id')
    .eq('tenant_id', TENANT_ID)
    .maybeSingle();
  
  if (data) {
    const { error } = await supabase.from('tenant_settings').update(updates).eq('tenant_id', TENANT_ID);
    return { error };
  } else {
    const { error } = await supabase.from('tenant_settings').insert([{ ...updates, tenant_id: TENANT_ID }]);
    return { error };
  }
};

export const MONTHLY_PACKAGES: Service[] = [
  {
    id: 8,
    tenant_id: TENANT_ID,
    name: 'Pacote Mensal - 4 Cortes',
    duration_min: 40,
    price: 100.00,
    active: true,
    image_url: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 9,
    tenant_id: TENANT_ID,
    name: 'Pacote Mensal - 4 Cortes + Barba',
    duration_min: 55,
    price: 150.00,
    active: true,
    image_url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=600'
  }
];

export const DEFAULT_SERVICES: Service[] = [
  {
    id: 1,
    tenant_id: TENANT_ID,
    name: 'Corte Degrade',
    price: 50.00,
    duration_min: 45,
    image_url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600',
    active: true
  },
  {
    id: 2,
    tenant_id: TENANT_ID,
    name: 'Barba Completa',
    price: 35.00,
    duration_min: 30,
    image_url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=600',
    active: true
  },
  {
    id: 3,
    tenant_id: TENANT_ID,
    name: 'Combo (Corte + Barba)',
    price: 75.00,
    duration_min: 60,
    image_url: 'https://images.unsplash.com/photo-1599351431247-f10b21817021?auto=format&fit=crop&q=80&w=600',
    active: true
  },
  ...MONTHLY_PACKAGES
];

export const DEFAULT_PROFESSIONALS: Professional[] = [
  { id: 1, tenant_id: TENANT_ID, name: 'Jardel', specialty: 'Corte Master', active: true },
  { id: 2, tenant_id: TENANT_ID, name: 'Lucas', specialty: 'Barba e Acabamento', active: true }
];

export const getServices = async (): Promise<Service[]> => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('tenant_id', TENANT_ID)
      .order('name');
    
    if (error || !data || data.length === 0) {
      console.warn('Warning fetching services, using defaults:', error?.message);
      return DEFAULT_SERVICES;
    }

    // Verifica se os pacotes mensais já existem na lista retornada do banco
    const has4Cortes = data.some(s => s.name.toLowerCase().includes('4 cortes') && !s.name.toLowerCase().includes('barba'));
    const has4CortesBarba = data.some(s => s.name.toLowerCase().includes('4 cortes') && s.name.toLowerCase().includes('barba'));

    const merged = [...data];
    if (!has4Cortes) {
      merged.push(MONTHLY_PACKAGES[0]);
    }
    if (!has4CortesBarba) {
      merged.push(MONTHLY_PACKAGES[1]);
    }

    return merged;
  } catch (err) {
    console.error('Error fetching services:', err);
    return DEFAULT_SERVICES;
  }
};

export const createService = async (service: Partial<Service>) => {
  const { error } = await supabase.from('services').insert([{ ...service, tenant_id: TENANT_ID }]);
  return { error };
};

export const updateService = async (id: number, updates: Partial<Service>) => {
  const { error } = await supabase.from('services').update(updates).eq('id', id);
  return { error };
};

export const deleteService = async (id: number) => {
  const { error } = await supabase.from('services').delete().eq('id', id);
  return { error };
};

export const getProfessionals = async (): Promise<Professional[]> => {
  try {
    const { data, error } = await supabase
      .from('professionals')
      .select('*')
      .eq('tenant_id', TENANT_ID)
      .order('name');

    if (error || !data || data.length === 0) {
      console.warn('Warning fetching professionals (using defaults):', error?.message);
      return DEFAULT_PROFESSIONALS;
    }
    return data;
  } catch (err) {
    console.error('Error fetching professionals:', err);
    return DEFAULT_PROFESSIONALS;
  }
};

export const createProfessional = async (pro: Partial<Professional>) => {
  const { error } = await supabase.from('professionals').insert([{ ...pro, tenant_id: TENANT_ID }]);
  return { error };
};

export const updateProfessional = async (id: number, updates: Partial<Professional>) => {
  const { error } = await supabase.from('professionals').update(updates).eq('id', id);
  return { error };
};

export const deleteProfessional = async (id: number) => {
  const { error } = await supabase.from('professionals').delete().eq('id', id);
  return { error };
};

export const getAppointments = async (): Promise<Appointment[]> => {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('tenant_id', TENANT_ID)
    .order('start_time', { ascending: false });

  if (error) {
    console.warn('Warning fetching appointments:', error.message);
    return [];
  }
  return data || [];
};

export const createAppointment = async (appt: Partial<Appointment>): Promise<{ error: any; data?: any }> => {
  try {
    const appointmentToInsert = {
      ...appt,
      tenant_id: TENANT_ID,
    };

    // 1. Salvar diretamente no banco de dados Supabase
    let { data, error } = await supabase
      .from('appointments')
      .insert([appointmentToInsert])
      .select()
      .single();

    // Se ocorrer erro de chave estrangeira em service_id (ex: pacote com ID local ainda não sincronizado), tenta salvar com service_id nulo
    if (error && (error.code === '23503' || error.message?.includes('violates foreign key constraint'))) {
      console.warn('Foreign key issue on service_id, retrying without service_id constraint:', error.message);
      const fallbackInsert = { ...appointmentToInsert, service_id: null };
      const fallbackRes = await supabase
        .from('appointments')
        .insert([fallbackInsert])
        .select()
        .single();
      data = fallbackRes.data;
      error = fallbackRes.error;
    }

    if (error) {
      console.error('Erro ao salvar agendamento no Supabase:', error);
      return { error: new Error(error.message || 'Erro ao criar agendamento') };
    }

    // 2. Se houver endpoint configurado para disparo de emails, notifica de forma segura e não-bloqueante
    try {
      fetch('/api/criar-agendamento', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...appointmentToInsert, id: data?.id }),
      }).then(async res => {
        // Leitura segura sem lançar exceção de JSON
        const text = await res.text().catch(() => '');
        if (text && res.ok) {
          try { JSON.parse(text); } catch { /* ignore non-json */ }
        }
      }).catch(() => {
        // Ignora silenciosamente se o endpoint não estiver rodando
      });
    } catch {
      // Ignora erro de notificação em background
    }

    return { error: null, data };
  } catch (err: any) {
    console.error('Erro ao processar agendamento:', err);
    return { error: err };
  }
};

export const updateAppointment = async (id: number, updates: Partial<Appointment>) => {
  const { error } = await supabase.from('appointments').update(updates).eq('id', id);
  return { error };
};

export const deleteAppointment = async (id: number) => {
  const { error } = await supabase.from('appointments').delete().eq('id', id);
  return { error };
};

// Revenue (Optional - assumes table 'revenue' exists)
export const getRevenue = async (): Promise<RevenueEntry[]> => {
  const { data, error } = await supabase
    .from('revenue')
    .select('*')
    .eq('tenant_id', TENANT_ID)
    .order('date', { ascending: false });
    
  if (error) {
    console.warn('Revenue table might not exist or error fetching (ignoring):', error.message);
    return [];
  }
  return data || [];
};

export const createRevenue = async (entry: Partial<RevenueEntry>) => {
  const { error } = await supabase.from('revenue').insert([{ ...entry, tenant_id: TENANT_ID }]);
  return { error };
};

export const deleteRevenue = async (id: number) => {
  const { error } = await supabase.from('revenue').delete().eq('id', id);
  return { error };
};

// Backwards compatibility exports (empty arrays/objects to prevent immediate crashes before refactor)
export const CURRENT_TENANT = DEFAULT_TENANT; 
export const SETTINGS = DEFAULT_SETTINGS;
export const SERVICES: Service[] = [];
export const PROFESSIONALS: Professional[] = [];
export const MOCK_APPOINTMENTS: Appointment[] = [];
export const MOCK_REVENUE: RevenueEntry[] = [];
