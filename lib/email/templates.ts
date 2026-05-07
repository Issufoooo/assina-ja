/**
 * AssinaJá Email Templates
 *
 * All emails use inline styles for maximum client compatibility.
 * Brand colors: #0033FF (blue), #977DFF (violet), #030812 (text), #F4F5FB (background)
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://assina-ja.com'

// ─── Shared Layout ────────────────────────────────────────────────────────────

function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>AssinaJá</title>
</head>
<body style="margin:0;padding:0;background-color:#F4F5FB;font-family:'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F5FB;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#0033FF,#977DFF);border-radius:14px;padding:10px;width:40px;height:40px;text-align:center;vertical-align:middle;">
                    <span style="color:white;font-size:20px;font-weight:700;line-height:1;">✍</span>
                  </td>
                  <td style="padding-left:12px;font-family:'DM Sans',sans-serif;font-size:22px;font-weight:700;color:#030812;letter-spacing:-0.03em;">
                    AssinaJá
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#FFFFFF;border-radius:24px;box-shadow:0 4px 24px rgba(0,3,61,0.08),0 1px 4px rgba(0,3,61,0.04);overflow:hidden;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="font-size:12px;color:#9198B5;margin:0;font-family:'DM Sans',sans-serif;">
                AssinaJá · Plataforma de assinatura digital segura<br>
                <a href="${BASE_URL}" style="color:#0033FF;text-decoration:none;">${BASE_URL}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function topAccent(): string {
  return `<tr><td style="background:linear-gradient(90deg,#0033FF,#977DFF);height:4px;"></td></tr>`
}

function ctaButton(text: string, url: string): string {
  return `
  <table cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td align="center" style="padding-top:8px;padding-bottom:4px;">
        <a href="${url}"
           style="display:inline-block;background:linear-gradient(135deg,#0033FF,#977DFF);color:#FFFFFF;
                  font-family:'DM Sans',sans-serif;font-size:15px;font-weight:600;
                  text-decoration:none;padding:14px 32px;border-radius:12px;
                  box-shadow:0 4px 16px rgba(0,51,255,0.30);">
          ${text}
        </a>
      </td>
    </tr>
  </table>`
}

// ─── OTP EMAIL ────────────────────────────────────────────────────────────────

export function buildOtpEmail(opts: {
  signerName: string
  code:       string
  contractTitle: string
  expiresInMinutes?: number
}): { subject: string; html: string } {
  const { signerName, code, contractTitle, expiresInMinutes = 10 } = opts
  const digits = code.split('').map(d =>
    `<td style="width:44px;height:56px;text-align:center;background:#F4F5FB;border-radius:12px;border:2px solid rgba(0,51,255,0.15);font-family:'DM Sans',sans-serif;font-size:26px;font-weight:700;color:#0033FF;vertical-align:middle;">${d}</td>`
  ).join('<td style="width:6px;"></td>')

  const html = emailWrapper(`
    <table width="100%" cellpadding="0" cellspacing="0">
      ${topAccent()}
      <tr>
        <td style="padding:36px 36px 32px;">
          <h1 style="font-family:'DM Sans',sans-serif;font-size:22px;font-weight:700;color:#030812;margin:0 0 8px;letter-spacing:-0.02em;">
            O seu código de verificação
          </h1>
          <p style="font-size:14px;color:#4B5275;margin:0 0 28px;line-height:1.6;">
            Olá, <strong>${signerName}</strong>. Foi convidado(a) a assinar<br>
            <strong style="color:#030812;">${contractTitle}</strong>
          </p>

          <!-- OTP boxes -->
          <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
            <tr>${digits}</tr>
          </table>

          <p style="font-size:13px;color:#9198B5;text-align:center;margin:0 0 24px;">
            Este código expira em <strong>${expiresInMinutes} minutos</strong>.<br>
            Não o partilhe com ninguém.
          </p>

          <div style="background:#F4F5FB;border-radius:12px;padding:16px;margin-bottom:8px;">
            <p style="font-size:12px;color:#9198B5;margin:0;line-height:1.6;">
              Se não solicitou este código, pode ignorar este email. Nenhuma ação é necessária.
            </p>
          </div>
        </td>
      </tr>
    </table>
  `)

  return {
    subject: `${code} — Código de verificação AssinaJá`,
    html,
  }
}

// ─── CONTRACT INVITATION EMAIL ────────────────────────────────────────────────

export function buildInvitationEmail(opts: {
  signerName:    string
  senderName:    string
  contractTitle: string
  signingUrl:    string
  description?:  string
  expiresAt?:    string
}): { subject: string; html: string } {
  const { signerName, senderName, contractTitle, signingUrl, description, expiresAt } = opts

  const html = emailWrapper(`
    <table width="100%" cellpadding="0" cellspacing="0">
      ${topAccent()}
      <tr>
        <td style="padding:36px 36px 8px;">
          <!-- Icon -->
          <div style="width:56px;height:56px;background:linear-gradient(135deg,rgba(0,51,255,0.08),rgba(151,125,255,0.08));border-radius:16px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:24px;">
            <span style="font-size:28px;">📄</span>
          </div>

          <h1 style="font-family:'DM Sans',sans-serif;font-size:22px;font-weight:700;color:#030812;margin:0 0 8px;letter-spacing:-0.02em;">
            Tem um documento para assinar
          </h1>
          <p style="font-size:14px;color:#4B5275;margin:0 0 24px;line-height:1.6;">
            <strong style="color:#030812;">${senderName}</strong> convidou-o(a) a assinar digitalmente o seguinte documento:
          </p>

          <!-- Contract card -->
          <div style="background:linear-gradient(135deg,rgba(0,51,255,0.04),rgba(151,125,255,0.04));border:1px solid rgba(0,51,255,0.12);border-radius:16px;padding:20px;margin-bottom:28px;">
            <p style="font-size:16px;font-weight:700;color:#030812;margin:0 0 6px;font-family:'DM Sans',sans-serif;">${contractTitle}</p>
            ${description ? `<p style="font-size:13px;color:#4B5275;margin:0 0 12px;">${description}</p>` : ''}
            ${expiresAt ? `<p style="font-size:12px;color:#9198B5;margin:0;border-top:1px solid rgba(0,51,255,0.08);padding-top:12px;">⏰ Expira em ${expiresAt}</p>` : ''}
          </div>

          ${ctaButton('Assinar documento', signingUrl)}
        </td>
      </tr>
      <tr>
        <td style="padding:16px 36px 36px;">
          <p style="font-size:12px;color:#9198B5;margin:0;line-height:1.8;">
            Ou copie este link:<br>
            <a href="${signingUrl}" style="color:#0033FF;word-break:break-all;font-size:11px;">${signingUrl}</a>
          </p>
        </td>
      </tr>
    </table>
  `)

  return {
    subject: `${senderName} convidou-o(a) a assinar: ${contractTitle}`,
    html,
  }
}

// ─── COMPLETION EMAIL ─────────────────────────────────────────────────────────

export function buildCompletionEmail(opts: {
  recipientName:   string
  contractTitle:   string
  verificationId:  string
  verificationKey?: string   // only for sender and signers — raw key, sent once
  verificationUrl: string
  isSender:        boolean
  signerCount:     number
  finalizedAt:     string
}): { subject: string; html: string } {
  const {
    recipientName, contractTitle, verificationId,
    verificationKey, verificationUrl, isSender, signerCount, finalizedAt,
  } = opts

  const html = emailWrapper(`
    <table width="100%" cellpadding="0" cellspacing="0">
      ${topAccent()}
      <tr>
        <td style="padding:36px 36px 28px;">
          <!-- Success icon -->
          <div style="width:64px;height:64px;background:linear-gradient(135deg,rgba(0,196,140,0.12),rgba(0,196,140,0.06));border-radius:20px;margin-bottom:24px;text-align:center;line-height:64px;font-size:32px;">
            ✅
          </div>

          <h1 style="font-family:'DM Sans',sans-serif;font-size:22px;font-weight:700;color:#030812;margin:0 0 8px;letter-spacing:-0.02em;">
            ${isSender ? 'Contrato concluído!' : 'Assinatura registada!'}
          </h1>
          <p style="font-size:14px;color:#4B5275;margin:0 0 24px;line-height:1.6;">
            Olá, <strong>${recipientName}</strong>. O documento <strong style="color:#030812;">${contractTitle}</strong> foi ${isSender ? `assinado por todos os ${signerCount} signatário${signerCount === 1 ? '' : 's'}` : 'assinado com sucesso'} e está agora finalizado.
          </p>

          <!-- Verification block -->
          <div style="background:#F4F5FB;border-radius:16px;padding:20px;margin-bottom:24px;border:1px solid rgba(0,51,255,0.08);">
            <p style="font-size:11px;color:#9198B5;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.08em;font-family:'DM Sans',sans-serif;">ID de Verificação</p>
            <p style="font-size:18px;font-weight:700;color:#0033FF;margin:0 0 12px;font-family:'JetBrains Mono',monospace;letter-spacing:0.05em;">${verificationId}</p>

            ${verificationKey ? `
            <div style="border-top:1px solid rgba(0,51,255,0.08);padding-top:12px;margin-top:4px;">
              <p style="font-size:11px;color:#9198B5;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.08em;">Chave de Acesso ao Documento</p>
              <p style="font-size:13px;font-weight:600;color:#030812;margin:0 0 8px;font-family:'JetBrains Mono',monospace;word-break:break-all;">${verificationKey}</p>
              <p style="font-size:11px;color:#9198B5;margin:0;">Guarde esta chave para aceder ao PDF finalizado.</p>
            </div>` : ''}
          </div>

          ${ctaButton('Ver certificado de verificação', verificationUrl)}

          <p style="font-size:12px;color:#9198B5;text-align:center;margin:16px 0 0;">
            Finalizado em ${finalizedAt}
          </p>
        </td>
      </tr>
    </table>
  `)

  return {
    subject: `Contrato finalizado: ${contractTitle} · ${verificationId}`,
    html,
  }
}

// ─── Delivery via Resend ──────────────────────────────────────────────────────

export async function sendEmail(opts: {
  to:      string | string[]
  subject: string
  html:    string
}): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[email] DEV — To: ${opts.to} | Subject: ${opts.subject}`)
    }
    return
  }

  const res = await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({
      from:    `${process.env.RESEND_FROM_NAME ?? 'AssinaJá'} <${process.env.RESEND_FROM_EMAIL ?? 'noreply@assina-ja.com'}>`,
      to:      Array.isArray(opts.to) ? opts.to : [opts.to],
      subject: opts.subject,
      html:    opts.html,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`[email] Resend error ${res.status}: ${body}`)
  }
}
