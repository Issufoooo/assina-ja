import { createHmac, randomBytes, randomInt, timingSafeEqual } from 'crypto'

const OTP_SECRET = process.env.OTP_HMAC_SECRET ?? 'assina-ja-otp-fallback-secret-change-me'

/**
 * Generates a 6-digit OTP code using crypto.randomInt.
 * Range: 100000–999999 (always 6 digits).
 */
export function generateOtpCode(): string {
  return randomInt(100_000, 1_000_000).toString()
}

/**
 * Creates an HMAC-SHA256 hash of the OTP code combined with the signer ID.
 * Stored in the database — the raw code is never persisted.
 *
 * Format: HMAC(key=OTP_SECRET, data="{signerId}:{code}")
 */
export function hashOtpCode(signerId: string, code: string): string {
  return createHmac('sha256', OTP_SECRET)
    .update(`${signerId}:${code}`)
    .digest('hex')
}

/**
 * Verifies a submitted code against the stored HMAC hash.
 * Uses timingSafeEqual to prevent timing attacks.
 */
export function verifyOtpCode(signerId: string, submittedCode: string, storedHash: string): boolean {
  try {
    const expectedHash = hashOtpCode(signerId, submittedCode)
    const a = Buffer.from(expectedHash, 'hex')
    const b = Buffer.from(storedHash,   'hex')
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}

/**
 * OTP expiry: now + 10 minutes.
 */
export function getOtpExpiry(): Date {
  const d = new Date()
  d.setMinutes(d.getMinutes() + 10)
  return d
}

export const OTP_MAX_ATTEMPTS          = 5
export const OTP_RESEND_COOLDOWN_SECS  = 60
