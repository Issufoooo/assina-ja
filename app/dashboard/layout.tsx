import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { computeSubscriptionStatus } from '@/lib/subscription'
import { TopBar } from '@/components/layout/TopBar'
import { DashboardNav } from '@/components/layout/DashboardNav'

type DashboardProfile = {
  full_name: string | null
  trial_started_at: string | null
  subscription_status: string | null
  subscription_ends_at: string | null
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  const { data } = await supabase
    .from('profiles')
    .select('full_name, trial_started_at, subscription_status, subscription_ends_at')
    .eq('id', user.id)
    .maybeSingle()

  const profile = (data ?? null) as DashboardProfile | null

  const subscription = computeSubscriptionStatus({
    trial_started_at: profile?.trial_started_at ?? null,
    subscription_status: profile?.subscription_status ?? null,
    subscription_ends_at: profile?.subscription_ends_at ?? null,
  })

  const trialDaysLeft =
    typeof (subscription as any)?.daysLeft === 'number'
      ? (subscription as any).daysLeft
      : null

  const displayName = profile?.full_name ?? user.email ?? 'Utilizador'

  return (
    <div className="min-h-screen bg-app-atmosphere flex flex-col">
      <TopBar userName={displayName} trialDaysLeft={trialDaysLeft} />
      <main className="flex-1 flex flex-col pb-24 pt-5">{children}</main>
      <DashboardNav />
    </div>
  )
}