
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jqrtyqsnoskeyfcffjdx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_KesfaJN5xYhLuqi5hSMWLA_CJYlxbLI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
