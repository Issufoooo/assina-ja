import { createAdminClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

type EventType = Database['public']['Enums']['event_type']
type Json = Database['public']['Tables']['contract_events']['Insert']['metadata']

type LogEventParams = {
  contractId: string
  eventType: EventType
  signerId?: string | null
  metadata?: Json
  ipAddress?: string | null
}

export async function logEvent(params: LogEventParams) {
  try {
    const admin = createAdminClient()

    await admin.from('contract_events').insert({
      contract_id: params.contractId,
      event_type: params.eventType,
      signer_id: params.signerId ?? null,
      metadata: params.metadata ?? {},
      ip_address: params.ipAddress ?? null,
    })
  } catch (error) {
    console.error('[AssinaJá] Failed to log audit event:', error)
  }
}