import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('pt-PT', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function formatRelativeDate(date: Date | string): string {
  const d      = typeof date === 'string' ? new Date(date) : date
  const now    = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin  = Math.floor(diffMs / 60_000)
  const diffHr   = Math.floor(diffMs / 3_600_000)
  const diffDay  = Math.floor(diffMs / 86_400_000)

  if (diffMin < 1)  return 'agora mesmo'
  if (diffMin < 60) return `há ${diffMin} min`
  if (diffHr  < 24) return `há ${diffHr}h`
  if (diffDay < 7)  return `há ${diffDay} dia${diffDay === 1 ? '' : 's'}`
  return formatDate(d)
}

export function getSignerContact(signer: { email: string | null; phone: string | null }): string {
  return signer.email ?? signer.phone ?? ''
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!local || !domain) return email
  return `${local[0]}***@${domain}`
}

export function truncateMiddle(str: string, keepStart = 8, keepEnd = 8): string {
  if (str.length <= keepStart + keepEnd + 3) return str
  return `${str.slice(0, keepStart)}…${str.slice(-keepEnd)}`
}
