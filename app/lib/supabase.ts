import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export function createSupabaseServerClient() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing server Supabase environment variables')
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export function createSupabaseBrowserClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing browser Supabase environment variables')
  }
  return createClient(supabaseUrl, supabaseAnonKey)
}
