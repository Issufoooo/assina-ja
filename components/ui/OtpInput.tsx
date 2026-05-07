'use client'

import { useRef, useState, useCallback, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { shakeVariants, springFast } from '@/lib/motion'

export interface OtpInputProps {
  length?:     number
  value:       string
  onChange:    (value: string) => void
  onComplete?: (value: string) => void
  error?:      string
  disabled?:   boolean
  label?:      string
}

export function OtpInput({
  length = 6, value, onChange, onComplete,
  error, disabled = false, label,
}: OtpInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>(Array(length).fill(null))
  const labelId   = useId()
  const hasError  = Boolean(error)
  const [shaking, setShaking] = useState(false)

  const prevError = useRef<string | undefined>(undefined)
  if (error && error !== prevError.current) {
    prevError.current = error
    setShaking(true)
  }
  if (!error && prevError.current) prevError.current = undefined

  const focusBox = useCallback((index: number) => {
    const el = inputRefs.current[index]
    if (el) { el.focus(); el.setSelectionRange(1, 1) }
  }, [])

  const handleChange = useCallback((index: number, rawValue: string) => {
    const digit = rawValue.replace(/\D/g, '').slice(-1)
    const chars = value.split('')
    chars[index] = digit
    const next = chars.join('').slice(0, length)
    onChange(next)
    if (digit && index < length - 1) focusBox(index + 1)
    if (next.length === length) onComplete?.(next)
  }, [value, length, onChange, onComplete, focusBox])

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const chars = value.split('')
      if (chars[index]) { chars[index] = ''; onChange(chars.join('')) }
      else if (index > 0) { chars[index - 1] = ''; onChange(chars.join('')); focusBox(index - 1) }
    }
    if (e.key === 'ArrowLeft'  && index > 0)          focusBox(index - 1)
    if (e.key === 'ArrowRight' && index < length - 1) focusBox(index + 1)
  }, [value, length, onChange, focusBox])

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (!pasted) return
    onChange(pasted)
    focusBox(Math.min(pasted.length, length - 1))
    if (pasted.length === length) onComplete?.(pasted)
  }, [length, onChange, onComplete, focusBox])

  const chars     = value.split('')
  const isSuccess = value.length === length && !hasError

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {label && <span id={labelId} className="sr-only">{label}</span>}

      <motion.div
        className="flex gap-2 justify-center"
        variants={shakeVariants}
        animate={shaking ? 'shake' : 'idle'}
        onAnimationComplete={() => setShaking(false)}
        role="group"
        aria-labelledby={label ? labelId : undefined}
        aria-label={label ? undefined : 'Código de verificação'}
      >
        {Array.from({ length }).map((_, i) => {
          const char       = chars[i] ?? ''
          const isFilled   = char !== ''
          const isActive   = !disabled && value.length === i
          const boxSuccess = isSuccess && isFilled

          return (
            <motion.div
              key={i}
              animate={boxSuccess ? { scale: [1, 1.08, 1] } : {}}
              transition={{ duration: 0.25, delay: i * 0.04 }}
            >
              <input
                ref={(el) => { inputRefs.current[i] = el }}
                data-otp
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={char}
                disabled={disabled}
                aria-label={`Dígito ${i + 1} de ${length}`}
                aria-invalid={hasError}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                onFocus={(e) => e.target.select()}
                className={cn(
                  // Base
                  'w-12 h-16 rounded-2xl',
                  'text-center text-2xl font-display font-bold',
                  'border-2 transition-all duration-200 outline-none',
                  'caret-transparent select-none',
                  // Default
                  'bg-surface border-border text-ink-primary shadow-xs',
                  // Active (current input position)
                  isActive && 'border-primary/40 shadow-input bg-white scale-105',
                  // Filled
                  isFilled && !isActive && !boxSuccess && !hasError && 'border-primary/20 bg-primary-dim text-primary',
                  // Error
                  hasError && isFilled  && 'border-danger/40 text-danger bg-danger-dim',
                  hasError && !isFilled && 'border-danger/20',
                  // Success
                  boxSuccess && 'border-success/40 bg-success-dim text-success shadow-glow-success',
                  // Disabled
                  disabled && 'opacity-40 cursor-not-allowed',
                )}
              />
            </motion.div>
          )
        })}
      </motion.div>

      <AnimatePresence mode="wait">
        {hasError && (
          <motion.p
            key="otp-error"
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0, transition: springFast }}
            exit={{ opacity: 0, y: -4 }}
            className="text-sm text-danger text-center font-body font-medium"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
