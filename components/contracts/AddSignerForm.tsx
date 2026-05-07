'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { UserPlus, X } from 'lucide-react'
import { z } from 'zod'
import { cn } from '@/lib/utils'
import { listItemVariants, listContainerVariants, tapScale, springFast } from '@/lib/motion'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import type { AddSignerInput } from '@/types/contract'

const signerSchema = z.object({
  fullName: z.string().min(2,'Mínimo 2 caracteres').max(120).trim(),
  email: z.string().email('Email inválido').trim().toLowerCase().optional().or(z.literal('')),
  phone: z.string().min(7,'Telefone inválido').max(30).trim().optional().or(z.literal('')),
}).refine(d => (d.email && d.email.length > 0) || (d.phone && d.phone.length > 0), { message:'Indique email ou telefone', path:['email'] })
type SignerFields = z.infer<typeof signerSchema>

export function AddSignerForm({ signers, onChange, maxSigners=20, disabled=false }: { signers: AddSignerInput[]; onChange: (s: AddSignerInput[]) => void; maxSigners?: number; disabled?: boolean }) {
  const [showForm, setShowForm] = useState(signers.length === 0)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<SignerFields>({ resolver: zodResolver(signerSchema) })

  const onAdd = (data: SignerFields) => {
    onChange([...signers, { fullName: data.fullName, email: data.email && data.email.length>0 ? data.email : null, phone: data.phone && data.phone.length>0 ? data.phone : null }])
    reset(); setShowForm(false)
  }

  return (
    <div className="flex flex-col gap-4">
      {signers.length > 0 && (
        <motion.ul variants={listContainerVariants} initial="initial" animate="animate" className="flex flex-col gap-2">
          {signers.map((s,i) => (
            <motion.li key={i} variants={listItemVariants} className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border shadow-xs">
              <Avatar name={s.fullName} size="sm"/>
              <div className="flex-1 min-w-0"><p className="text-sm font-body font-semibold text-ink-primary truncate">{s.fullName}</p><p className="text-xs text-ink-muted truncate">{s.email ?? s.phone ?? ''}</p></div>
              {!disabled && (
                <motion.button whileTap={tapScale} transition={springFast} onClick={() => onChange(signers.filter((_,j)=>j!==i))} aria-label={`Remover ${s.fullName}`} className="p-1.5 rounded-lg text-ink-muted hover:text-danger hover:bg-danger-dim transition-colors"><X size={15}/></motion.button>
              )}
            </motion.li>
          ))}
        </motion.ul>
      )}
      <AnimatePresence mode="wait">
        {!showForm ? (
          <motion.div key="btn" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
            <Button variant="secondary" fullWidth disabled={disabled || signers.length >= maxSigners} iconLeft={<UserPlus size={16}/>} onClick={() => setShowForm(true)}>
              {signers.length === 0 ? 'Adicionar signatário' : 'Adicionar outro'}
            </Button>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-4 }} className="rounded-2xl border border-border bg-surface shadow-sm p-4 flex flex-col gap-3">
            <p className="text-sm font-body font-bold text-ink-primary">Novo signatário</p>
            <form onSubmit={handleSubmit(onAdd)} noValidate className="flex flex-col gap-3">
              <Input label="Nome completo" placeholder="João Silva" autoCapitalize="words" error={errors.fullName?.message} {...register('fullName')} />
              <Input label="Email" type="email" inputMode="email" autoCapitalize="none" placeholder="joao@empresa.com" helper="Ou telefone abaixo" error={errors.email?.message} {...register('email')} />
              <Input label="Telefone (opcional)" type="tel" inputMode="tel" placeholder="+258 84 123 4567" error={errors.phone?.message} {...register('phone')} />
              <div className="flex gap-2 pt-1">
                <Button type="button" variant="ghost" size="sm" onClick={() => { reset(); setShowForm(false) }}>Cancelar</Button>
                <Button type="submit" size="sm" fullWidth>Adicionar</Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
