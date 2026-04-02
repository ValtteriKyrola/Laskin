import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase-tunnukset puuttuvat. Lisää VITE_SUPABASE_URL ja VITE_SUPABASE_ANON_KEY tiedostoon .env.local'
  );
}

export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder'
);

export type TableName = 'investments' | 'layouts' | 'ded_input' | 'fastems_tree';
