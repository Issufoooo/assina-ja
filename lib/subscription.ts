import { createAdminClient, createServerClient } from '@/lib/supabase/server'

// ─── Constants ────────────────────────────────────────────────────────────────

export const TRIAL_DURATION_MONTHS = 3
export const PLAN_PRICE_MZN        = 600
export const PLAN_NAME             = 'AssinaJá Pro'

// ─── Types ────────────────────────────────────────────────────────────────────

export type SubscriptionStatus =
  | 'trial'         // within 3-month trial
  | 'active'        // paying subscriber
  | 'expired'       // trial ended, not subscribed
  | 'cancelled'     // previously active, cancelled

export interface SubscriptionInfo {
  status:          SubscriptionStatus
  trialStartedAt:  Date
  trialEndsAt:     Date
  trialDaysLeft:   number
  isInTrial:       boolean
  isPaid:          boolean
  canAccessApp:    boolean
}

// ─── Core Functions ───────────────────────────────────────────────────────────

/**
 * Calculates subscription status for a given profile row.
 * trial_started_at is set when the user first registers.
 */
export function computeSubscriptionStatus(profile: {
  trial_started_at: string | null
  subscription_status: string | null
  subscription_ends_at: string | null
}): SubscriptionInfo {
  const now            = new Date()
  const trialStartedAt = profile.trial_started_at
    ? new Date(profile.trial_started_at)
    : now

  const trialEndsAt = new Date(trialStartedAt)
  trialEndsAt.setMonth(trialEndsAt.getMonth() + TRIAL_DURATION_MONTHS)

  const trialDaysLeft = Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / 86_400_000))
  const isInTrial     = now < trialEndsAt

  const paidStatus    = profile.subscription_status
  const isPaid        = paidStatus === 'active'
  const canAccessApp  = isInTrial || isPaid

  let status: SubscriptionStatus
  if (isPaid)       status = 'active'
  else if (isInTrial) status = 'trial'
  else if (paidStatus === 'cancelled') status = 'cancelled'
  else status = 'expired'

  return { status, trialStartedAt, trialEndsAt, trialDaysLeft, isInTrial, isPaid, canAccessApp }
}

/**
 * Fetches subscription info for the currently authenticated user.
 * Returns null if not authenticated.
 */
export async function getSubscriptionInfo(): Promise<SubscriptionInfo | null> {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('trial_started_at, subscription_status, subscription_ends_at')
    .eq('id', user.id)
    .single()

  if (!profile) return null
  return computeSubscriptionStatus(profile)
}

/**
 * Marks trial as started for a new user.
 * Called once when the profile is created (or on first dashboard visit).
 */
export async function ensureTrialStarted(userId: string): Promise<void> {
  const admin = createAdminClient()

  // Only set if not already set
  const { data: profile } = await admin
    .from('profiles')
    .select('trial_started_at')
    .eq('id', userId)
    .single()

  if (!profile?.trial_started_at) {
    await admin
      .from('profiles')
      .update({ trial_started_at: new Date().toISOString() })
      .eq('id', userId)
  }
}

/**
 * Returns a human-readable description of the subscription status.
 */
export function getStatusLabel(info: SubscriptionInfo): string {
  switch (info.status) {
    case 'trial':     return `Período gratuito · ${info.trialDaysLeft} dia${info.trialDaysLeft === 1 ? '' : 's'} restante${info.trialDaysLeft === 1 ? '' : 's'}`
    case 'active':    return 'Subscrição ativa'
    case 'expired':   return 'Período gratuito expirado'
    case 'cancelled': return 'Subscrição cancelada'
  }
}

/**
 * Returns badge intent for the subscription status.
 */
export function getStatusIntent(info: SubscriptionInfo): 'success' | 'warning' | 'danger' | 'primary' {
  switch (info.status) {
    case 'active':    return 'success'
    case 'trial':     return info.trialDaysLeft <= 7 ? 'warning' : 'primary'
    case 'expired':   return 'danger'
    case 'cancelled': return 'danger'
  }
}
