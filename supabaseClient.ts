
import { createClient } from '@supabase/supabase-js';

// Identificador extraído da sua chave: sb_publishable_kroq0aDUd2VxpWk7I9zxxA_aHqqfX7N
// O ID do projeto Supabase é o bloco de 20 caracteres iniciais da chave em minúsculas
const PROJECT_ID = 'kroq0adud2vxpwk7i9zx'; 
const SUPABASE_URL = `https://${PROJECT_ID}.supabase.co`;
const SUPABASE_ANON_KEY = 'sb_publishable_kroq0aDUd2VxpWk7I9zxxA_aHqqfX7N';

/**
 * Tenta buscar variáveis de ambiente, mas prioriza os hardcoded caso a Vercel 
 * não esteja configurada corretamente ainda.
 */
const getEnv = (key: string, fallback: string): string => {
  try {
    const v = (import.meta as any).env?.[key] || (window as any).process?.env?.[key];
    return v && v !== 'undefined' ? v : fallback;
  } catch (e) {
    return fallback;
  }
};

const finalUrl = getEnv('VITE_SUPABASE_URL', SUPABASE_URL);
const finalKey = getEnv('VITE_SUPABASE_ANON_KEY', SUPABASE_ANON_KEY);

// Configuração otimizada para evitar 'Failed to Fetch'
export const supabase = createClient(finalUrl, finalKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: { 'x-application-name': 'jardel-barber' }
  }
});
