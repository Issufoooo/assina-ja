'use client'

import { motion } from 'framer-motion'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { tapScale, springFast } from '@/lib/motion'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type ButtonSize    = 'sm' | 'md' | 'lg'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   ButtonVariant
  size?:      ButtonSize
  loading?:   boolean
  fullWidth?: boolean
  iconLeft?:  React.ReactNode
  iconRight?: React.ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    'text-white border border-white/15',
    'bg-gradient-primary shadow-[0_16px_32px_rgba(0,51,255,0.28),inset_0_1px_0_rgba(255,255,255,0.28)]',
    'hover:shadow-[0_24px_45px_rgba(0,51,255,0.34),inset_0_1px_0_rgba(255,255,255,0.32)] hover:-translate-y-0.5',
    'focus-visible:ring-2 focus-visible:ring-primary-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:opacity-45 disabled:shadow-none disabled:translate-y-0',
  ].join(' '),

  secondary: [
    'glass-soft text-ink-primary',
    'border border-white/65 shadow-sm',
    'hover:shadow-md hover:-translate-y-0.5',
    'focus-visible:ring-2 focus-visible:ring-primary-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:opacity-40',
  ].join(' '),

  outline: [
    'bg-white/55 backdrop-blur-md text-primary',
    'border border-primary/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]',
    'hover:bg-white/72 hover:border-primary/30 hover:-translate-y-0.5',
    'focus-visible:ring-2 focus-visible:ring-primary-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:opacity-40',
  ].join(' '),

  ghost: [
    'bg-transparent text-ink-secondary',
    'hover:bg-white/50 hover:backdrop-blur-md hover:text-ink-primary',
    'focus-visible:ring-2 focus-visible:ring-primary-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:opacity-40',
  ].join(' '),

  danger: [
    'text-danger bg-white/60 backdrop-blur-md',
    'border border-danger/15',
    'hover:bg-danger/10 hover:border-danger/25',
    'focus-visible:ring-2 focus-visible:ring-danger/20 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:opacity-40',
  ].join(' '),
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-10 px-4 text-xs gap-1.5 rounded-xl',
  md: 'h-12 px-5 text-sm gap-2 rounded-[14px]',
  lg: 'h-14 px-6 text-base gap-2 rounded-[16px]',
}

function LoadingSpinner({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="animate-spin-slow" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary', size = 'md', loading = false,
      fullWidth = false, iconLeft, iconRight,
      disabled, className, children, ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    return (
      <motion.button
        ref={ref}
        whileTap={isDisabled ? undefined : tapScale}
        transition={springFast}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={loading}
        className={cn(
          'relative inline-flex items-center justify-center',
          'font-body font-semibold tracking-tight',
          'select-none cursor-pointer',
          'transition-all duration-200 ease-out outline-none',
          variantStyles[variant],
          sizeStyles[size],
          isDisabled && 'cursor-not-allowed',
          fullWidth && 'w-full',
          className
        )}
        {...(props as React.ComponentProps<typeof motion.button>)}
      >
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <LoadingSpinner size={size === 'sm' ? 14 : 16} />
          </span>
        )}
        <span className={cn('inline-flex items-center gap-[inherit]', loading && 'invisible')} aria-hidden={loading}>
          {iconLeft && <span className="shrink-0">{iconLeft}</span>}
          {children}
          {iconRight && <span className="shrink-0">{iconRight}</span>}
        </span>
      </motion.button>
    )
  }
)

Button.displayName = 'Button'
export { Button }
