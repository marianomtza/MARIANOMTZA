import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export function hasServerSupabaseEnv() {
  return Boolean(supabaseUrl && supabaseServiceRoleKey)
}

export function createSupabaseServerClient() {
  if (!hasServerSupabaseEnv()) {
    throw new Error('Missing server Supabase environment variables')
  }
  return createClient(supabaseUrl!, supabaseServiceRoleKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export function hasBrowserSupabaseEnv() {
  return Boolean(supabaseUrl && supabaseAnonKey)
}

export function createSupabaseBrowserClient() {
  if (!hasBrowserSupabaseEnv()) {
    throw new Error('Missing browser Supabase environment variables')
  }
  return createClient(supabaseUrl!, supabaseAnonKey!)
}
