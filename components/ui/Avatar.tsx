import { cn } from '@/lib/utils'

const PALETTES = [
  { bg: 'rgba(0,51,255,0.10)',   text: '#0033FF' },
  { bg: 'rgba(151,125,255,0.12)',text: '#7B5FE8' },
  { bg: 'rgba(0,196,140,0.10)',  text: '#00A87A' },
  { bg: 'rgba(245,158,11,0.10)', text: '#D97706' },
  { bg: 'rgba(239,68,68,0.10)',  text: '#DC2626' },
  { bg: 'rgba(0,3,61,0.08)',     text: '#4B5275' },
  { bg: 'rgba(0,51,255,0.06)',   text: '#0028CC' },
]

function getPalette(name: string) {
  let hash = 5381
  for (let i = 0; i < name.length; i++) hash = (hash * 33) ^ name.charCodeAt(i)
  return PALETTES[Math.abs(hash) % PALETTES.length] ?? PALETTES[0]!
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return (parts[0]?.[0] ?? '?').toUpperCase()
  return ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase()
}

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg'

const sizeStyles: Record<AvatarSize, { container: string; text: string }> = {
  xs: { container: 'w-6 h-6',   text: 'text-[9px]' },
  sm: { container: 'w-8 h-8',   text: 'text-2xs'   },
  md: { container: 'w-10 h-10', text: 'text-xs'    },
  lg: { container: 'w-12 h-12', text: 'text-sm'    },
}

export interface AvatarProps {
  name:           string
  size?:          AvatarSize
  colorOverride?: { bg: string; text: string }
  className?:     string
  title?:         string
}

export function Avatar({ name, size = 'md', colorOverride, className, title: titleProp }: AvatarProps) {
  const palette  = colorOverride ?? getPalette(name)
  const { container, text } = sizeStyles[size]
  return (
    <div
      role="img"
      aria-label={name}
      title={titleProp ?? name}
      className={cn(
        'rounded-full flex items-center justify-center shrink-0',
        'font-display font-bold leading-none select-none',
        'shadow-xs',
        container, text, className
      )}
      style={{ backgroundColor: palette.bg, color: palette.text }}
    >
      {getInitials(name)}
    </div>
  )
}

export interface AvatarGroupProps {
  names:      string[]
  max?:       number
  size?:      AvatarSize
  className?: string
}

export function AvatarGroup({ names, max = 4, size = 'sm', className }: AvatarGroupProps) {
  const visible  = names.slice(0, max)
  const overflow = names.length - max
  const { container, text } = sizeStyles[size]
  return (
    <div className={cn('flex items-center', className)} aria-label={`${names.length} signatário${names.length === 1 ? '' : 's'}`}>
      {visible.map((name, i) => (
        <div key={i} className="relative rounded-full border-2 border-background" style={{ marginLeft: i === 0 ? 0 : '-8px', zIndex: visible.length - i }}>
          <Avatar name={name} size={size} />
        </div>
      ))}
      {overflow > 0 && (
        <div
          className={cn('relative rounded-full border-2 border-background flex items-center justify-center bg-surface-raised shadow-xs', container, text, 'text-ink-secondary font-body font-semibold leading-none')}
          style={{ marginLeft: '-8px', zIndex: 0 }}
          aria-label={`e mais ${overflow}`}
        >
          +{overflow}
        </div>
      )}
    </div>
  )
}
