
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kroq0adud2vxpwk7i9zx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_kroq0aDUd2VxpWk7I9zxxA_aHqqfX7N';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
