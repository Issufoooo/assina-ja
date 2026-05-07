import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { otpSendSchema } from '@/lib/validations/schemas'
import { generateOtpCode, hashOtpCode, getOtpExpiry, OTP_RESEND_COOLDOWN_SECS } from '@/lib/otp/generate'
import { logEvent } from '@/lib/audit/log-event'
import { rateLimiter, limits } from '@/lib/rate-limit'
import { maskEmail } from '@/lib/utils'
import { buildOtpEmail, sendEmail } from '@/lib/email/templates'

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'

  let body: unknown
  try { body = await request.json() } catch { return NextResponse.json({ error:'Body inválido', code:'bad_request' }, { status:400 }) }
  const parsed = otpSendSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error:'Token inválido', code:'bad_request' }, { status:422 })

  const { signingToken } = parsed.data
  const admin = createAdminClient()

  const { data: signer, error } = await admin.from('contract_signers').select('id,full_name,email,phone,status,contract_id').eq('signing_token', signingToken).single()
  if (error || !signer) return NextResponse.json({ error:'Link inválido', code:'not_found' }, { status:404 })
  if (signer.status === 'signed') return NextResponse.json({ error:'Já assinou', code:'already_signed' }, { status:409 })

  const rl = await rateLimiter.check('otp_send', signer.id, limits.otpSend)
  if (!rl.allowed) return NextResponse.json({ error:`Aguarde antes de pedir novo código.`, code:'otp_rate_limited', retryAfterMs: rl.retryAfterMs }, { status:429 })

  const { data: contract } = await admin.from('contracts').select('status,expires_at').eq('id', signer.contract_id).single()
  if (!contract) return NextResponse.json({ error:'Contrato não encontrado', code:'not_found' }, { status:404 })
  if (contract.status === 'completed') return NextResponse.json({ error:'Contrato já concluído', code:'expired' }, { status:409 })
  if (contract.expires_at && new Date(contract.expires_at) < new Date()) {
    await logEvent({ contractId: signer.contract_id, eventType:'link_expired', signerId:signer.id })
    return NextResponse.json({ error:'Link expirado', code:'expired' }, { status:410 })
  }

  const { data: recentOtp } = await admin.from('otp_codes').select('created_at').eq('signer_id', signer.id).eq('used', false).order('created_at', { ascending:false }).limit(1).single()
  if (recentOtp) {
    const secsSince = (Date.now() - new Date(recentOtp.created_at).getTime()) / 1000
    if (secsSince < OTP_RESEND_COOLDOWN_SECS) {
      const remaining = Math.ceil(OTP_RESEND_COOLDOWN_SECS - secsSince)
      return NextResponse.json({ error:`Aguarde ${remaining}s antes de reenviar.`, code:'otp_rate_limited', retryAfterSeconds:remaining }, { status:429 })
    }
  }

  // Invalidate old OTPs
  await admin.from('otp_codes').update({ used:true }).eq('signer_id', signer.id).eq('used', false)

  // Generate HMAC-hashed OTP
  const rawCode = generateOtpCode()
  const hashedCode = hashOtpCode(signer.id, rawCode)
  const expiresAt = getOtpExpiry()

  const { error: insertErr } = await admin.from('otp_codes').insert({ signer_id: signer.id, code: hashedCode, expires_at: expiresAt.toISOString() })
  if (insertErr) return NextResponse.json({ error:'Erro ao gerar código', code:'server_error' }, { status:500 })

  const maskedContact = signer.email ? maskEmail(signer.email) : (signer.phone ?? '')

  // Send email
  if (signer.email) {
    const { subject, html } = buildOtpEmail({ signerName: signer.full_name, code: rawCode, contractTitle: 'o seu documento' })
    await sendEmail({ to: signer.email, subject, html }).catch(e => console.error('[otp/send] email failed:', e))
  } else if (process.env.NODE_ENV !== 'production') {
    console.log(`[otp/send] DEV CODE for ${signer.full_name}: ${rawCode}`)
  }

  await logEvent({ contractId: signer.contract_id, eventType:'otp_sent', signerId:signer.id, ipAddress:ip, metadata:{ maskedContact } })

  const response: Record<string,unknown> = { maskedContact, expiresInSeconds:600 }
  if (process.env.NODE_ENV !== 'production' && !process.env.RESEND_API_KEY) response._devCode = rawCode

  return NextResponse.json(response)
}
