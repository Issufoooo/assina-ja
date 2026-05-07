'use client'

import { forwardRef, useId } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helper?: string
  error?: string
  slotLeft?: React.ReactNode
  slotRight?: React.ReactNode
  hideLabel?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helper, error, slotLeft, slotRight, hideLabel = false, className, id: idProp, disabled, ...props }, ref) => {
    const generatedId = useId()
    const id = idProp ?? generatedId
    const errorId = `${id}-error`
    const helperId = `${id}-helper`
    const hasError = Boolean(error)
    const hasHelper = Boolean(helper) && !hasError

    return (
      <div className="flex w-full flex-col gap-2">
        {label && (
          <label
            htmlFor={id}
            className={cn(
              'text-xs font-extrabold tracking-wide transition-colors duration-150',
              hasError ? 'text-danger' : 'text-ink-secondary',
              hideLabel && 'sr-only'
            )}
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {slotLeft && <span className="pointer-events-none absolute left-4 flex items-center text-ink-muted" aria-hidden="true">{slotLeft}</span>}
          <input
            ref={ref}
            id={id}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : hasHelper ? helperId : undefined}
            className={cn(
              'h-13 w-full rounded-[20px] px-4 font-body text-base text-ink-primary placeholder:text-ink-ghost',
              'border border-white/75 bg-white/72 shadow-[0_12px_28px_rgba(0,20,80,0.07),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl',
              'outline-none transition-all duration-200',
              'focus:border-primary/25 focus:bg-white/86 focus:shadow-[0_0_0_4px_rgba(0,51,255,0.11),0_16px_32px_rgba(0,20,80,0.08),inset_0_1px_0_rgba(255,255,255,1)]',
              hasError && 'border-danger/45 focus:border-danger/45 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.12)] animate-shake',
              disabled && 'cursor-not-allowed opacity-50',
              slotLeft && 'pl-11',
              slotRight && 'pr-11',
              className
            )}
            {...props}
          />
          {slotRight && <span className="absolute right-4 flex items-center text-ink-muted">{slotRight}</span>}
        </div>

        {hasError && <p id={errorId} role="alert" className="pl-1 text-xs font-semibold leading-snug text-danger">{error}</p>}
        {hasHelper && <p id={helperId} className="pl-1 text-xs leading-snug text-ink-muted">{helper}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
export { Input }
