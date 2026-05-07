'use client'
import { useEffect, useRef, useCallback, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { slideUpVariants, fadeVariants } from '@/lib/motion'

export interface SheetProps {
  open: boolean; onClose: () => void; title?: string; description?: string
  showHandle?: boolean; maxHeight?: string; className?: string; children?: ReactNode
}

export function Sheet({ open, onClose, title, description, showHandle = true, maxHeight = '85vh', className, children }: SheetProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const panelRef   = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])
  const handleBackdrop = useCallback((e: React.MouseEvent<HTMLDivElement>) => { if (e.target === overlayRef.current) onClose() }, [onClose])
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="sheet-bd" variants={fadeVariants} initial="initial" animate="animate" exit="exit" className="fixed inset-0 z-50 bg-obsidian/15 backdrop-blur-sm" aria-hidden="true" />
          <div ref={overlayRef} onClick={handleBackdrop} className="fixed inset-0 z-50 flex items-end" role="dialog" aria-modal="true" aria-label={title}>
            <motion.div ref={panelRef} key="sheet-panel" variants={slideUpVariants} initial="initial" animate="animate" exit="exit" style={{ maxHeight }}
              className={cn('w-full flex flex-col bg-surface border-t border-border rounded-t-3xl overflow-hidden shadow-2xl', className)}>
              {showHandle && <div className="flex justify-center pt-3 pb-1 shrink-0" aria-hidden="true"><div className="w-10 h-1 rounded-full bg-border" /></div>}
              {(title || description) && (
                <div className="px-5 pt-4 pb-4 border-b border-border-subtle shrink-0">
                  {title && <h2 className="font-display text-lg font-bold text-ink-primary leading-tight">{title}</h2>}
                  {description && <p className="text-sm text-ink-secondary font-body mt-1">{description}</p>}
                </div>
              )}
              <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 pb-safe">{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
export function SheetActions({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('flex flex-col gap-2 pt-4 mt-2 border-t border-border-subtle', className)}>{children}</div>
}
