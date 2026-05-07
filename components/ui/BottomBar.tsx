'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { fadeVariants } from '@/lib/motion'

export interface BottomBarProps {
  primary:    React.ReactNode
  secondary?: React.ReactNode
  topSlot?:   React.ReactNode
  className?: string
}

export function BottomBar({ primary, secondary, topSlot, className }: BottomBarProps) {
  return (
    <motion.div
      variants={fadeVariants}
      initial="initial"
      animate="animate"
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40',
        'glass-heavy border-t border-white/60',
        'shadow-[0_-1px_0_rgba(0,51,255,0.08),0_-8px_32px_rgba(0,3,61,0.06)]',
        'px-5 pt-3 pb-safe',
        className
      )}
    >
      {topSlot && <div className="mb-3">{topSlot}</div>}
      <div className="flex flex-col gap-2">
        <div className="w-full">{primary}</div>
        {secondary && <div className="flex justify-center">{secondary}</div>}
      </div>
    </motion.div>
  )
}

export function BottomBarSpacer({ className }: { className?: string }) {
  return (
    <div
      className={cn('h-[calc(88px+env(safe-area-inset-bottom,0px))]', className)}
      aria-hidden="true"
    />
  )
}
