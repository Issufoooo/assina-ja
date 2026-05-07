'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  successRingVariants, successCheckVariants,
  successTextVariants, fadeUpVariants, scaleInVariants, springGentle,
} from '@/lib/motion'

function AnimatedCheck({ size = 72 }: { size?: number }) {
  const iconSize = Math.round(size * 0.4)
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Outer glow ring */}
      <motion.div
        variants={successRingVariants}
        initial="initial"
        animate="animate"
        className="absolute inset-0 rounded-full"
        style={{ background: 'radial-gradient(ellipse at center, rgba(0,196,140,0.20) 0%, rgba(0,196,140,0.05) 60%, transparent 100%)' }}
        aria-hidden="true"
      />
      {/* Middle ring */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ ...springGentle, delay: 0.10 }}
        className="absolute rounded-full"
        style={{ inset: 8, background: 'rgba(0,196,140,0.14)', border: '1.5px solid rgba(0,196,140,0.25)' }}
        aria-hidden="true"
      />
      {/* Inner icon background */}
      <motion.div
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ ...springGentle, delay: 0.06 }}
        className="absolute rounded-full"
        style={{ inset: 16, background: 'rgba(0,196,140,0.22)' }}
        aria-hidden="true"
      />
      {/* SVG checkmark */}
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" aria-hidden="true" className="relative z-10">
        <motion.path
          d="M4.5 12.75l6 6 9-13.5"
          stroke="#00C48C"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={successCheckVariants}
          initial="initial"
          animate="animate"
          style={{ strokeDasharray: 100 }}
        />
      </svg>
    </div>
  )
}

export interface FullPageSuccessProps {
  title:            string
  description?:     string
  referenceId?:     string
  action?:          React.ReactNode
  secondaryAction?: React.ReactNode
  className?:       string
}

export function FullPageSuccess({ title, description, referenceId, action, secondaryAction, className }: FullPageSuccessProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center min-h-screen px-6 py-12 text-center bg-background', className)}
      role="status"
      aria-live="polite"
    >
      {/* Top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-48 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 100% at 50% 0%, rgba(0,196,140,0.10) 0%, transparent 100%)' }} aria-hidden="true" />

      <AnimatedCheck size={88} />

      <motion.div
        variants={successTextVariants}
        initial="initial"
        animate="animate"
        className="flex flex-col items-center gap-3 mt-8 relative z-10"
      >
        <h1 className="font-display text-2xl font-bold text-ink-primary">{title}</h1>
        {description && (
          <p className="text-base text-ink-secondary font-body max-w-xs leading-relaxed">{description}</p>
        )}
        {referenceId && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.58, duration: 0.28 }}
            className="mt-3 px-5 py-3 rounded-2xl bg-surface shadow-md border border-border"
          >
            <p className="text-2xs text-ink-muted font-body uppercase tracking-wider mb-1">Referência de verificação</p>
            <p className="font-mono text-sm text-primary font-bold tracking-widest">{referenceId}</p>
          </motion.div>
        )}
      </motion.div>

      {(action || secondaryAction) && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.68, duration: 0.30 }}
          className="flex flex-col items-center gap-3 mt-10 w-full max-w-xs relative z-10"
        >
          {action}
          {secondaryAction}
        </motion.div>
      )}
    </div>
  )
}

export function InlineSuccess({ title, description, className }: { title: string; description?: string; className?: string }) {
  return (
    <motion.div
      variants={fadeUpVariants}
      initial="initial"
      animate="animate"
      className={cn('flex flex-col items-center gap-3 py-6 px-4 text-center rounded-2xl bg-success-dim border border-success/20', className)}
      role="status"
      aria-live="polite"
    >
      <AnimatedCheck size={52} />
      <div className="flex flex-col gap-1">
        <p className="font-display text-base font-bold text-ink-primary">{title}</p>
        {description && <p className="text-sm text-ink-secondary font-body">{description}</p>}
      </div>
    </motion.div>
  )
}

export function CompactSuccess({ label, className }: { label: string; className?: string }) {
  return (
    <motion.div
      variants={scaleInVariants}
      initial="initial"
      animate="animate"
      className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-success-dim border border-success/20', className)}
      role="status"
      aria-live="polite"
    >
      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <motion.path d="M4.5 12.75l6 6 9-13.5" stroke="#00C48C" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" variants={successCheckVariants} initial="initial" animate="animate" style={{ strokeDasharray: 100 }} />
      </svg>
      <span className="text-xs font-body font-semibold text-success">{label}</span>
    </motion.div>
  )
}
