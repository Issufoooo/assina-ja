export interface ApiError { error: string; code: ApiErrorCode }

export type ApiErrorCode =
  | 'invalid_key' | 'document_revoked' | 'access_restricted' | 'not_found'
  | 'expired' | 'already_signed' | 'otp_required' | 'otp_invalid'
  | 'otp_max_attempts' | 'otp_rate_limited' | 'unauthorized'
  | 'bad_request' | 'rate_limited' | 'server_error'

export interface DocumentAccessRequest { context: 'owner' | 'verification_key'; key?: string }
export interface DocumentAccessResponse { signedUrl: string; expiresAt: string }

export function truncateHash(h: string, n = 16): string {
  return h.length <= n ? h : `${h.slice(0, n)}…`
}
export function formatVerificationId(id: string): string { return id.toUpperCase() }
