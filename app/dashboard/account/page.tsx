import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/server'
import { AccountClient } from './AccountClient'

export const metadata: Metadata = { title: 'Conta' }

export default async function AccountPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('full_name, created_at').eq('id', user.id).single()
  return <AccountClient fullName={profile?.full_name ?? 'Utilizador'} email={user.email ?? ''} memberSince={profile?.created_at ?? ''} />
}
