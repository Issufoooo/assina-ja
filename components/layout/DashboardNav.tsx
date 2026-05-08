'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Route } from 'next'
import { motion } from 'framer-motion'
import { CreditCard, FileText, Plus, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { springFast, tapScale } from '@/lib/motion'

const SIDE_ITEMS: {
  href: Route
  label: string
  Icon: typeof FileText
  exact: boolean
}[] = [
  { href: '/dashboard', label: 'Contratos', Icon: FileText, exact: true },
  { href: '/dashboard/billing', label: 'Plano', Icon: CreditCard, exact: false },
  { href: '/dashboard/account', label: 'Conta', Icon: User, exact: false },
]

export function DashboardNav() {
  const pathname = usePathname()
  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[calc(env(safe-area-inset-bottom,0px)+14px)]"
    >
      <div className="glass-heavy relative mx-auto h-[70px] max-w-[520px] rounded-[30px] px-5">
        <motion.div
          whileTap={tapScale}
          transition={springFast}
          className="absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-[38%]"
        >
          <Link
            href="/dashboard/contracts/new"
            aria-label="Novo contrato"
            className="brand-gradient brand-glow grid h-[68px] w-[68px] place-items-center rounded-[26px] text-white transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          >
            <Plus size={30} strokeWidth={2.35} />
          </Link>
        </motion.div>

        <div className="grid h-full grid-cols-3 items-center gap-2">
          {SIDE_ITEMS.map(({ href, label, Icon, exact }) => {
            const active = isActive(href, exact)

            return (
              <motion.div key={href} whileTap={tapScale} transition={springFast}>
                <Link
                  href={href}
                  aria-label={label}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary',
                    active ? 'text-primary' : 'text-ink-muted hover:text-ink-secondary'
                  )}
                >
                  <div className="relative grid h-6 place-items-center">
                    <Icon size={21} strokeWidth={active ? 2.35 : 1.9} />
                    {active && (
                      <motion.div
                        layoutId="dashboard-nav-dot"
                        className="absolute -bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary"
                        transition={springFast}
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <span className={cn('text-[11px] font-extrabold leading-none', active ? 'text-primary' : 'text-ink-muted')}>
                    {label}
                  </span>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
