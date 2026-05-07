import Link from 'next/link'
import { redirect } from 'next/navigation'
import { FileText, Plus } from 'lucide-react'
import type { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/server'
import type { ContractSummary } from '@/types/contract'
import { ContractListClient } from './ContractListClient'

export const metadata: Metadata = { title: 'Contratos' }

async function getContracts(userId: string): Promise<ContractSummary[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('contracts')
    .select('id, title, description, status, expires_at, created_at, contract_signers(status)')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false })

  if (error || !data) return []

  return data.map((row) => {
    const signers = row.contract_signers ?? []
    return {
      id: row.id,
      title: row.title,
      description: row.description ?? null,
      status: row.status,
      signerCount: signers.length,
      signedCount: signers.filter((s) => s.status === 'signed').length,
      expiresAt: row.expires_at ? new Date(row.expires_at) : null,
      createdAt: new Date(row.created_at),
    } satisfies ContractSummary
  })
}

function EmptyState() {
  return (
    <div className="glass rounded-[36px] px-7 py-16 text-center">
      <div className="glass-soft mx-auto grid h-16 w-16 place-items-center rounded-full">
        <FileText size={28} className="text-primary" />
      </div>
      <h2 className="mt-6 font-display text-2xl font-extrabold text-ink-primary">Nenhum contrato ainda</h2>
      <p className="mx-auto mt-3 max-w-xs text-sm font-medium leading-6 text-ink-secondary">
        Crie o seu primeiro contrato e convide os signatários em minutos.
      </p>
      <Link
        href="/dashboard/contracts/new"
        className="brand-gradient brand-glow mt-6 inline-flex h-12 items-center gap-2 rounded-2xl px-5 text-sm font-extrabold text-white transition-transform duration-200 hover:-translate-y-0.5"
      >
        <Plus size={16} /> Criar primeiro contrato
      </Link>
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const contracts = await getContracts(user.id)

  return (
    <div className="mx-auto w-full max-w-[540px] px-5 pb-6 pt-3">
      <div className="mb-7 flex items-end justify-between gap-5">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-primary/75">Painel</p>
          <h1 className="mt-2 font-display text-[34px] font-extrabold tracking-[-0.045em] text-ink-primary">Contratos</h1>
          <p className="mt-1 text-sm font-semibold text-ink-muted">
            {contracts.length} contrato{contracts.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/dashboard/contracts/new"
          aria-label="Criar novo contrato"
          className="brand-gradient brand-glow grid h-16 w-16 place-items-center rounded-[24px] text-white transition-transform duration-200 hover:-translate-y-0.5"
        >
          <Plus size={28} strokeWidth={2.4} />
        </Link>
      </div>
      {contracts.length === 0 ? <EmptyState /> : <ContractListClient contracts={contracts} />}
    </div>
  )
}
