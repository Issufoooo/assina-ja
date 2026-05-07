import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import type { EventType } from '@/types/database'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const supabase = createServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Não autenticado', code: 'unauthorized' },
      { status: 401 }
    )
  }

  const contractId = params.id

  const { data: contract, error: contractError } = await supabase
    .from('contracts')
    .select('*')
    .eq('id', contractId)
    .eq('owner_id', user.id)
    .maybeSingle()

  if (contractError || !contract) {
    return NextResponse.json(
      { error: 'Contrato não encontrado', code: 'not_found' },
      { status: 404 }
    )
  }

  const { data: signers, error: signersError } = await supabase
    .from('contract_signers')
    .select(
      'id,full_name,email,phone,signing_token,status,signature_type,viewed_at,otp_verified_at,document_read_at,signed_at,created_at'
    )
    .eq('contract_id', contractId)
    .order('created_at', { ascending: true })

  if (signersError) {
    return NextResponse.json(
      { error: 'Erro ao carregar signatários', code: 'signers_fetch_failed' },
      { status: 500 }
    )
  }

  const { data: events, error: eventsError } = await supabase
    .from('contract_events')
    .select('id,event_type,signer_id,metadata,ip_address,created_at')
    .eq('contract_id', contractId)
    .order('created_at', { ascending: true })

  if (eventsError) {
    return NextResponse.json(
      { error: 'Erro ao carregar eventos', code: 'events_fetch_failed' },
      { status: 500 }
    )
  }

  const signerMap = new Map((signers ?? []).map((s) => [s.id, s.full_name]))
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? '').replace(/\/$/, '')

  return NextResponse.json({
    contract: {
      id: contract.id,
      ownerId: contract.owner_id,
      title: contract.title,
      description: contract.description,
      status: contract.status,
      documentHash: contract.document_hash,
      expiresAt: contract.expires_at,
      createdAt: contract.created_at,
      updatedAt: contract.updated_at,
    },
    signers: (signers ?? []).map((s) => ({
      id: s.id,
      fullName: s.full_name,
      email: s.email,
      phone: s.phone,
      signingToken: s.signing_token,
      signingUrl: `${appUrl}/sign/${s.signing_token}`,
      status: s.status,
      signatureType: s.signature_type,
      viewedAt: s.viewed_at,
      otpVerifiedAt: s.otp_verified_at,
      documentReadAt: s.document_read_at,
      signedAt: s.signed_at,
      createdAt: s.created_at,
    })),
    events: (events ?? []).map((e) => ({
      id: e.id,
      eventType: e.event_type as EventType,
      signerId: e.signer_id,
      signerName: e.signer_id ? signerMap.get(e.signer_id) ?? null : null,
      metadata: e.metadata,
      ipAddress: e.ip_address,
      createdAt: e.created_at,
    })),
  })
}