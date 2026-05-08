'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { formatRelativeDate } from '@/lib/utils'
import { listContainerVariants, listItemVariants } from '@/lib/motion'
import { ContractStatusBadge } from '@/components/ui/Badge'
import { AvatarGroup } from '@/components/ui/Avatar'
import type { ContractSummary } from '@/types/contract'

function ContractCard({ contract }: { contract: ContractSummary }) {
  const names = Array.from({ length: contract.signerCount }, (_, i) => `Signatário ${i + 1}`)

  return (
    <Link href={`/dashboard/contracts/${contract.id}`} className="block rounded-[28px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
      <motion.div
        whileTap={{ scale: 0.985 }}
        whileHover={{ y: -3 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="glass glass-interactive flex flex-col gap-4 rounded-[28px] p-5 sm:gap-5 sm:rounded-[32px] sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.17em] text-ink-ghost sm:text-[11px]">Contrato</p>
            <h2 className="truncate font-display text-base font-extrabold leading-snug text-ink-primary sm:text-lg">{contract.title}</h2>
            {contract.description && <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-ink-secondary">{contract.description}</p>}
          </div>
          <ContractStatusBadge status={contract.status} size="sm" />
        </div>

        {contract.signerCount > 0 && (
          <div className="glass-soft flex items-center gap-3 rounded-[22px] px-3.5 py-3 sm:gap-4 sm:rounded-[24px] sm:px-4">
            <AvatarGroup names={names} size="xs" max={4} />
            <span className="text-sm font-semibold text-ink-secondary">
              {contract.signedCount} de {contract.signerCount} assinado{contract.signerCount !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-white/50 pt-3 sm:pt-4">
          <span className="text-sm font-semibold text-ink-muted">{formatRelativeDate(contract.createdAt)}</span>
          <div className="glass-soft grid h-8 w-8 place-items-center rounded-full sm:h-9 sm:w-9">
            <ChevronRight size={16} className="text-primary" />
          </div>
        </div>
      </motion.div>
    </Link>
  )
}

export function ContractListClient({ contracts }: { contracts: ContractSummary[] }) {
  return (
    <motion.div variants={listContainerVariants} initial="initial" animate="animate" className="flex flex-col gap-3.5 sm:gap-4">
      {contracts.map((c) => (
        <motion.div key={c.id} variants={listItemVariants}>
          <ContractCard contract={c} />
        </motion.div>
      ))}
    </motion.div>
  )
}
