import type { EventType } from './database'

export interface AuditEvent {
  id: string; contractId: string; signerId: string | null; signerName?: string
  eventType: EventType; metadata: Record<string, unknown>; ipAddress: string | null; createdAt: Date
}

export const EVENT_LABELS: Record<EventType, string> = {
  contract_created:   'Contrato criado',     signer_invited:     'Signatário convidado',
  signer_viewed:      'Documento visualizado', otp_sent:           'Código enviado',
  otp_verified:       'Identidade verificada', otp_failed:         'Verificação falhada',
  signer_signed:      'Documento assinado',  contract_finalized: 'Contrato finalizado',
  link_expired:       'Ligação expirada',    contract_revoked:   'Contrato revogado',
}

export const EVENT_ICONS: Record<EventType, string> = {
  contract_created:   'FileText',   signer_invited:     'UserPlus',
  signer_viewed:      'Eye',        otp_sent:           'Mail',
  otp_verified:       'ShieldCheck', otp_failed:        'ShieldX',
  signer_signed:      'PenLine',    contract_finalized: 'CheckCircle2',
  link_expired:       'Clock',      contract_revoked:   'XCircle',
}

export type EventColorIntent = 'default' | 'primary' | 'success' | 'warning' | 'danger'

export const EVENT_COLORS: Record<EventType, EventColorIntent> = {
  contract_created:   'primary',  signer_invited:     'default',
  signer_viewed:      'default',  otp_sent:           'default',
  otp_verified:       'primary',  otp_failed:         'danger',
  signer_signed:      'success',  contract_finalized: 'success',
  link_expired:       'warning',  contract_revoked:   'danger',
}
