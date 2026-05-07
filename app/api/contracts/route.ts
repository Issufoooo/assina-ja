import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, createAdminClient } from '@/lib/supabase/server'
import { createContractSchema } from '@/lib/validations/schemas'
import { generateSigningToken } from '@/lib/tokens/signer-token'
import { logEvent } from '@/lib/audit/log-event'
import { rateLimiter, limits } from '@/lib/rate-limit'
import { buildInvitationEmail, sendEmail } from '@/lib/email/templates'

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error:'Não autenticado', code:'unauthorized' }, { status:401 })

  const rl = await rateLimiter.check('contract_create', user.id, limits.contractCreate)
  if (!rl.allowed) return NextResponse.json({ error:'Demasiadas criações. Aguarde.', code:'rate_limited' }, { status:429 })

  let body: unknown
  try { body = await request.json() } catch { return NextResponse.json({ error:'Body inválido', code:'bad_request' }, { status:400 }) }
  const parsed = createContractSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error:'Dados inválidos', code:'bad_request', issues: parsed.error.flatten() }, { status:422 })

  const { title, description, originalPdfPath, expiresAt, signers } = parsed.data
  const admin = createAdminClient()

  const { data: contract, error: contractError } = await admin.from('contracts').insert({ owner_id: user.id, title, description: description??null, original_pdf_path: originalPdfPath, status:'pending', expires_at: expiresAt??null }).select('id').single()
  if (contractError || !contract) return NextResponse.json({ error:'Erro ao criar contrato', code:'server_error' }, { status:500 })

  const signerRows = signers.map(s => ({ contract_id: contract.id, full_name: s.fullName, email: s.email??null, phone: s.phone??null, signing_token: generateSigningToken(), status:'pending' as const }))
  const { data: insertedSigners, error: signersError } = await admin.from('contract_signers').insert(signerRows).select('id,full_name,email,phone,signing_token')
  if (signersError || !insertedSigners) { await admin.from('contracts').delete().eq('id', contract.id); return NextResponse.json({ error:'Erro ao adicionar signatários', code:'server_error' }, { status:500 }) }

  await logEvent({ contractId: contract.id, eventType:'contract_created', metadata:{ title, signerCount:signers.length } })
  await Promise.all(insertedSigners.map(s => logEvent({ contractId: contract.id, eventType:'signer_invited', signerId:s.id, metadata:{ signerName:s.full_name } })))

  // Fetch sender name for invitation emails
  const { data: profile } = await admin.from('profiles').select('full_name').eq('id', user.id).single()
  const senderName = profile?.full_name ?? 'Remetente'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''

  // Send invitation emails (non-fatal)
  await Promise.all(insertedSigners.filter(s => s.email).map(s => {
    const { subject, html } = buildInvitationEmail({ signerName: s.full_name, senderName, contractTitle: title, signingUrl: `${appUrl}/sign/${s.signing_token}`, description: description??undefined })
    return sendEmail({ to: s.email!, subject, html }).catch(e => console.error('[contracts] invite email failed:', e))
  }))

  return NextResponse.json({ contractId: contract.id, signers: insertedSigners.map(s => ({ id:s.id, fullName:s.full_name, email:s.email, phone:s.phone, signingToken:s.signing_token, signingUrl:`${appUrl}/sign/${s.signing_token}` })) }, { status:201 })
}
