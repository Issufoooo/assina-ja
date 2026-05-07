import QRCode               from 'qrcode'
import { createAdminClient } from '@/lib/supabase/server'
import { embedSignatures }   from './embed-signature'
import { hashDocument }      from '@/lib/hash/document'
import type { SignerSnapshot } from '@/types/contract'

// ─── Storage path helpers ────────────────────────────────────────────────────

function compact(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

export function buildFinalizedPdfPath(contractId: string, now: Date): string {
  return `${contractId}/final_${compact(now)}.pdf`
}

export function buildQrPath(contractId: string, now: Date): string {
  return `${contractId}/qr_${compact(now)}.png`
}

// ─── QR generation ───────────────────────────────────────────────────────────

export async function generateQrPng(url: string): Promise<Buffer | null> {
  try {
    return await QRCode.toBuffer(url, {
      type: 'png', width: 200, margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#00033D', light: '#FFFFFF' },
    })
  } catch (err) {
    console.error('[pdf] QR generation failed:', err)
    return null
  }
}

// ─── Storage upload ───────────────────────────────────────────────────────────

async function upload(bucket: string, path: string, data: Uint8Array | Buffer, type: string): Promise<void> {
  const admin = createAdminClient()
  const { error } = await admin.storage.from(bucket).upload(path, data, { contentType: type, upsert: false })
  if (error) throw new Error(`[storage] Upload failed ${bucket}/${path}: ${error.message}`)
}

// ─── Fetch original PDF ───────────────────────────────────────────────────────

export async function fetchOriginalPdf(storagePath: string): Promise<Uint8Array> {
  const admin = createAdminClient()
  const { data, error } = await admin.storage.from('contracts-originals').download(storagePath)
  if (error || !data) throw new Error(`[storage] Failed to fetch original: ${error?.message}`)
  return new Uint8Array(await data.arrayBuffer())
}

// ─── Main finalization pipeline ───────────────────────────────────────────────

export interface FinalizePdfOptions {
  contractId:      string
  contractTitle:   string
  originalPdfPath: string
  signers:         SignerSnapshot[]
  verificationId:  string
  finalizedAt:     Date
  appUrl:          string
}

export interface FinalizePdfResult {
  pdfPath:       string
  qrPath:        string | null
  sha256Hash:    string
  fileSizeBytes: number
}

/**
 * Full finalization pipeline:
 * 1. Fetch original PDF from private storage
 * 2. Generate QR PNG linking to the verification URL
 * 3. First pass embed (placeholder hash) → compute real SHA-256
 * 4. Second pass embed (real hash embedded in certificate page)
 * 5. Upload final PDF and QR PNG to contracts-finalized bucket
 * 6. Return paths and hash for recording in finalized_documents
 */
export async function finalizePdf(opts: FinalizePdfOptions): Promise<FinalizePdfResult> {
  const { contractId, contractTitle, originalPdfPath, signers, verificationId, finalizedAt, appUrl } = opts
  const verificationUrl = `${appUrl}/verify/${verificationId}`

  // 1. Fetch original
  const originalBytes = await fetchOriginalPdf(originalPdfPath)

  // 2. Generate QR
  const qrBytes = await generateQrPng(verificationUrl)

  // 3. First pass — placeholder hash so we can compute real hash
  const firstPass = await embedSignatures({
    originalPdfBytes: originalBytes, signers, contractTitle,
    verificationId, verificationUrl,
    sha256Hash:       '0'.repeat(64),
    finalizedAt,
    qrPngBytes:       qrBytes ?? undefined,
  })

  // 4. Compute real SHA-256 of the first-pass output
  const realHash = hashDocument(firstPass)

  // 5. Second pass — embed real hash into certificate page
  const finalBytes = await embedSignatures({
    originalPdfBytes: originalBytes, signers, contractTitle,
    verificationId, verificationUrl,
    sha256Hash:       realHash,
    finalizedAt,
    qrPngBytes:       qrBytes ?? undefined,
  })

  // The stored hash must be of the actual stored bytes (second pass)
  const storedHash = hashDocument(finalBytes)

  // 6. Upload PDF
  const pdfPath = buildFinalizedPdfPath(contractId, finalizedAt)
  await upload('contracts-finalized', pdfPath, finalBytes, 'application/pdf')

  // 7. Upload QR (non-fatal)
  let qrPath: string | null = null
  if (qrBytes) {
    try {
      qrPath = buildQrPath(contractId, finalizedAt)
      await upload('contracts-finalized', qrPath, qrBytes, 'image/png')
    } catch (err) {
      console.error('[pdf] QR upload failed (non-fatal):', err)
      qrPath = null
    }
  }

  return { pdfPath, qrPath, sha256Hash: storedHash, fileSizeBytes: finalBytes.length }
}
