'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check } from 'lucide-react'
import { cn, formatDateTime, getSignerContact } from '@/lib/utils'
import { tapScale, springFast } from '@/lib/motion'
import { Avatar } from '@/components/ui/Avatar'
import { SignerStatusBadge } from '@/components/ui/Badge'
import type { Signer } from '@/types/signer'

export function SignerListItem({ signer, appUrl='' }: { signer: Signer; appUrl?: string }) {
  const [copied, setCopied] = useState(false)
  const signingUrl = `${appUrl}/sign/${signer.signingToken}`
  const contact = getSignerContact(signer)
  const statusDesc = { pending:'Não abriu o link', viewed: signer.viewedAt ? `Viu em ${formatDateTime(signer.viewedAt)}` : 'Visualizado', otp_verified:'Identidade verificada', signed: signer.signedAt ? `Assinou em ${formatDateTime(signer.signedAt)}` : 'Assinado' }[signer.status]

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(signingUrl); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch {}
  }

  return (
    <div className="flex items-center gap-3 py-3">
      <Avatar name={signer.fullName} size="md"/>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-body font-semibold text-ink-primary truncate">{signer.fullName}</p>
        {contact && <p className="text-xs text-ink-muted truncate">{contact}</p>}
        <p className="text-xs text-ink-muted mt-0.5">{statusDesc}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <SignerStatusBadge status={signer.status} size="sm"/>
        {(signer.status === 'pending' || signer.status === 'viewed') && (
          <motion.button whileTap={tapScale} transition={springFast} onClick={copyLink} aria-label={copied ? 'Copiado' : 'Copiar link'}
            className={cn('p-1.5 rounded-lg transition-colors', copied ? 'text-success bg-success-dim' : 'text-ink-muted hover:text-ink-primary hover:bg-surface-dark')}>
            {copied ? <Check size={15}/> : <Copy size={15}/>}
          </motion.button>
        )}
      </div>
    </div>
  )
}
