'use client'
import { useEffect, useRef, useCallback, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fadeVariants, springSmooth } from '@/lib/motion'
import { Button } from './Button'

export interface ModalProps {
  open: boolean; onClose: () => void; title?: string; description?: string
  hideClose?: boolean; maxWidth?: 'sm' | 'md' | 'lg'; className?: string; children?: ReactNode
}

export function Modal({ open, onClose, title, description, hideClose = false, maxWidth = 'md', className, children }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
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
  const mw = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' }[maxWidth]
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="bd" variants={fadeVariants} initial="initial" animate="animate" exit="exit" className="fixed inset-0 z-50 bg-obsidian/20 backdrop-blur-sm" aria-hidden="true" />
          <div ref={overlayRef} onClick={handleBackdrop} className="fixed inset-0 z-50 flex items-center justify-center px-4" role="dialog" aria-modal="true">
            <motion.div key="panel" initial={{ scale: 0.95, opacity: 0, y: 8 }} animate={{ scale: 1, opacity: 1, y: 0, transition: springSmooth }} exit={{ scale: 0.97, opacity: 0, y: 4, transition: { duration: 0.15 } }}
              className={cn('relative w-full rounded-2xl bg-surface border border-border shadow-2xl flex flex-col', mw, className)}>
              {(title || !hideClose) && (
                <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-4 border-b border-border-subtle">
                  <div className="flex flex-col gap-1">
                    {title && <h2 className="font-display text-lg font-bold text-ink-primary leading-tight">{title}</h2>}
                    {description && <p className="text-sm text-ink-secondary font-body">{description}</p>}
                  </div>
                  {!hideClose && (
                    <button onClick={onClose} aria-label="Fechar" className="p-1.5 rounded-lg text-ink-muted hover:text-ink-primary hover:bg-surface-dark transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
                      <X size={18} strokeWidth={2} />
                    </button>
                  )}
                </div>
              )}
              <div className="px-5 py-4">{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

export function AlertModal({ open, onClose, onConfirm, title, description, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', destructive = false, loading = false }:
  { open: boolean; onClose: () => void; onConfirm: () => void; title: string; description: string; confirmLabel?: string; cancelLabel?: string; destructive?: boolean; loading?: boolean }) {
  return (
    <Modal open={open} onClose={onClose} title={title} description={description} maxWidth="sm" hideClose>
      <div className="flex flex-col gap-3 pt-1">
        <Button variant={destructive ? 'danger' : 'primary'} fullWidth loading={loading} onClick={onConfirm}>{confirmLabel}</Button>
        <Button variant="ghost" fullWidth disabled={loading} onClick={onClose}>{cancelLabel}</Button>
      </div>
    </Modal>
  )
}
