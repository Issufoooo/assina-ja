'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { tapScaleCard, hoverLift, springFast } from '@/lib/motion'

type CardVariant = 'float' | 'raised' | 'flat' | 'glass' | 'ghost'

export interface CardProps {
  variant?:      CardVariant
  interactive?:  boolean
  className?:    string
  children?:     React.ReactNode
  onClick?:      React.MouseEventHandler<HTMLDivElement>
  role?:         string
  tabIndex?:     number
  'aria-label'?: string
}

const variantStyles: Record<CardVariant, string> = {
  float: [
    'glass border-white/65',
    'shadow-float',
  ].join(' '),
  raised: [
    'glass-soft border-white/70',
    'shadow-md',
  ].join(' '),
  flat: [
    'bg-white/78 backdrop-blur-md border border-white/75',
    'shadow-xs',
  ].join(' '),
  glass: [
    'glass border-white/60',
    'shadow-sm',
  ].join(' '),
  ghost: [
    'bg-transparent border border-white/50',
  ].join(' '),
}

export function Card({
  variant = 'float', interactive = false, className,
  children, onClick, role, tabIndex, 'aria-label': ariaLabel,
}: CardProps) {
  const interactiveProps = interactive
    ? { whileTap: tapScaleCard, whileHover: hoverLift, transition: springFast }
    : {}

  return (
    <motion.div
      role={role ?? (interactive ? 'button' : undefined)}
      tabIndex={tabIndex ?? (interactive ? 0 : undefined)}
      aria-label={ariaLabel}
      onClick={onClick}
      onKeyDown={interactive && onClick
        ? (e: React.KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onClick(e as unknown as React.MouseEvent<HTMLDivElement>)
            }
          }
        : undefined
      }
      className={cn(
        'relative rounded-[28px] p-5',
        variantStyles[variant],
        interactive && 'cursor-pointer select-none transition-[transform,box-shadow] duration-200',
        className
      )}
      {...interactiveProps}
    >
      {children}
    </motion.div>
  )
}

export function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('flex items-start justify-between gap-3 mb-4', className)}>{children}</div>
}

export function CardBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('flex flex-col gap-3', className)}>{children}</div>
}

export function CardFooter({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('flex items-center gap-3 mt-4 pt-4 border-t border-white/45', className)}>
      {children}
    </div>
  )
}

export function CardDivider({ className }: { className?: string }) {
  return <hr className={cn('border-0 border-t border-white/45 my-4', className)} />
}
