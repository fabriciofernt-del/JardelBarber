
import { Tenant, TenantSettings, Professional, Service, Appointment, RevenueEntry } from './types';

// Initializing from localStorage if available, otherwise using defaults
const savedTenant = localStorage.getItem('jb_tenant_data');
const defaultTenant: Tenant = {
  id: 1,
  name: 'JARDEL BARBER',
  slug: 'jardelbarber',
  status: 'ativo',
  created_at: new Date().toISOString(),
  logo_url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=400&h=400&auto=format&fit=crop',
  header_bg_url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1200&auto=format&fit=crop'
};

export const CURRENT_TENANT: Tenant = savedTenant ? JSON.parse(savedTenant) : defaultTenant;

const savedSettings = localStorage.getItem('jb_settings_data');
const defaultSettings: TenantSettings = {
  id: 1,
  tenant_id: 1,
  work_start: '09:00',
  work_end: '20:00',
  slot_step_min: 30,
  buffer_min: 15,
  timezone: 'America/Sao_Paulo',
  location_address: 'Rua Costa Barros, 2231',
  location_city: 'Fortaleza',
  location_state: 'CE',
  social_instagram: 'https://www.instagram.com/jardeldss_barber?igsh=MTdoYnhvODNjZ215YQ==',
  social_facebook: '',
  whatsapp_number: '558599451711',
  pix_copy_paste: '00020101021126790014BR.GOV.BCB.PIX2557pix-qr.mercadopago.com/instore/ol/v2/rZJ2IlRqoiDJtzwyhEt15204000053039865802BR5915Jardel Barbeiro6009SAO PAULO62080504mpis6304460A',
  pix_qr_url: '' // Will be populated by user in Settings
};

export const SETTINGS: TenantSettings = savedSettings ? JSON.parse(savedSettings) : defaultSettings;

// Persistence for Professionals
const savedProfessionals = localStorage.getItem('jb_professionals_data');
const defaultProfessionals: Professional[] = [
  { id: 1, tenant_id: 1, name: 'JARDEL BARBER', specialty: 'Master Barber', active: true }
];
export const PROFESSIONALS: Professional[] = savedProfessionals ? JSON.parse(savedProfessionals) : defaultProfessionals;

// Persistence for Services com Imagens Fixas e Premium
const savedServices = localStorage.getItem('jb_services_data');
const defaultServices: Service[] = [
  { 
    id: 1, 
    tenant_id: 1, 
    name: 'Corte de cabelo', 
    duration_min: 30, 
    price: 30.00, 
    active: true,
    image_url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=600&auto=format&fit=crop'
  },
  { 
    id: 2, 
    tenant_id: 1, 
    name: 'Barba na Navalha', 
    duration_min: 20, 
    price: 30.00, 
    active: true,
    image_url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=600&auto=format&fit=crop'
  },
  { 
    id: 3, 
    tenant_id: 1, 
    name: 'Corte & Barba', 
    duration_min: 50, 
    price: 50.00, 
    active: true,
    // Imagem focada no combo de elite
    image_url: 'https://images.unsplash.com/photo-1599351431247-f10b21817021?q=80&w=600&auto=format&fit=crop'
  }
];
export const SERVICES: Service[] = savedServices ? JSON.parse(savedServices) : defaultServices;

// Persistence for Appointments (Live Data)
const savedAppointments = localStorage.getItem('jb_appointments_data');
const defaultAppointments: Appointment[] = [
  {
    id: 1,
    tenant_id: 1,
    user_name: 'Exemplo Sistema',
    user_email: 'admin@jardelbarber.com',
    user_phone: '558599451711',
    service_id: 1,
    professional_id: 1,
    start_time: new Date().toISOString(),
    end_time: new Date(Date.now() + 1800000).toISOString(),
    status: 'confirmado',
    created_at: new Date().toISOString()
  }
];
export const MOCK_APPOINTMENTS: Appointment[] = savedAppointments ? JSON.parse(savedAppointments) : defaultAppointments;

export const MOCK_REVENUE: RevenueEntry[] = [
  { id: 1, date: new Date().toISOString(), description: 'Corte de Cabelo - Cliente Carlos', category: 'servico', amount: 30.00, payment_method: 'dinheiro' },
  { id: 2, date: new Date().toISOString(), description: 'Pomada Modeladora Silver', category: 'produto', amount: 45.00, payment_method: 'pix' },
  { id: 3, date: new Date(Date.now() - 86400000).toISOString(), description: 'Combo Corte e Barba - Ricardo', category: 'servico', amount: 50.00, payment_method: 'cartao' },
  { id: 4, date: new Date(Date.now() - 172800000).toISOString(), description: 'Venda Óleo para Barba', category: 'produto', amount: 35.00, payment_method: 'dinheiro' }
];
