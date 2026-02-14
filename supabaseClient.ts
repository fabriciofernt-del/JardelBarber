
import { createClient } from '@supabase/supabase-js';

/**
 * Acessa variáveis de ambiente de forma segura no navegador.
 */
const getEnv = (key: string): string => {
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[key]) {
      return (import.meta as any).env[key];
    }
    if (typeof process !== 'undefined' && process.env && (process.env as any)[key]) {
      return (process.env as any)[key];
    }
  } catch (e) {}
  return '';
};

// URL Deduzida a partir da chave fornecida (kroq0adud2vxpwk7i9zx)
const defaultUrl = 'https://kroq0adud2vxpwk7i9zx.supabase.co';
const defaultKey = 'sb_publishable_kroq0aDUd2VxpWk7I9zxxA_aHqqfX7N';

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || defaultUrl;
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || defaultKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
