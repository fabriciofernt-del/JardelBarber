
import { createClient } from '@supabase/supabase-js';

/**
 * Accessing environment variables via process.env.
 * These are injected by Vite's 'define' configuration in vite.config.ts.
 */
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase]: Credenciais ausentes no ambiente. ' +
    'Certifique-se de configurar VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
