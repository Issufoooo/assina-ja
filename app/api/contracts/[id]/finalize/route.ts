import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createServerClient, createAdminClient } from '@/lib/supabase/server'
import { finalizePdf } from '@/lib/pdf/generate-final'
import { logEvent } from '@/lib/audit/log-event'
import { generateVerificationId, generateVerificationKey } from '@/lib/tokens/signer-token'
import { buildCompletionEmail, sendEmail } from '@/lib/email/templates'
import type { SignerSnapshot } from '@/types/contract'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const contractId = params.id
  const internalSecret = request.headers.get('x-internal-secret')
  const isInternal =
    !!(
      internalSecret &&
      process.env.INTERNAL_API_SECRET &&
      internalSecret === process.env.INTERNAL_API_SECRET
    )

  let userId: string | null = null

  if (!isInternal) {
    const supabase = createServerClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json(
        { error: 'Não autenticado', code: 'unauthorized' },
        { status: 401 }
      )
    }

    userId = user.id
  }

  const admin = createAdminClient()

  const { data: contract } = await admin
    .from('contracts')
    .select('id,owner_id,title,status,original_pdf_path')
    .eq('id', contractId)
    .single()

  if (!contract) {
    return NextResponse.json(
      { error: 'Contrato não encontrado', code: 'not_found' },
      { status: 404 }
    )
  }

  if (!isInternal && contract.owner_id !== userId) {
    return NextResponse.json(
      { error: 'Acesso negado', code: 'unauthorized' },
      { status: 403 }
    )
  }

  if (contract.status === 'completed') {
    const { data: existing } = await admin
      .from('finalized_documents')
      .select('verification_id')
      .eq('contract_id', contractId)
      .single()

    return NextResponse.json(
      { message: 'Já finalizado', verificationId: existing?.verification_id },
      { status: 200 }
    )
  }

  if (contract.status !== 'pending') {
    return NextResponse.json(
      { error: 'Contrato não está em curso', code: 'bad_request' },
      { status: 409 }
    )
  }

  if (!contract.original_pdf_path) {
    return NextResponse.json(
      { error: 'PDF original não encontrado', code: 'bad_request' },
      { status: 409 }
    )
  }

  const { data: allSigned } = await admin.rpc('fn_all_signers_signed', {
    p_contract_id: contractId,
  })

  if (!allSigned) {
    return NextResponse.json(
      { error: 'Nem todos assinaram', code: 'bad_request' },
      { status: 409 }
    )
  }

  const { data: signerRows } = await admin
    .from('contract_signers')
    .select(
      'id,full_name,email,signature_type,signature_data,ip_address,signed_at'
    )
    .eq('contract_id', contractId)
    .order('created_at', { ascending: true })

  if (!signerRows?.length) {
    return NextResponse.json(
      { error: 'Erro ao carregar signatários', code: 'server_error' },
      { status: 500 }
    )
  }

  const snapshots: SignerSnapshot[] = signerRows.map((s) => ({
    name: s.full_name,
    email: s.email,
    signedAt: s.signed_at ?? new Date().toISOString(),
    ip: s.ip_address,
    signatureType: (s.signature_type ?? 'typed') as 'drawn' | 'typed',
    signatureData: s.signature_data,
  }))

  const rawKey = generateVerificationKey()
  const verificationId = generateVerificationId()
  const finalizedAt = new Date()
  const hashedKey = await bcrypt.hash(rawKey, 10)

  let pdfResult: Awaited<ReturnType<typeof finalizePdf>>

  try {
    pdfResult = await finalizePdf({
      contractId,
      contractTitle: contract.title,
      originalPdfPath: contract.original_pdf_path,
      signers: snapshots,
      verificationId,
      finalizedAt,
      appUrl: process.env.NEXT_PUBLIC_APP_URL ?? '',
    })
  } catch (err) {
    console.error('[finalize] PDF failed:', err)
    return NextResponse.json(
      { error: 'Erro ao gerar PDF final', code: 'server_error' },
      { status: 500 }
    )
  }

  // 🔥 CORREÇÃO AQUI
  const { error: fdErr } = await admin.from('finalized_documents').insert({
    contract_id: contractId,
    storage_path: pdfResult.pdfPath,
    file_size_bytes: pdfResult.fileSizeBytes,
    sha256_hash: pdfResult.sha256Hash,
    signed_by: snapshots as any, // <-- corrigido
    verification_id: verificationId,
    verification_key: hashedKey,
    verification_qr_path: pdfResult.qrPath ?? null,
    is_publicly_verifiable: true,
    document_access_mode: 'key_required',
  })

  if (fdErr) {
    console.error('[finalize] DB insert failed:', fdErr.message)
    return NextResponse.json(
      { error: 'Erro ao registar finalização', code: 'server_error' },
      { status: 500 }
    )
  }

  await admin
    .from('contracts')
    .update({
      status: 'completed',
      finalized_pdf_path: pdfResult.pdfPath,
      document_hash: pdfResult.sha256Hash,
    })
    .eq('id', contractId)

  await logEvent({
    contractId,
    eventType: 'contract_finalized',
    metadata: {
      verificationId,
      signerCount: snapshots.length,
      sha256Hash: pdfResult.sha256Hash,
    },
  })

  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify/${verificationId}`

  const finalizedAtStr =
    finalizedAt.toLocaleString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
    }) + ' UTC'

  try {
    const { data: ownerAuth } = await admin.auth.admin.getUserById(
      contract.owner_id
    )

    if (ownerAuth?.user?.email) {
      const { data: ownerProfile } = await admin
        .from('profiles')
        .select('full_name')
        .eq('id', contract.owner_id)
        .single()

      const { subject, html } = buildCompletionEmail({
        recipientName: ownerProfile?.full_name ?? 'Utilizador',
        contractTitle: contract.title,
        verificationId,
        verificationKey: rawKey,
        verificationUrl,
        isSender: true,
        signerCount: snapshots.length,
        finalizedAt: finalizedAtStr,
      })

      await sendEmail({
        to: ownerAuth.user.email,
        subject,
        html,
      })
    }

    for (const s of snapshots) {
      if (!s.email) continue

      const { subject, html } = buildCompletionEmail({
        recipientName: s.name,
        contractTitle: contract.title,
        verificationId,
        verificationKey: rawKey,
        verificationUrl,
        isSender: false,
        signerCount: snapshots.length,
        finalizedAt: finalizedAtStr,
      })

      await sendEmail({
        to: s.email,
        subject,
        html,
      })
    }
  } catch (err) {
    console.error('[finalize] Email error (non-fatal):', err)
  }

  return NextResponse.json({
    verificationId,
    verificationKey: rawKey,
    sha256Hash: pdfResult.sha256Hash,
    verificationUrl,
  })
}