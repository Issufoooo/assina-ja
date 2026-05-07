import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ExternalLink } from 'lucide-react'
import { createServerClient } from '@/lib/supabase/server'
import { ContractStatusBadge } from '@/components/ui/Badge'
import { TopBar } from '@/components/layout/TopBar'
import { AuditEventItem } from '@/components/contracts/AuditEventItem'
import { SignerListItem } from '@/components/contracts/SignerListItem'
import { ContractDetailClient } from './ContractDetailClient'
import { formatDate } from '@/lib/utils'
import type { Signer } from '@/types/signer'
import type { AuditEvent } from '@/types/audit'
import type { EventType } from '@/types/database'

export const metadata: Metadata = { title: 'Contrato' }

export default async function ContractDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: contract, error } = await supabase.from('contracts').select('*').eq('id', params.id).eq('owner_id', user.id).single()
  if (error || !contract) notFound()

  const { data: signerRows } = await supabase.from('contract_signers').select('*').eq('contract_id', params.id).order('created_at', { ascending: true })
  const { data: eventRows }  = await supabase.from('contract_events').select('*').eq('contract_id', params.id).order('created_at', { ascending: true })

  let finalizedDoc = null
  if (contract.status === 'completed') {
    const { data: fd } = await supabase.from('finalized_documents').select('verification_id,sha256_hash,finalized_at,document_access_mode').eq('contract_id', params.id).single()
    finalizedDoc = fd
  }

  const signerMap = new Map((signerRows ?? []).map(s => [s.id, s.full_name]))
  const signers: Signer[] = (signerRows ?? []).map(s => ({ id:s.id, contractId:params.id, fullName:s.full_name, email:s.email, phone:s.phone, signingToken:s.signing_token, status:s.status, signatureType:s.signature_type, viewedAt:s.viewed_at?new Date(s.viewed_at):null, otpVerifiedAt:s.otp_verified_at?new Date(s.otp_verified_at):null, documentReadAt:s.document_read_at?new Date(s.document_read_at):null, signedAt:s.signed_at?new Date(s.signed_at):null, createdAt:new Date(s.created_at) }))
  const events: AuditEvent[] = (eventRows ?? []).map(e => ({ id:e.id, contractId:params.id, signerId:e.signer_id, signerName:e.signer_id?signerMap.get(e.signer_id):undefined, eventType:e.event_type as EventType, metadata:(e.metadata??{}) as Record<string,unknown>, ipAddress:e.ip_address, createdAt:new Date(e.created_at) }))

  const signedCount  = signers.filter(s => s.status === 'signed').length
  const appUrl       = process.env.NEXT_PUBLIC_APP_URL ?? ''

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar title={contract.title} showBack />
      <main className="flex-1 w-full max-w-[480px] mx-auto px-5 pt-2 pb-10 flex flex-col gap-6">
        {/* Header */}
        <section>
          <div className="flex items-start justify-between gap-3 mb-2">
            <h1 className="font-display text-xl font-bold text-ink-primary leading-snug flex-1">{contract.title}</h1>
            <ContractStatusBadge status={contract.status} />
          </div>
          {contract.description && <p className="text-sm text-ink-secondary font-body">{contract.description}</p>}
          <div className="flex gap-5 mt-3">
            <div><p className="text-2xs text-ink-muted uppercase tracking-wider font-body">Criado</p><p className="text-xs text-ink-secondary font-body mt-0.5">{formatDate(contract.created_at)}</p></div>
            {contract.expires_at && <div><p className="text-2xs text-ink-muted uppercase tracking-wider font-body">Expira</p><p className="text-xs text-ink-secondary font-body mt-0.5">{formatDate(contract.expires_at)}</p></div>}
            <div><p className="text-2xs text-ink-muted uppercase tracking-wider font-body">Assinaturas</p><p className="text-xs text-ink-secondary font-body mt-0.5">{signedCount}/{signers.length}</p></div>
          </div>
        </section>

        {/* Finalized */}
        {contract.status === 'completed' && finalizedDoc && (
          <section className="rounded-2xl border border-success/20 p-4 flex flex-col gap-3" style={{ background:'rgba(0,196,140,0.06)' }}>
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-body font-bold text-success">Documento finalizado</p>
              <Link href={`/verify/${finalizedDoc.verification_id}`} target="_blank" className="flex items-center gap-1 text-xs text-success hover:underline">Verificar <ExternalLink size={12}/></Link>
            </div>
            <p className="text-2xs font-mono text-ink-secondary">{finalizedDoc.verification_id}</p>
            <p className="hash-display text-2xs break-all">{finalizedDoc.sha256_hash}</p>
            <ContractDetailClient contractId={contract.id} />
          </section>
        )}

        {/* Signers */}
        <section>
          <h2 className="font-display text-base font-bold text-ink-primary mb-3">Signatários</h2>
          <div className="rounded-2xl bg-surface shadow-sm border border-border divide-y divide-border-subtle">
            {signers.map(signer => <div key={signer.id} className="px-4"><SignerListItem signer={signer} appUrl={appUrl} /></div>)}
          </div>
        </section>

        {/* Audit */}
        <section>
          <h2 className="font-display text-base font-bold text-ink-primary mb-4">Histórico</h2>
          <div className="pl-1">
            {events.map((event, i) => <AuditEventItem key={event.id} event={event} isLast={i === events.length-1} />)}
          </div>
        </section>
      </main>
    </div>
  )
}
