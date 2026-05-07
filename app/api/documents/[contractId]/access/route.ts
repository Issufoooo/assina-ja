import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createServerClient, createAdminClient } from '@/lib/supabase/server'
import { rateLimiter, limits } from '@/lib/rate-limit'
import { z } from 'zod'

const schema = z.object({
  context: z.enum(['owner', 'verification_key']),
  key:     z.string().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { contractId: string } }
): Promise<NextResponse> {
  const { contractId } = params
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Body inválido', code: 'bad_request' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos', code: 'bad_request' }, { status: 422 })

  const { context, key } = parsed.data
  const admin = createAdminClient()

  const { data: doc } = await admin
    .from('finalized_documents')
    .select('storage_path,verification_key,verification_id,document_access_mode,revoked_at')
    .eq('contract_id', contractId)
    .single()

  if (!doc) return NextResponse.json({ error: 'Documento não encontrado', code: 'not_found' }, { status: 404 })
  if (doc.revoked_at) return NextResponse.json({ error: 'Este documento foi revogado', code: 'document_revoked' }, { status: 410 })

  if (context === 'owner') {
    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Não autenticado', code: 'unauthorized' }, { status: 401 })

    const { data: contract } = await admin.from('contracts').select('owner_id').eq('id', contractId).single()
    if (!contract || contract.owner_id !== user.id) return NextResponse.json({ error: 'Acesso negado', code: 'unauthorized' }, { status: 403 })

  } else {
    // verification_key context
    if (doc.document_access_mode === 'owner_only') {
      return NextResponse.json({ error: 'O acesso está restrito ao emissor', code: 'access_restricted' }, { status: 403 })
    }

    if (doc.document_access_mode !== 'public') {
      if (!key?.trim()) return NextResponse.json({ error: 'Chave de verificação obrigatória', code: 'invalid_key' }, { status: 400 })

      // Rate limit key attempts per verificationId
      const rl = await rateLimiter.check('key_verify', doc.verification_id, limits.keyVerify)
      if (!rl.allowed) {
        const mins = Math.ceil(rl.retryAfterMs / 60_000)
        return NextResponse.json({ error: `Demasiadas tentativas. Tente novamente em ${mins} minuto${mins === 1 ? '' : 's'}.`, code: 'rate_limited' }, { status: 429 })
      }

      // Also rate limit by IP
      const ipRl = await rateLimiter.check('key_verify_ip', ip, limits.documentAccess)
      if (!ipRl.allowed) return NextResponse.json({ error: 'Demasiados pedidos', code: 'rate_limited' }, { status: 429 })

      const isValid = await bcrypt.compare(key.trim(), doc.verification_key)
      if (!isValid) {
        return NextResponse.json({ error: 'Chave inválida. Verifique o email recebido.', code: 'invalid_key' }, { status: 403 })
      }

      // Reset rate limit on success
      await rateLimiter.reset('key_verify', doc.verification_id)
    }
  }

  // Generate 1-hour signed URL — storage path never exposed
  const TTL = 3600
  const { data: signedData, error: signErr } = await admin.storage
    .from('contracts-finalized')
    .createSignedUrl(doc.storage_path, TTL)

  if (signErr || !signedData?.signedUrl) {
    console.error('[documents/access] Signed URL error:', signErr?.message)
    return NextResponse.json({ error: 'Erro ao gerar URL de acesso', code: 'server_error' }, { status: 500 })
  }

  return NextResponse.json({
    signedUrl: signedData.signedUrl,
    expiresAt: new Date(Date.now() + TTL * 1000).toISOString(),
  })
}
