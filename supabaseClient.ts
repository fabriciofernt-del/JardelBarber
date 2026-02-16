
import { createClient } from '@supabase/supabase-js';

/**
 * A URL 'jardelbarber.supabase.co' não existe. 
 * O ID real do seu projeto é 'kroq0adud2vxpwk7i9zx'.
 * Este código substitui qualquer URL errada pela correta.
 */
const getEnvVar = (key: string, fallback: string): string => {
  let value = fallback;
  try {
    const viteEnv = (import.meta as any).env;
    if (viteEnv && viteEnv[key]) value = viteEnv[key];
  } catch (e) {}

  // Correção forçada para o erro ERR_NAME_NOT_RESOLVED
  if (key === 'VITE_SUPABASE_URL') {
    return 'https://kroq0adud2vxpwk7i9zx.supabase.co';
  }

  return value;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL', 'https://kroq0adud2vxpwk7i9zx.supabase.co');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY', 'sb_publishable_kroq0aDUd2VxpWk7I9zxxA_aHqqfX7N');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
