
import { createClient } from '@supabase/supabase-js';

/**
 * Safely retrieves environment variables across different runtimes (Vite, Node, Browser).
 * Prevents "Cannot read properties of undefined" errors.
 */
const getEnvVar = (key: string, fallback: string): string => {
  try {
    // 1. Try Vite's import.meta.env
    const viteEnv = (import.meta as any).env;
    if (viteEnv && viteEnv[key]) return viteEnv[key];
  } catch (e) {}

  try {
    // 2. Try standard process.env (polyfilled in index.html)
    const nodeEnv = (window as any).process?.env;
    if (nodeEnv && nodeEnv[key]) return nodeEnv[key];
  } catch (e) {}

  // 3. Return hardcoded fallback for the specific project
  return fallback;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL', 'https://kroq0adud2vxpwk7i9zx.supabase.co');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY', 'sb_publishable_kroq0aDUd2VxpWk7I9zxxA_aHqqfX7N');

// Configuração resiliente para o cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
