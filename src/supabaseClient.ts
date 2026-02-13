import { createClient } from '@supabase/supabase-js';

// Usa variáveis de ambiente para segurança
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Inicializa o cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
