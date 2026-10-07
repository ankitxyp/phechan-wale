import { createPehchanSupabaseClient, SecureStorage } from '@pehchan-wale/shared-api';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createPehchanSupabaseClient(supabaseUrl, supabaseAnonKey, SecureStorage);
