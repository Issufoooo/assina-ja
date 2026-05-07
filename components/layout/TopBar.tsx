'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CreditCard, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fadeVariants, tapScale, springFast } from '@/lib/motion'
import { Avatar } from '@/components/ui/Avatar'
import { createClient } from '@/lib/supabase/client'

export interface TopBarProps {
  title?: string
  showBack?: boolean
  onBack?: () => void
  userName?: string
  hideUserMenu?: boolean
  className?: string
  trialDaysLeft?: number | null
}

function BrandMark() {
  return (
    <Link href="/dashboard" className="flex min-w-0 items-center gap-3">
      <div className="glass-soft grid h-12 w-12 shrink-0 place-items-center rounded-full">
        <Image
          src="/brand/assinaja-mark.png"
          alt="AssinaJá"
          width={42}
          height={26}
          className="logo-mark object-contain"
          priority
        />
      </div>
      <div className="min-w-0">
        <p className="font-display text-[16px] font-extrabold leading-none tracking-tight text-ink-primary">
          AssinaJá
        </p>
        <p className="mt-1 truncate text-[12px] font-semibold leading-none text-ink-muted">
          Assinatura digital premium
        </p>
      </div>
    </Link>
  )
}

function UserMenu({ userName, trialDaysLeft }: { userName: string; trialDaysLeft?: number | null }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    setOpen(false)
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="relative">
      <motion.button
        whileTap={tapScale}
        transition={springFast}
        onClick={() => setOpen((v) => !v)}
        aria-label="Menu de utilizador"
        aria-expanded={open}
        className="rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
      >
        <Avatar name={userName} size="sm" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-30" aria-hidden="true" onClick={() => setOpen(false)} />
            <motion.div
              key="menu"
              variants={fadeVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="glass-heavy absolute right-0 top-12 z-40 w-64 overflow-hidden rounded-[26px] py-1 shadow-xl"
              role="menu"
            >
              <div className="border-b border-white/45 px-4 py-3">
                <p className="truncate text-sm font-bold text-ink-primary">{userName}</p>
                {typeof trialDaysLeft === 'number' && trialDaysLeft >= 0 ? (
                  <p className="mt-1 text-xs font-medium text-ink-muted">
                    Trial restante: {trialDaysLeft} dia{trialDaysLeft === 1 ? '' : 's'}
                  </p>
                ) : null}
              </div>
              <Link
                href="/dashboard/billing"
                role="menuitem"
                className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-ink-secondary transition-colors hover:bg-white/55 hover:text-ink-primary"
              >
                <CreditCard size={15} aria-hidden="true" />
                Plano e faturação
              </Link>
              <button
                role="menuitem"
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-ink-secondary transition-colors hover:bg-white/55 hover:text-ink-primary"
              >
                <LogOut size={15} aria-hidden="true" />
                Terminar sessão
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export function TopBar({
  title,
  showBack = false,
  onBack,
  userName,
  hideUserMenu = false,
  className,
  trialDaysLeft,
}: TopBarProps) {
  const router = useRouter()

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-[76px] w-full items-center justify-between gap-3 px-5',
        'glass-heavy border-b border-white/65',
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        {showBack ? (
          <motion.button
            whileTap={tapScale}
            transition={springFast}
            onClick={() => (onBack ? onBack() : router.back())}
            aria-label="Voltar"
            className="-ml-1 flex h-11 w-11 items-center justify-center rounded-2xl text-ink-secondary transition-colors hover:bg-white/60 hover:text-ink-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          >
            <ArrowLeft size={19} strokeWidth={2} aria-hidden="true" />
          </motion.button>
        ) : (
          <BrandMark />
        )}
        {showBack && title && (
          <h1 className="truncate font-display text-[15px] font-extrabold text-ink-primary">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-3">
        {!hideUserMenu && typeof trialDaysLeft === 'number' && trialDaysLeft > 0 && trialDaysLeft <= 14 ? (
          <Link
            href="/dashboard/billing"
            className="hidden rounded-full border border-primary/15 bg-white/60 px-3 py-1.5 text-xs font-bold text-primary backdrop-blur-md sm:inline-flex"
          >
            Trial: {trialDaysLeft} dia{trialDaysLeft === 1 ? '' : 's'}
          </Link>
        ) : null}
        {!hideUserMenu && userName && <UserMenu userName={userName} trialDaysLeft={trialDaysLeft} />}
      </div>
    </header>
  )
}
