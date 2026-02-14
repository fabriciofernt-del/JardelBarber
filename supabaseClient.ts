
import { createClient } from '@supabase/supabase-js';

// Baseado na chave pública enviada: sb_publishable_kroq0aDUd2VxpWk7I9zxxA_aHqqfX7N
// O identificador do projeto é 'kroq0adud2vxpwk7i9zx'
const PROJECT_ID = 'kroq0adud2vxpwk7i9zx';
const SUPABASE_URL = `https://${PROJECT_ID}.supabase.co`;
const SUPABASE_ANON_KEY = 'sb_publishable_kroq0aDUd2VxpWk7I9zxxA_aHqqfX7N';

// Função para tentar obter das variáveis de ambiente ou usar os padrões corrigidos
const getEnv = (key: string): string => {
  try {
    return (import.meta as any).env?.[key] || (process as any).env?.[key] || '';
  } catch (e) {
    return '';
  }
};

const finalUrl = getEnv('VITE_SUPABASE_URL') || SUPABASE_URL;
const finalKey = getEnv('VITE_SUPABASE_ANON_KEY') || SUPABASE_ANON_KEY;

export const supabase = createClient(finalUrl, finalKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});
