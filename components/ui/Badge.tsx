import { cn } from '@/lib/utils'
import type { ContractStatus, SignerStatus } from '@/types/database'

export type BadgeIntent = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'violet'

export interface BadgeProps {
  intent?:    BadgeIntent
  pulse?:     boolean
  size?:      'sm' | 'md'
  className?: string
  children:   React.ReactNode
}

const intentStyles: Record<BadgeIntent, { badge: string; dot: string }> = {
  default:  { badge: 'bg-surface-dark text-ink-secondary border border-border',   dot: 'bg-ink-muted' },
  primary:  { badge: 'bg-primary-dim text-primary border border-primary/20',       dot: 'bg-primary' },
  success:  { badge: 'bg-success-dim text-success border border-success/20',       dot: 'bg-success' },
  warning:  { badge: 'bg-warning-dim text-warning border border-warning/20',       dot: 'bg-warning' },
  danger:   { badge: 'bg-danger-dim text-danger border border-danger/20',          dot: 'bg-danger' },
  violet:   { badge: 'bg-accent-dim text-accent border border-accent/20',          dot: 'bg-accent' },
}

const sizeStyles = {
  sm: 'text-2xs px-2 py-0.5 gap-1.5',
  md: 'text-xs  px-2.5 py-1 gap-2',
}

export function Badge({ intent = 'default', pulse = false, size = 'md', className, children }: BadgeProps) {
  const { badge, dot } = intentStyles[intent]
  return (
    <span className={cn('inline-flex items-center font-body font-semibold rounded-full', badge, sizeStyles[size], className)}>
      {pulse && (
        <span className={cn('shrink-0 rounded-full animate-pulse-soft', dot, size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2')} aria-hidden="true" />
      )}
      {children}
    </span>
  )
}

// ─── Domain Badges ────────────────────────────────────────────────────────────

const CONTRACT_INTENT: Record<ContractStatus, BadgeIntent> = {
  draft: 'default', pending: 'warning', completed: 'success', expired: 'danger',
}
const CONTRACT_LABEL: Record<ContractStatus, string> = {
  draft: 'Rascunho', pending: 'Em curso', completed: 'Concluído', expired: 'Expirado',
}

export function ContractStatusBadge({ status, size }: { status: ContractStatus; size?: BadgeProps['size'] }) {
  return (
    <Badge intent={CONTRACT_INTENT[status]} pulse={status === 'pending'} size={size}>
      {CONTRACT_LABEL[status]}
    </Badge>
  )
}

const SIGNER_INTENT: Record<SignerStatus, BadgeIntent> = {
  pending: 'default', viewed: 'warning', otp_verified: 'violet', signed: 'success',
}
const SIGNER_LABEL: Record<SignerStatus, string> = {
  pending: 'Pendente', viewed: 'Visualizado', otp_verified: 'Verificado', signed: 'Assinado',
}

export function SignerStatusBadge({ status, size }: { status: SignerStatus; size?: BadgeProps['size'] }) {
  return (
    <Badge intent={SIGNER_INTENT[status]} pulse={status === 'pending' || status === 'viewed'} size={size}>
      {SIGNER_LABEL[status]}
    </Badge>
  )
}
