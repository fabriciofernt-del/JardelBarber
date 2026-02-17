
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

export const getServices = async (): Promise<Service[]> => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('tenant_id', TENANT_ID)
    .order('name');
  
  if (error) {
    console.warn('Warning fetching services:', error.message);
    return [];
  }
  return data || [];
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
  const { data, error } = await supabase
    .from('professionals')
    .select('*')
    .eq('tenant_id', TENANT_ID)
    .order('name');

  if (error) {
    console.warn('Warning fetching professionals:', error.message);
    return [];
  }
  return data || [];
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

export const createAppointment = async (appt: Partial<Appointment>) => {
  const { error } = await supabase.from('appointments').insert([{ ...appt, tenant_id: TENANT_ID }]);
  return { error };
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
    .order('date', { ascending: false });
    
  if (error) {
    console.warn('Revenue table might not exist or error fetching (ignoring):', error.message);
    return [];
  }
  return data || [];
};

export const createRevenue = async (entry: Partial<RevenueEntry>) => {
  const { error } = await supabase.from('revenue').insert([entry]);
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
