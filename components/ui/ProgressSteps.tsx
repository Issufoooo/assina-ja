'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { springSmooth } from '@/lib/motion'

export interface ProgressStepsProps {
  currentStep: number
  totalSteps:  number
  mode?:       'bar' | 'dots'
  labels?:     string[]
  className?:  string
}

function ProgressBar({ currentStep, totalSteps, className }: { currentStep: number; totalSteps: number; className?: string }) {
  const progress = (currentStep + 1) / totalSteps
  return (
    <div
      role="progressbar"
      aria-valuenow={currentStep + 1}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-label={`Passo ${currentStep + 1} de ${totalSteps}`}
      className={cn('relative h-1 w-full bg-primary-dim overflow-hidden', className)}
    >
      <motion.div
        className="absolute inset-y-0 left-0 w-full origin-left"
        style={{
          background: 'linear-gradient(90deg, #0033FF, #977DFF)',
          transformOrigin: 'left',
        }}
        animate={{ scaleX: progress }}
        initial={{ scaleX: 0 }}
        transition={springSmooth}
      />
    </div>
  )
}

function ProgressDots({ currentStep, totalSteps, labels, className }: { currentStep: number; totalSteps: number; labels?: string[]; className?: string }) {
  return (
    <div role="list" aria-label="Passos" className={cn('flex items-start justify-between w-full', className)}>
      {Array.from({ length: totalSteps }).map((_, i) => {
        const isCompleted = i < currentStep
        const isActive    = i === currentStep
        const isUpcoming  = i > currentStep
        const label       = labels?.[i]
        const isLast      = i === totalSteps - 1
        return (
          <div key={i} role="listitem" className={cn('flex flex-col items-center gap-2 relative', !isLast && 'flex-1')}>
            {!isLast && (
              <div className="absolute top-3.5 left-1/2 w-full h-px overflow-hidden bg-border">
                <motion.div
                  className="absolute inset-y-0 left-0 w-full origin-left"
                  style={{ background: 'linear-gradient(90deg, #0033FF, #977DFF)', transformOrigin: 'left' }}
                  animate={{ scaleX: isCompleted ? 1 : 0 }}
                  transition={springSmooth}
                />
              </div>
            )}
            <motion.div
              animate={isActive ? { scale: 1.1 } : { scale: 1 }}
              transition={springSmooth}
              className={cn(
                'relative z-10 w-7 h-7 rounded-full flex items-center justify-center',
                'border-2 transition-all duration-300',
                isCompleted && 'border-primary bg-gradient-primary',
                isActive    && 'border-primary bg-white shadow-glow-blue',
                isUpcoming  && 'border-border bg-surface',
              )}
              aria-current={isActive ? 'step' : undefined}
            >
              {isCompleted
                ? <Check size={12} strokeWidth={3} className="text-white" aria-hidden="true" />
                : <span className={cn('text-2xs font-display font-bold leading-none', isActive ? 'text-primary' : 'text-ink-muted')} aria-hidden="true">{i + 1}</span>
              }
            </motion.div>
            {label && (
              <span className={cn('text-2xs font-body text-center leading-tight max-w-[56px]', isCompleted ? 'text-ink-secondary' : isActive ? 'text-ink-primary font-semibold' : 'text-ink-muted')}>
                {label}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

export function ProgressSteps({ currentStep, totalSteps, mode = 'bar', labels, className }: ProgressStepsProps) {
  if (mode === 'bar') return <ProgressBar currentStep={currentStep} totalSteps={totalSteps} className={className} />
  return <ProgressDots currentStep={currentStep} totalSteps={totalSteps} labels={labels} className={className} />
}
