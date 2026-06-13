import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check .env.local')
}

// Using untyped client to avoid generic resolution issues with supabase-js v2;
// types are applied at the query call site via explicit generics.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
