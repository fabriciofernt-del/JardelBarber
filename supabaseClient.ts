
import { createClient } from '@supabase/supabase-js';

/**
 * Recupera as variáveis de ambiente com validação rigorosa.
 * O ID do projeto extraído da sua chave é 'kroq0adud2vxpwk7i9zx'.
 */
const getEnvVar = (key: string, fallback: string): string => {
  let value = fallback;
  try {
    const viteEnv = (import.meta as any).env;
    if (viteEnv && viteEnv[key]) value = viteEnv[key];
  } catch (e) {}

  // Validação Crítica: Se a URL contiver 'jardelbarber.supabase.co', ela está errada.
  // Supabase usa IDs aleatórios. Vamos forçar a URL correta se detectarmos erro comum.
  if (key === 'VITE_SUPABASE_URL' && value.includes('jardelbarber.supabase.co')) {
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
