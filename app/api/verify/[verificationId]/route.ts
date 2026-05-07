import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { truncateHash } from '@/types/api'
import type { Json } from '@/types/database'

function toPublicSigner(
  value: Json
): { name: string; signedAt: string } | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>

  if (
    typeof record.name !== 'string' ||
    typeof record.signedAt !== 'string'
  ) {
    return null
  }

  return {
    name: record.name,
    signedAt: record.signedAt,
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { verificationId: string } }
): Promise<NextResponse> {
  const { verificationId } = params

  if (!/^ASJA-\d{4}-[A-Z0-9]{6}$/i.test(verificationId)) {
    return NextResponse.json({ state: 'not_found' }, { status: 200 })
  }

  const admin = createAdminClient()

  try {
    const { data: rows, error } = await admin.rpc('fn_get_verification_data', {
      p_verification_id: verificationId.toUpperCase(),
    })

    if (error) {
      return NextResponse.json({
        state: 'inconclusive',
        reason: 'Erro ao consultar base de dados',
      })
    }

    if (!rows || rows.length === 0) {
      return NextResponse.json({ state: 'not_found' })
    }

    const row = rows[0]!

    if (row.revoked_at) {
      return NextResponse.json({
        state: 'revoked',
        verificationId: row.verification_id,
        contractTitle: row.contract_title,
        revokedAt: row.revoked_at,
      })
    }

    if (!row.is_publicly_verifiable) {
      return NextResponse.json({ state: 'not_found' })
    }

    if (
      !row.sha256_hash ||
      row.sha256_hash.length !== 64 ||
      !row.finalized_at ||
      !row.contract_title ||
      !Array.isArray(row.signed_by)
    ) {
      return NextResponse.json({
        state: 'inconclusive',
        reason: 'Registo incompleto',
      })
    }

    let publicSigners: Array<{ name: string; signedAt: string }> = []

    try {
      publicSigners = (row.signed_by as Json[])
        .map(toPublicSigner)
        .filter(
          (value): value is { name: string; signedAt: string } => value !== null
        )
    } catch {
      return NextResponse.json({
        state: 'inconclusive',
        reason: 'Dados inválidos',
      })
    }

    return NextResponse.json({
      state: 'valid',
      verificationId: row.verification_id,
      contractTitle: row.contract_title,
      finalizedAt: row.finalized_at,
      signerCount: row.signer_count,
      sha256HashFull: row.sha256_hash,
      sha256HashShort: truncateHash(row.sha256_hash, 16),
      signers: publicSigners,
      documentAccessMode: row.document_access_mode,
    })
  } catch (err) {
    console.error('[verify]', err)
    return NextResponse.json({
      state: 'inconclusive',
      reason: 'Erro inesperado',
    })
  }
}