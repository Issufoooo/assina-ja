/**
 * Production-grade rate limiter.
 *
 * Architecture:
 * - Default: in-memory store (works for single-instance / Vercel serverless with edge reuse)
 * - Upgrade path: swap RateLimitStore for Upstash Redis without touching call sites
 *
 * Usage:
 *   const result = await rateLimiter.check('otp_send', identifier, { limit: 3, windowMs: 60_000 })
 *   if (!result.allowed) return 429
 */

interface RateLimitEntry {
  count:   number
  resetAt: number
}

// In-memory store — acceptable for Vercel/single region, upgrade to Redis for multi-region
const store = new Map<string, RateLimitEntry>()

// Cleanup stale entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store.entries()) {
      if (now > entry.resetAt) store.delete(key)
    }
  }, 5 * 60 * 1000)
}

export interface RateLimitResult {
  allowed:       boolean
  remaining:     number
  resetAt:       number
  retryAfterMs:  number
}

export interface RateLimitOptions {
  /** Max requests allowed in the window */
  limit:    number
  /** Window duration in milliseconds */
  windowMs: number
}

export const rateLimiter = {
  async check(
    prefix:     string,
    identifier: string,
    opts:       RateLimitOptions
  ): Promise<RateLimitResult> {
    const key = `rl:${prefix}:${identifier}`
    const now = Date.now()

    const entry = store.get(key)

    if (!entry || now > entry.resetAt) {
      // Fresh window
      store.set(key, { count: 1, resetAt: now + opts.windowMs })
      return {
        allowed:      true,
        remaining:    opts.limit - 1,
        resetAt:      now + opts.windowMs,
        retryAfterMs: 0,
      }
    }

    if (entry.count >= opts.limit) {
      return {
        allowed:      false,
        remaining:    0,
        resetAt:      entry.resetAt,
        retryAfterMs: entry.resetAt - now,
      }
    }

    entry.count++
    store.set(key, entry)

    return {
      allowed:      true,
      remaining:    opts.limit - entry.count,
      resetAt:      entry.resetAt,
      retryAfterMs: 0,
    }
  },

  async reset(prefix: string, identifier: string): Promise<void> {
    store.delete(`rl:${prefix}:${identifier}`)
  },
}

// ─── Pre-configured limiters for each endpoint ────────────────────────────────

export const limits = {
  otpSend: { limit: 3, windowMs: 10 * 60 * 1000 },           // 3 per 10 min per signer
  otpVerify: { limit: 10, windowMs: 15 * 60 * 1000 },        // 10 per 15 min per signer
  signSubmit: { limit: 5, windowMs: 60 * 1000 },             // 5 per min per token
  documentAccess: { limit: 20, windowMs: 60 * 60 * 1000 },   // 20 per hour per IP
  keyVerify: { limit: 5, windowMs: 15 * 60 * 1000 },         // 5 per 15 min per verificationId
  contractCreate: { limit: 10, windowMs: 60 * 60 * 1000 },   // 10 per hour per user
} as const
