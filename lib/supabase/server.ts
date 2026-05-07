import { createServerClient as createSSRClient, type CookieOptions } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

export function createServerClient() {
  const cookieStore = cookies()
  return createSSRClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) {
          try { cookieStore.set({ name, value, ...options }) } catch {}
        },
        remove(name: string, options: CookieOptions) {
          try { cookieStore.set({ name, value: '', ...options }) } catch {}
        },
      },
    }
  )
}

export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) throw new Error('[AssinaJá] SUPABASE_SERVICE_ROLE_KEY not set')
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key,
    { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } }
  )
}
