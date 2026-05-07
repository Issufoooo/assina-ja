import type { SignerStatus, SignatureType } from './database'

export interface Signer {
  id: string; contractId: string; fullName: string; email: string | null; phone: string | null
  signingToken: string; status: SignerStatus; signatureType: SignatureType | null
  viewedAt: Date | null; otpVerifiedAt: Date | null; documentReadAt: Date | null
  signedAt: Date | null; createdAt: Date
}

export interface SignerContext {
  id: string; fullName: string; email: string | null; phone: string | null
  status: SignerStatus; contractId: string; contractTitle: string
  contractDescription: string | null; senderName: string; expiresAt: Date | null
  documentReadAt: Date | null; otpVerifiedAt: Date | null
}

export type SigningStep = 'entry' | 'verify' | 'read' | 'sign'

export const STATUS_TO_STEP: Record<SignerStatus, SigningStep> = {
  pending:      'entry',
  viewed:       'entry',
  otp_verified: 'read',
  signed:       'sign',
}

export interface OtpSendPayload   { signingToken: string }
export interface OtpVerifyPayload { signingToken: string; code: string }
export interface OtpVerifyResult  { success: true; signerName: string }
export interface SignatureSubmitResult { success: true; isLastSigner: boolean; verificationId?: string }
