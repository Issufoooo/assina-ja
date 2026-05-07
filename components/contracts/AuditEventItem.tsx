import { FileText, UserPlus, Eye, Mail, ShieldCheck, ShieldX, PenLine, CheckCircle2, Clock, XCircle, type LucideIcon } from 'lucide-react'
import { cn, formatDateTime } from '@/lib/utils'
import { EVENT_LABELS, EVENT_COLORS, type EventColorIntent } from '@/types/audit'
import type { AuditEvent } from '@/types/audit'

const ICON_MAP: Record<string, LucideIcon> = { FileText, UserPlus, Eye, Mail, ShieldCheck, ShieldX, PenLine, CheckCircle2, Clock, XCircle }
const ICON_NAMES: Record<string, string> = { contract_created:'FileText', signer_invited:'UserPlus', signer_viewed:'Eye', otp_sent:'Mail', otp_verified:'ShieldCheck', otp_failed:'ShieldX', signer_signed:'PenLine', contract_finalized:'CheckCircle2', link_expired:'Clock', contract_revoked:'XCircle' }
const COLOR_CLASSES: Record<EventColorIntent, { icon: string; bg: string }> = {
  default: { icon:'text-ink-muted', bg:'bg-surface-dark' },
  primary: { icon:'text-primary',   bg:'bg-primary-dim' },
  success: { icon:'text-success',   bg:'bg-success-dim' },
  warning: { icon:'text-warning',   bg:'bg-warning-dim' },
  danger:  { icon:'text-danger',    bg:'bg-danger-dim'  },
}

export function AuditEventItem({ event, isLast=false }: { event: AuditEvent; isLast?: boolean }) {
  const intent  = EVENT_COLORS[event.eventType] ?? 'default'
  const colors  = COLOR_CLASSES[intent]
  const label   = EVENT_LABELS[event.eventType] ?? event.eventType
  const Icon    = ICON_MAP[ICON_NAMES[event.eventType] ?? 'FileText'] ?? FileText
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-border', colors.bg)}>
          <Icon size={14} className={colors.icon} aria-hidden="true"/>
        </div>
        {!isLast && <div className="w-px flex-1 bg-border-subtle mt-1" aria-hidden="true"/>}
      </div>
      <div className={cn('flex-1 pb-4', isLast && 'pb-0')}>
        <p className="text-sm font-body font-semibold text-ink-primary leading-tight">{label}</p>
        {event.signerName && <p className="text-xs text-ink-secondary mt-0.5">{event.signerName}</p>}
        <p className="text-xs text-ink-muted mt-0.5">{formatDateTime(event.createdAt)}</p>
      </div>
    </div>
  )
}
