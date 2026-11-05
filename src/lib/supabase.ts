import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://iotuxpcqewdzvqzncpad.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvdHV4cGNxZXdkenZxem5jcGFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzMjk4NjMsImV4cCI6MjA5MzkwNTg2M30.zCbvXj46AO1rbTxaWmi7wuolgdnVoHsz9Cd5UD2_PNU';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[StarX] Supabase environment variables are missing. Running in offline/demo mode.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
