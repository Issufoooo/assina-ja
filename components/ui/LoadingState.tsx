'use client'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { fadeVariants } from '@/lib/motion'

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('skeleton', className)} />
}
export function Spinner({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cn('animate-spin-slow text-current', className)}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}
export function ContractCardSkeleton() {
  return (
    <div aria-hidden="true" className="rounded-2xl bg-surface shadow-sm border border-border p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2 flex-1"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="flex items-center gap-2"><Skeleton className="h-7 w-7 rounded-full" /><Skeleton className="h-7 w-7 rounded-full" /><Skeleton className="h-3 w-16" /></div>
      <div className="border-t border-border-subtle pt-3 flex items-center justify-between"><Skeleton className="h-3 w-24" /><Skeleton className="h-3 w-16" /></div>
    </div>
  )
}
export function ContractListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <motion.div variants={fadeVariants} initial="initial" animate="animate" className="flex flex-col gap-3" aria-label="A carregar…" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => <ContractCardSkeleton key={i} />)}
    </motion.div>
  )
}
export function PageLoadingState({ label }: { label?: string }) {
  return (
    <div className="min-h-screen flex flex-col bg-background" role="status" aria-label={label ?? 'A carregar…'} aria-live="polite">
      <div className="fixed top-0 left-0 right-0 h-1 bg-primary-dim overflow-hidden z-50">
        <motion.div className="h-full" style={{ background: 'linear-gradient(90deg,#0033FF,#977DFF)' }}
          initial={{ x: '-100%' }} animate={{ x: '60%' }}
          transition={{ duration: 1.6, ease: 'easeInOut', repeat: Infinity, repeatType: 'mirror' }} />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#0033FF,#977DFF)' }}>
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M2.5 12L6 4.5L10 9.5L13 6.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="13" cy="6.5" r="1.5" fill="white"/></svg>
          </div>
          <span className="font-display text-lg font-bold text-ink-primary">AssinaJá</span>
        </div>
        {label && <p className="text-sm text-ink-muted font-body text-center">{label}</p>}
      </div>
    </div>
  )
}
