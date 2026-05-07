import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(_request: NextRequest, { params }: { params: { verificationId: string } }): Promise<NextResponse> {
  if (!/^ASJA-\d{4}-[A-Z0-9]{6}$/i.test(params.verificationId)) return NextResponse.json({ error:'Invalid ID' }, { status:404 })
  const admin = createAdminClient()
  const { data, error } = await admin.from('finalized_documents').select('contract_id,is_publicly_verifiable,revoked_at').eq('verification_id', params.verificationId.toUpperCase()).single()
  if (error || !data || !data.is_publicly_verifiable || data.revoked_at) return NextResponse.json({ error:'Not found' }, { status:404 })
  return NextResponse.json({ contractId: data.contract_id })
}
