// types/contract.ts
import type { ContractStatus, DocumentAccessMode } from './database'

export interface Contract {
  id: string; ownerId: string; title: string; description: string | null
  status: ContractStatus; originalPdfPath: string | null; finalizedPdfPath: string | null
  documentHash: string | null; expiresAt: Date | null; createdAt: Date; updatedAt: Date
}

export interface ContractSummary {
  id: string; title: string; description: string | null; status: ContractStatus
  signerCount: number; signedCount: number; expiresAt: Date | null; createdAt: Date
}

export interface AddSignerInput { fullName: string; email: string | null; phone: string | null }

export interface SignerSnapshot {
  name: string; email: string | null; signedAt: string
  ip: string | null; signatureType: 'drawn' | 'typed'
  signatureData?: string | null
}

export interface FinalizedDocument {
  id: string; contractId: string; storagePath: string; fileSizeBytes: number | null
  sha256Hash: string; signedBy: SignerSnapshot[]; verificationId: string
  verificationQrPath: string | null; isPubliclyVerifiable: boolean
  documentAccessMode: DocumentAccessMode; revokedAt: Date | null; finalizedAt: Date
}

export interface PublicVerificationData {
  verificationId: string; contractTitle: string; finalizedAt: Date; signerCount: number
  sha256Hash: string; signers: Array<{ name: string; signedAt: string }>
  isPubliclyVerifiable: boolean; revokedAt: Date | null; documentAccessMode: DocumentAccessMode
}

export type VerificationPageState =
  | { state: 'valid';        data: PublicVerificationData }
  | { state: 'revoked';      revokedAt: Date; contractTitle: string }
  | { state: 'not_found' }
  | { state: 'inconclusive'; reason?: string }
