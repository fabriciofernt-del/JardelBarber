
import { createClient } from '@supabase/supabase-js';

/**
 * Acessa variáveis de ambiente de forma segura no navegador.
 * Evita o erro "ReferenceError: process is not defined" que trava o app.
 */
const getEnv = (key: string): string => {
  try {
    // 1. Tenta o padrão moderno do Vite
    if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[key]) {
      return (import.meta as any).env[key];
    }
    // 2. Tenta o mapeamento do process.env (se injetado pelo bundler)
    if (typeof process !== 'undefined' && process.env && (process.env as any)[key]) {
      return (process.env as any)[key];
    }
  } catch (e) {
    // Fallback silencioso
  }
  return '';
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase]: Credenciais não detectadas. O app usará placeholders. ' +
    'Certifique-se de configurar as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no painel da Vercel.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
