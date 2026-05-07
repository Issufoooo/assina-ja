import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { otpVerifySchema } from '@/lib/validations/schemas'
import { verifyOtpCode, OTP_MAX_ATTEMPTS } from '@/lib/otp/generate'
import { logEvent } from '@/lib/audit/log-event'
import { rateLimiter, limits } from '@/lib/rate-limit'

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = request.headers.get('x-forwarded-for') ?? null

  let body: unknown
  try { body = await request.json() } catch { return NextResponse.json({ error:'Body inválido', code:'bad_request' }, { status:400 }) }
  const parsed = otpVerifySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error:'Dados inválidos', code:'bad_request' }, { status:422 })

  const { signingToken, code } = parsed.data
  const admin = createAdminClient()

  const { data: signer, error } = await admin.from('contract_signers').select('id,full_name,status,contract_id').eq('signing_token', signingToken).single()
  if (error || !signer) return NextResponse.json({ error:'Link inválido', code:'not_found' }, { status:404 })
  if (signer.status === 'otp_verified' || signer.status === 'signed') return NextResponse.json({ success:true, signerName: signer.full_name })

  const rl = await rateLimiter.check('otp_verify', signer.id, limits.otpVerify)
  if (!rl.allowed) return NextResponse.json({ error:'Demasiadas tentativas. Aguarde.', code:'otp_max_attempts' }, { status:429 })

  const { data: otpRow, error: otpErr } = await admin.from('otp_codes').select('id,code,expires_at,used,attempts').eq('signer_id', signer.id).eq('used', false).order('created_at', { ascending:false }).limit(1).single()
  if (otpErr || !otpRow) return NextResponse.json({ error:'Nenhum código activo. Solicite um novo código.', code:'otp_invalid' }, { status:400 })
  if (new Date(otpRow.expires_at) < new Date()) { await admin.from('otp_codes').update({ used:true }).eq('id', otpRow.id); return NextResponse.json({ error:'Código expirado. Solicite um novo.', code:'expired' }, { status:400 }) }
  if (otpRow.attempts >= OTP_MAX_ATTEMPTS) { await admin.from('otp_codes').update({ used:true }).eq('id', otpRow.id); return NextResponse.json({ error:'Código bloqueado. Solicite um novo.', code:'otp_max_attempts' }, { status:400 }) }

  // HMAC verification
  const isMatch = verifyOtpCode(signer.id, code.trim(), otpRow.code)
  if (!isMatch) {
    const newAttempts = otpRow.attempts + 1
    await admin.from('otp_codes').update({ attempts: newAttempts, used: newAttempts >= OTP_MAX_ATTEMPTS }).eq('id', otpRow.id)
    const remaining = OTP_MAX_ATTEMPTS - newAttempts
    await logEvent({ contractId: signer.contract_id, eventType:'otp_failed', signerId:signer.id, ipAddress:ip, metadata:{ attemptsRemaining:remaining } })
    return NextResponse.json({ error: remaining > 0 ? `Código incorreto. ${remaining} tentativa${remaining===1?'':'s'} restante${remaining===1?'':'s'}.` : 'Código bloqueado.', code:'otp_invalid', attemptsRemaining:remaining }, { status:400 })
  }

  await admin.from('otp_codes').update({ used:true }).eq('id', otpRow.id)
  await admin.from('contract_signers').update({ status:'otp_verified', otp_verified_at: new Date().toISOString() }).eq('id', signer.id)
  await logEvent({ contractId: signer.contract_id, eventType:'otp_verified', signerId:signer.id, ipAddress:ip })
  await rateLimiter.reset('otp_verify', signer.id)

  return NextResponse.json({ success:true, signerName: signer.full_name })
}
