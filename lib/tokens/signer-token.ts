import { randomUUID } from 'crypto'

export function generateSigningToken(): string { return randomUUID() }

export function generateVerificationKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  return Array.from(bytes).map((b) => chars[b % chars.length]!).join('')
}

export function generateVerificationId(): string {
  const year  = new Date().getFullYear()
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const bytes = new Uint8Array(6)
  crypto.getRandomValues(bytes)
  const suffix = Array.from(bytes).map((b) => chars[b % chars.length]!).join('')
  return `ASJA-${year}-${suffix}`
}
