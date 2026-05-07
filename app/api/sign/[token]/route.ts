import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { logEvent } from '@/lib/audit/log-event'

export async function GET(request: NextRequest, { params }: { params: { token: string } }): Promise<NextResponse> {
  const { token } = params
  const ip = request.headers.get('x-forwarded-for') ?? null
  const ua = request.headers.get('user-agent') ?? null
  const admin = createAdminClient()

  const { data: signer, error } = await admin.from('contract_signers').select('id,full_name,email,phone,status,contract_id,viewed_at,otp_verified_at,document_read_at').eq('signing_token', token).single()
  if (error || !signer) return NextResponse.json({ error:'Link inválido', code:'not_found' }, { status:404 })

  const { data: contract } = await admin.from('contracts').select('id,title,description,status,expires_at,owner_id').eq('id', signer.contract_id).single()
  if (!contract) return NextResponse.json({ error:'Contrato não encontrado', code:'not_found' }, { status:404 })
  if (contract.expires_at && new Date(contract.expires_at) < new Date()) { await logEvent({ contractId:contract.id, eventType:'link_expired', signerId:signer.id, ipAddress:ip }); return NextResponse.json({ error:'Link expirado', code:'expired' }, { status:410 }) }

  const { data: profile } = await admin.from('profiles').select('full_name').eq('id', contract.owner_id).single()
  const senderName = profile?.full_name ?? 'Remetente'

  if (!signer.viewed_at && signer.status === 'pending') {
    const now = new Date().toISOString()
    await admin.from('contract_signers').update({ status:'viewed', viewed_at:now }).eq('id', signer.id)
    await logEvent({ contractId:contract.id, eventType:'signer_viewed', signerId:signer.id, ipAddress:ip, metadata:{ userAgent:ua } })
  }

  return NextResponse.json({ id:signer.id, fullName:signer.full_name, email:signer.email, phone:signer.phone, status:signer.status, contractId:contract.id, contractTitle:contract.title, contractDescription:contract.description, senderName, expiresAt:contract.expires_at, documentReadAt:signer.document_read_at, otpVerifiedAt:signer.otp_verified_at })
}

export async function PATCH(request: NextRequest, { params }: { params: { token: string } }): Promise<NextResponse> {
  const admin = createAdminClient()
  const { data: signer } = await admin.from('contract_signers').select('id,status,document_read_at').eq('signing_token', params.token).single()
  if (!signer) return NextResponse.json({ error:'Not found', code:'not_found' }, { status:404 })
  if (!signer.document_read_at && signer.status === 'otp_verified') {
    await admin.from('contract_signers').update({ document_read_at: new Date().toISOString() }).eq('id', signer.id)
  }
  return NextResponse.json({ success:true })
}
