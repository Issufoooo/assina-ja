import { PDFDocument, StandardFonts, rgb, type PDFPage, type PDFFont } from 'pdf-lib'
import type { SignerSnapshot } from '@/types/contract'

// ─── Layout constants (A4 in pt) ────────────────────────────────────────────
const PAGE_W  = 595
const PAGE_H  = 842
const MARGIN  = 52
const INNER_W = PAGE_W - MARGIN * 2

// ─── Brand colors (rgb 0-1) ──────────────────────────────────────────────────
const C_BLUE    = rgb(0,    0.2,  1)        // #0033FF
const C_VIOLET  = rgb(0.59, 0.49, 1)        // #977DFF
const C_INK     = rgb(0.01, 0.03, 0.07)     // #030812
const C_MUTED   = rgb(0.57, 0.6,  0.71)     // #9198B5
const C_BORDER  = rgb(0.90, 0.91, 0.97)     // #EAEDF8
const C_SUCCESS = rgb(0,    0.77, 0.55)     // #00C48C
const C_LIGHT   = rgb(0.97, 0.97, 0.99)     // surface-raised

function drawText(page: PDFPage, text: string, opts: {
  x: number; y: number; font: PDFFont; size: number
  color?: ReturnType<typeof rgb>; maxWidth?: number
}) {
  const safe = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  page.drawText(safe, { x: opts.x, y: opts.y, font: opts.font, size: opts.size, color: opts.color ?? C_INK, maxWidth: opts.maxWidth })
}

function hline(page: PDFPage, y: number, opacity = 1) {
  page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 0.5, color: C_BORDER, opacity })
}

function formatTs(iso: string): string {
  try {
    return new Date(iso).toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }) + ' UTC'
  } catch { return iso }
}

export interface EmbedSignaturesOptions {
  originalPdfBytes: Uint8Array
  signers:          SignerSnapshot[]
  contractTitle:    string
  verificationId:   string
  verificationUrl:  string
  sha256Hash:       string
  finalizedAt:      Date
  qrPngBytes?:      Uint8Array | null
}

/**
 * Appends a premium Signature Certificate page to the original PDF.
 * Original pages are NEVER modified — preserves document integrity.
 */
