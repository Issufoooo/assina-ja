'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Route } from 'next'
import { motion } from 'framer-motion'
import { CreditCard, FileText, Plus, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { tapScale, springFast } from '@/lib/motion'

const NAV_ITEMS: {
  href: Route
  label: string
  Icon: typeof FileText
  exact: boolean
  primary: boolean
}[] = [
  { href: '/dashboard', label: 'Contratos', Icon: FileText, exact: true, primary: false },
  { href: '/dashboard/contracts/new', label: 'Novo', Icon: Plus, exact: false, primary: true },
  { href: '/dashboard/billing', label: 'Plano', Icon: CreditCard, exact: false, primary: false },
  { href: '/dashboard/account', label: 'Conta', Icon: User, exact: false, primary: false },
]

export function DashboardNav() {
  const pathname = usePathname()
  const isActive = (href: string, exact: boolean) => (exact ? pathname === href : pathname.startsWith(href))

  return (
    <nav aria-label="Navegação principal" className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-safe">
      <div className="glass-heavy mx-auto flex h-[74px] max-w-[520px] items-center justify-around rounded-[30px] px-2">
        {NAV_ITEMS.map(({ href, label, Icon, exact, primary }) => {
          const active = isActive(href, exact)

          if (primary) {
            return (
              <motion.div key={href} whileTap={tapScale} transition={springFast}>
                <Link
                  href={href}
                  aria-label={label}
                  className="brand-gradient brand-glow -mt-8 flex h-16 w-16 items-center justify-center rounded-[24px] text-white transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                >
                  <Icon size={26} strokeWidth={2.3} />
                </Link>
              </motion.div>
            )
          }

          return (
            <motion.div key={href} whileTap={tapScale} transition={springFast}>
              <Link
                href={href}
                aria-label={label}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex min-w-[54px] flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary',
                  active ? 'text-primary' : 'text-ink-muted hover:text-ink-secondary'
                )}
              >
                <div className="relative">
                  <Icon size={20} strokeWidth={active ? 2.3 : 1.9} />
                  {active && (
                    <motion.div
                      layoutId="nav-dot"
                      className="absolute -bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary"
                      transition={springFast}
                      aria-hidden="true"
                    />
                  )}
                </div>
                <span className={cn('text-2xs font-bold leading-none', active ? 'text-primary' : 'text-ink-muted')}>{label}</span>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </nav>
  )
}
