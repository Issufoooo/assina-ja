'use client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { fadeUpVariants, listContainerVariants, listItemVariants } from '@/lib/motion'
import { formatDate } from '@/lib/utils'

export function AccountClient({ fullName, email, memberSince }: { fullName: string; email: string; memberSince: string }) {
  const router = useRouter()
  const supabase = createClient()
  const handleSignOut = async () => { await supabase.auth.signOut(); router.push('/login'); router.refresh() }
  const rows = [{ label:'Nome', value:fullName }, { label:'Email', value:email }, { label:'Membro desde', value:memberSince ? formatDate(memberSince) : '—' }]
  return (
    <div className="w-full max-w-[480px] mx-auto px-5 flex flex-col gap-6">
      <motion.div variants={fadeUpVariants} initial="initial" animate="animate" className="flex flex-col items-center gap-3 pt-4">
        <Avatar name={fullName} size="lg" />
        <div className="text-center"><h1 className="font-display text-xl font-bold text-ink-primary">{fullName}</h1><p className="text-sm text-ink-secondary font-body">{email}</p></div>
      </motion.div>
      <motion.div variants={listContainerVariants} initial="initial" animate="animate">
        <Card><div className="flex flex-col divide-y divide-border-subtle">
          {rows.map(r => <motion.div key={r.label} variants={listItemVariants} className="flex items-center justify-between py-3"><p className="text-sm text-ink-muted font-body">{r.label}</p><p className="text-sm text-ink-primary font-body font-semibold">{r.value}</p></motion.div>)}
        </div></Card>
      </motion.div>
      <motion.div variants={fadeUpVariants} initial="initial" animate="animate">
        <Button variant="danger" fullWidth iconLeft={<LogOut size={16}/>} onClick={handleSignOut}>Terminar sessão</Button>
      </motion.div>
    </div>
  )
}