export async function embedSignatures(opts: EmbedSignaturesOptions): Promise<Uint8Array> {
  const { originalPdfBytes, signers, contractTitle, verificationId, verificationUrl, sha256Hash, finalizedAt, qrPngBytes } = opts

  const pdfDoc = await PDFDocument.load(originalPdfBytes, { ignoreEncryption: true })

  const fontReg  = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const fontMono = await pdfDoc.embedFont(StandardFonts.Courier)

  const page = pdfDoc.addPage([PAGE_W, PAGE_H])

  let y = PAGE_H - MARGIN

  // ── Top gradient bar ───────────────────────────────────────────────────────
  // Simulate gradient with two overlapping rectangles
  page.drawRectangle({ x: MARGIN, y: y - 4, width: INNER_W / 2, height: 4, color: C_BLUE })
  page.drawRectangle({ x: MARGIN + INNER_W / 2, y: y - 4, width: INNER_W / 2, height: 4, color: C_VIOLET })
  y -= 20

  // ── Header ─────────────────────────────────────────────────────────────────
  drawText(page, 'Certificado de Assinatura Digital', { x: MARGIN, y, font: fontBold, size: 16, color: C_BLUE })
  y -= 16

  const titleTrunc = contractTitle.length > 70 ? contractTitle.slice(0, 67) + '...' : contractTitle
  drawText(page, titleTrunc, { x: MARGIN, y, font: fontBold, size: 11, color: C_INK, maxWidth: INNER_W - 90 })
  y -= 14

  drawText(page, `Finalizado em: ${formatTs(finalizedAt.toISOString())}`, { x: MARGIN, y, font: fontReg, size: 9, color: C_MUTED })
  y -= 8

  hline(page, y)
  y -= 16

  // ── Signers section ────────────────────────────────────────────────────────
  drawText(page, 'Assinaturas', { x: MARGIN, y, font: fontBold, size: 10, color: C_INK })
  y -= 14

  for (let i = 0; i < signers.length; i++) {
    const s           = signers[i]!
    const blockHeight = s.signatureType === 'drawn' ? 122 : 72
    if (y - blockHeight < MARGIN + 160) break  // avoid overflow

    // Block background
    page.drawRectangle({ x: MARGIN, y: y - blockHeight, width: INNER_W, height: blockHeight, color: C_LIGHT, borderColor: C_BORDER, borderWidth: 0.5, opacity: 1 })

    const ix = MARGIN + 12

    // Signer index label
    drawText(page, `Signatario ${i + 1}`, { x: ix, y: y - 14, font: fontReg, size: 7.5, color: C_MUTED })

    // Name
    const nameTrunc = s.name.length > 50 ? s.name.slice(0, 47) + '...' : s.name
    drawText(page, nameTrunc, { x: ix, y: y - 27, font: fontBold, size: 11, color: C_INK })

    // Email
    if (s.email) {
      const emailTrunc = s.email.length > 50 ? s.email.slice(0, 47) + '...' : s.email
      drawText(page, emailTrunc, { x: ix, y: y - 40, font: fontReg, size: 8.5, color: C_MUTED })
    }

    // Timestamp
    drawText(page, `Assinado: ${formatTs(s.signedAt)}`, { x: ix, y: y - 52, font: fontReg, size: 8.5, color: C_MUTED })

    // IP
    if (s.ip) drawText(page, `IP: ${s.ip}`, { x: ix, y: y - 63, font: fontMono, size: 7.5, color: C_MUTED })

    // Signature representation
    if (s.signatureType === 'drawn' && s.signatureData) {
      try {
        const base64 = s.signatureData.includes(',') ? s.signatureData.split(',')[1]! : s.signatureData
        const img    = await pdfDoc.embedPng(Buffer.from(base64, 'base64'))
        const dims   = img.scaleToFit(180, 48)
        page.drawImage(img, { x: ix, y: y - blockHeight + 8, width: dims.width, height: dims.height })
      } catch {
        drawText(page, '[assinatura manuscrita]', { x: ix, y: y - 80, font: fontReg, size: 9, color: C_MUTED })
      }
    } else if (s.signatureType === 'typed') {
      drawText(page, s.name, { x: ix, y: y - 82, font: fontBold, size: 15, color: C_BLUE })
      page.drawLine({ start: { x: ix, y: y - 86 }, end: { x: ix + 140, y: y - 86 }, thickness: 0.8, color: C_BLUE })
    }

    // Status dot
    page.drawCircle({ x: MARGIN + INNER_W - 16, y: y - 14, size: 4, color: C_SUCCESS })

    y -= blockHeight + 6
  }

  hline(page, y)
  y -= 16

  // ── Verification section ───────────────────────────────────────────────────

  // QR code (top-right of verification section)
  if (qrPngBytes && qrPngBytes.length > 0) {
    try {
      const qrImg = await pdfDoc.embedPng(qrPngBytes)
      const qrSz  = 72
      page.drawImage(qrImg, {
        x:      PAGE_W - MARGIN - qrSz,
        y:      y - qrSz,
        width:  qrSz,
        height: qrSz,
      })
    } catch { /* non-fatal */ }
  }

  drawText(page, 'Verificacao de Autenticidade', { x: MARGIN, y, font: fontBold, size: 10, color: C_INK })
  y -= 13

  drawText(page, 'ID de verificacao:', { x: MARGIN, y, font: fontReg, size: 8.5, color: C_MUTED })
  y -= 12
  drawText(page, verificationId, { x: MARGIN, y, font: fontMono, size: 13, color: C_BLUE })
  y -= 14

  drawText(page, `Verificar em: ${verificationUrl}`, { x: MARGIN, y, font: fontReg, size: 8.5, color: C_MUTED, maxWidth: INNER_W - 90 })
  y -= 14

  drawText(page, 'Hash SHA-256:', { x: MARGIN, y, font: fontReg, size: 8, color: C_MUTED })
  y -= 11
  drawText(page, sha256Hash.slice(0, 32), { x: MARGIN, y, font: fontMono, size: 7, color: C_MUTED })
  y -= 9
  drawText(page, sha256Hash.slice(32), { x: MARGIN, y, font: fontMono, size: 7, color: C_MUTED })

  // Footer
  hline(page, MARGIN + 18)
  drawText(page, 'Documento assinado digitalmente atraves da plataforma AssinaJa', {
    x: MARGIN, y: MARGIN + 8, font: fontReg, size: 7, color: C_MUTED,
  })

  return pdfDoc.save()
}
