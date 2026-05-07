'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, PenLine, Type } from 'lucide-react'
import SignatureCanvas from 'react-signature-canvas'
import { cn } from '@/lib/utils'
import { fadeVariants, tapScale, springFast } from '@/lib/motion'
import type { SignatureType } from '@/types/database'

type SignaturePadProps = {
  onSignature: (data: string, type: SignatureType) => void
  disabled?: boolean
  signerName?: string
}

export function SignaturePad({
  onSignature,
  disabled = false,
  signerName = '',
}: SignaturePadProps) {
  const [tab, setTab] = useState<'draw' | 'type'>('draw')
  const [typedName, setTypedName] = useState(signerName)
  const [hasDrawn, setHasDrawn] = useState(false)

  const canvasRef = useRef<SignatureCanvas | null>(null)

  const notify = useCallback(() => {
    if (tab === 'draw') {
      if (!canvasRef.current || canvasRef.current.isEmpty()) {
        onSignature('', 'drawn')
        return
      }

      onSignature(canvasRef.current.toDataURL('image/png'), 'drawn')
      return
    }

    onSignature(typedName.trim(), 'typed')
  }, [tab, typedName, onSignature])

  useEffect(() => {
    notify()
  }, [notify])

  const handleDrawEnd = () => {
    const isCanvasEmpty = canvasRef.current?.isEmpty() ?? true
    setHasDrawn(!isCanvasEmpty)

    if (isCanvasEmpty) {
      onSignature('', 'drawn')
      return
    }

    const dataUrl = canvasRef.current?.toDataURL('image/png') ?? ''
    onSignature(dataUrl, 'drawn')
  }

  const clearCanvas = () => {
    canvasRef.current?.clear()
    setHasDrawn(false)
    onSignature('', 'drawn')
  }

  const handleTabChange = (nextTab: 'draw' | 'type') => {
    setTab(nextTab)

    if (nextTab === 'type') {
      onSignature(typedName.trim(), 'typed')
    }

    if (nextTab === 'draw') {
      const isCanvasEmpty = canvasRef.current?.isEmpty() ?? true
      onSignature(
        isCanvasEmpty ? '' : canvasRef.current?.toDataURL('image/png') ?? '',
        'drawn'
      )
    }
  }

  return (
    <div
      className={cn(
        'w-full flex flex-col gap-4',
        disabled && 'opacity-50 pointer-events-none'
      )}
    >
      <div
        className="grid grid-cols-2 gap-1 rounded-2xl border border-white/50 bg-white/50 p-1 shadow-sm backdrop-blur-xl"
        role="tablist"
        aria-label="Tipo de assinatura"
      >
        <motion.button
          type="button"
          whileTap={tapScale}
          transition={springFast}
          role="tab"
          aria-selected={tab === 'draw'}
          onClick={() => handleTabChange('draw')}
          className={cn(
            'flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200',
            tab === 'draw'
              ? 'text-white shadow-[0_10px_24px_rgba(0,51,255,0.22)]'
              : 'text-ink-secondary hover:bg-white/60 hover:text-ink-primary'
          )}
          style={
            tab === 'draw'
              ? { background: 'linear-gradient(135deg,#0033FF,#977DFF)' }
              : undefined
          }
        >
          <PenLine size={15} />
          Manuscrita
        </motion.button>

        <motion.button
          type="button"
          whileTap={tapScale}
          transition={springFast}
          role="tab"
          aria-selected={tab === 'type'}
          onClick={() => handleTabChange('type')}
          className={cn(
            'flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200',
            tab === 'type'
              ? 'text-white shadow-[0_10px_24px_rgba(0,51,255,0.22)]'
              : 'text-ink-secondary hover:bg-white/60 hover:text-ink-primary'
          )}
          style={
            tab === 'type'
              ? { background: 'linear-gradient(135deg,#0033FF,#977DFF)' }
              : undefined
          }
        >
          <Type size={15} />
          Digitada
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        {tab === 'draw' ? (
          <motion.div
            key="draw"
            variants={fadeVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            role="tabpanel"
            className="relative"
          >
            <div className="relative overflow-hidden rounded-[24px] border border-white/60 bg-white/55 p-2 shadow-[0_24px_60px_rgba(0,20,80,0.12),inset_0_1px_0_rgba(255,255,255,0.75)] backdrop-blur-2xl">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/70 to-transparent" />

              <AnimatePresence>
                {!hasDrawn && (
                  <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.25 } }}
                    className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <p className="rounded-full border border-white/60 bg-white/70 px-4 py-2 text-sm font-medium text-ink-muted shadow-sm backdrop-blur-xl">
                      Assine aqui com o dedo
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div
                className="relative overflow-hidden rounded-[18px] border border-white/60 bg-[rgba(255,255,255,0.72)] shadow-inner"
                style={{ backgroundColor: 'var(--signature-bg)' }}
              >
                <SignatureCanvas
                  ref={canvasRef}
                  canvasProps={{
                    className: 'signature-canvas',
                    style: {
                      width: '100%',
                      height: 190,
                      display: 'block',
                    },
                    'aria-label': 'Área de assinatura',
                  }}
                  penColor="var(--signature-ink)"
                  minWidth={1.5}
                  maxWidth={3}
                  velocityFilterWeight={0.7}
                  onEnd={handleDrawEnd}
                />
              </div>
            </div>

            {hasDrawn && (
              <motion.div
                initial={{ opacity: 0, y: -2 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 flex justify-end"
              >
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-ink-muted transition-colors hover:bg-white/60 hover:text-ink-primary"
                  aria-label="Limpar assinatura"
                >
                  <RotateCcw size={12} />
                  Limpar
                </button>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="type"
            variants={fadeVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            role="tabpanel"
            className="flex flex-col gap-3"
          >
            <input
              type="text"
              value={typedName}
              onChange={(event) => {
                const value = event.target.value
                setTypedName(value)
                onSignature(value.trim(), 'typed')
              }}
              placeholder="Escreva o seu nome"
              autoCapitalize="words"
              className="h-13 w-full rounded-2xl border border-white/60 bg-white/70 px-4 text-base font-medium text-ink-primary shadow-sm outline-none backdrop-blur-xl transition-all duration-200 placeholder:text-ink-ghost focus:border-primary/30 focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,51,255,0.12)]"
            />

            {typedName.trim().length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-[24px] border border-white/60 bg-white/55 p-5 text-center shadow-[0_20px_50px_rgba(0,20,80,0.10),inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-2xl"
              >
                <p
                  className="font-display font-bold leading-none text-primary"
                  style={{ fontSize: 34, fontStyle: 'italic' }}
                >
                  {typedName}
                </p>

                <div
                  className="h-px w-48"
                  style={{
                    background:
                      'linear-gradient(90deg,transparent,#0033FF,#977DFF,transparent)',
                  }}
                  aria-hidden="true"
                />

                <p className="text-2xs text-ink-muted">
                  Assinatura digitada
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}