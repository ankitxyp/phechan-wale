import { createClient } from '@supabase/supabase-js';

export function createPehchanSupabaseClient(supabaseUrl: string, supabaseAnonKey: string, customStorage?: any) {
  const options: any = {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    }
  };

  if (customStorage) {
    options.auth.storage = customStorage;
  }

  return createClient(supabaseUrl, supabaseAnonKey, options);
}
