import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({ fileName: z.string().min(1).max(200), fileSizeBytes: z.number().int().min(1).max(10*1024*1024), mimeType: z.literal('application/pdf') })

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error:'Não autenticado', code:'unauthorized' }, { status:401 })

  let body: unknown
  try { body = await request.json() } catch { return NextResponse.json({ error:'Body inválido', code:'bad_request' }, { status:400 }) }
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error:'Dados inválidos', code:'bad_request' }, { status:422 })

  const storagePath = `${user.id}/${Date.now()}.pdf`
  const admin = createAdminClient()
  const { data, error: urlError } = await admin.storage.from('contracts-originals').createSignedUploadUrl(storagePath)
  if (urlError || !data) return NextResponse.json({ error:'Erro ao gerar URL', code:'server_error' }, { status:500 })

  return NextResponse.json({ uploadUrl: data.signedUrl, storagePath, expiresInSeconds:300 })
}
