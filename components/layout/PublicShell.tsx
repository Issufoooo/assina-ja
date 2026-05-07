import { cn } from '@/lib/utils'
import { ProgressSteps } from '@/components/ui/ProgressSteps'

export interface PublicShellProps {
  currentStep?: number
  totalSteps?:  number
  hideBrand?:   boolean
  className?:   string
  children:     React.ReactNode
}

export function PublicShell({ currentStep, totalSteps, hideBrand = false, className, children }: PublicShellProps) {
  const showProgress = typeof currentStep === 'number' && typeof totalSteps === 'number'
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {showProgress && (
        <ProgressSteps mode="bar" currentStep={currentStep!} totalSteps={totalSteps!} className="fixed top-0 left-0 right-0 z-50" />
      )}
      {!hideBrand && (
        <header className={cn('w-full px-5 h-14 flex items-center glass-heavy border-b border-white/60', showProgress && 'mt-0.5')}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm" style={{ background: 'linear-gradient(135deg,#0033FF,#977DFF)' }} aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2.5 12L6 4.5L10 9.5L13 6.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="13" cy="6.5" r="1.5" fill="white"/>
              </svg>
            </div>
            <span className="font-display text-[15px] font-bold text-ink-primary tracking-tight">AssinaJá</span>
          </div>
        </header>
      )}
      <main className={cn('flex-1 flex flex-col w-full max-w-[480px] mx-auto px-5', className)}>
        {children}
      </main>
      {!hideBrand && (
        <footer className="w-full px-5 py-4 flex justify-center border-t border-border-subtle">
          <p className="text-2xs text-ink-muted font-body text-center">
            Documento protegido por <span className="text-ink-secondary font-semibold">AssinaJá</span> · Assinatura digital segura
          </p>
        </footer>
      )}
    </div>
  )
}
