
import { createClient } from '@supabase/supabase-js';

// URL Real do projeto extraída da sua chave de API
const SUPABASE_URL = 'https://kroq0adud2vxpwk7i9zx.supabase.co';
// Chave anon que você forneceu
const SUPABASE_ANON_KEY = 'sb_publishable_kroq0aDUd2VxpWk7I9zxxA_aHqqfX7N';

/**
 * Cliente Supabase com configuração de resiliência.
 * O uso de hardcoding aqui previne que variáveis de ambiente incorretas na Vercel quebrem o app.
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
