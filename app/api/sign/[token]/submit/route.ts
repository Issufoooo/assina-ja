import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { signatureSubmitSchema } from '@/lib/validations/schemas'
import { logEvent } from '@/lib/audit/log-event'
import { rateLimiter, limits } from '@/lib/rate-limit'

export async function POST(request: NextRequest, { params }: { params: { token: string } }): Promise<NextResponse> {
  const { token } = params
  const ip = request.headers.get('x-forwarded-for') ?? null
  const ua = request.headers.get('user-agent') ?? null

  let body: unknown
  try { body = await request.json() } catch { return NextResponse.json({ error:'Body inválido', code:'bad_request' }, { status:400 }) }
  const parsed = signatureSubmitSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error:'Dados inválidos', code:'bad_request' }, { status:422 })

  const { signingToken, signatureData, signatureType } = parsed.data
  if (signingToken !== token) return NextResponse.json({ error:'Token não coincide', code:'bad_request' }, { status:400 })

  const admin = createAdminClient()
  const rl = await rateLimiter.check('sign_submit', token, limits.signSubmit)
  if (!rl.allowed) return NextResponse.json({ error:'Demasiadas tentativas', code:'rate_limited' }, { status:429 })

  const { data: signer, error } = await admin.from('contract_signers').select('id,full_name,status,contract_id').eq('signing_token', token).single()
  if (error || !signer) return NextResponse.json({ error:'Link inválido', code:'not_found' }, { status:404 })
  if (signer.status === 'signed') return NextResponse.json({ error:'Já assinou', code:'already_signed' }, { status:409 })
  if (signer.status !== 'otp_verified') return NextResponse.json({ error:'Identidade não verificada', code:'otp_required' }, { status:403 })

  const { data: contract } = await admin.from('contracts').select('id,status,expires_at').eq('id', signer.contract_id).single()
  if (!contract) return NextResponse.json({ error:'Contrato não encontrado', code:'not_found' }, { status:404 })
  if (contract.status === 'completed') return NextResponse.json({ error:'Contrato já concluído', code:'expired' }, { status:409 })
  if (contract.expires_at && new Date(contract.expires_at) < new Date()) return NextResponse.json({ error:'Link expirado', code:'expired' }, { status:410 })

  const now = new Date().toISOString()
  const { error: updateErr } = await admin.from('contract_signers').update({ status:'signed', signature_data:signatureData, signature_type:signatureType, ip_address:ip, user_agent:ua, signed_at:now }).eq('id', signer.id).eq('status','otp_verified')
  if (updateErr) return NextResponse.json({ error:'Erro ao guardar assinatura', code:'server_error' }, { status:500 })

  await logEvent({ contractId:contract.id, eventType:'signer_signed', signerId:signer.id, ipAddress:ip, metadata:{ signatureType, signerName:signer.full_name } })

  const { data: allSigned } = await admin.rpc('fn_all_signers_signed', { p_contract_id: contract.id })
  if (!allSigned) return NextResponse.json({ success:true, isLastSigner:false })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  let verificationId: string|undefined

  try {
    const res = await fetch(`${appUrl}/api/contracts/${contract.id}/finalize`, { method:'POST', headers:{'Content-Type':'application/json','x-internal-secret': process.env.INTERNAL_API_SECRET??''} })
    if (res.ok) { const d = await res.json() as { verificationId?:string }; verificationId = d.verificationId }
    else console.error('[submit] finalize failed:', await res.text())
  } catch (err) { console.error('[submit] finalize error:', err) }

  return NextResponse.json({ success:true, isLastSigner:true, verificationId })
}
