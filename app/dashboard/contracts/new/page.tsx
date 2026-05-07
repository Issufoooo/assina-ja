'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { BottomBar, BottomBarSpacer } from '@/components/ui/BottomBar'
import { ProgressSteps } from '@/components/ui/ProgressSteps'
import { PdfUploader } from '@/components/contracts/PdfUploader'
import { AddSignerForm } from '@/components/contracts/AddSignerForm'
import { stepVariants } from '@/lib/motion'
import type { AddSignerInput } from '@/types/contract'

const detailsSchema = z.object({ title: z.string().min(2,'Mínimo 2 caracteres').max(200).trim(), description: z.string().max(1000).trim().optional() })
type DetailsFields = z.infer<typeof detailsSchema>

export default function NewContractPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string|null>(null)
  const [wizard, setWizard] = useState({ title:'', description:'', storagePath: null as string|null, signers: [] as AddSignerInput[] })
  const { register, handleSubmit, formState: { errors } } = useForm<DetailsFields>({ resolver: zodResolver(detailsSchema) })

  const onStep0 = (data: DetailsFields) => { setWizard(w => ({...w, title: data.title, description: data.description ?? ''})); setStep(1) }

  const onFinalSubmit = async () => {
    if (!wizard.storagePath) { setServerError('Carregue o PDF antes de continuar.'); return }
    if (wizard.signers.length === 0) { setServerError('Adicione pelo menos um signatário.'); return }
    setServerError(null); setSubmitting(true)
    try {
      const res = await fetch('/api/contracts', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ title: wizard.title, description: wizard.description||null, originalPdfPath: wizard.storagePath, signers: wizard.signers }) })
      if (!res.ok) { const d = await res.json() as {error?:string}; throw new Error(d.error ?? 'Erro') }
      const { contractId } = await res.json() as { contractId: string }
      router.push(`/dashboard/contracts/${contractId}`); router.refresh()
    } catch (err) { setServerError(err instanceof Error ? err.message : 'Erro'); setSubmitting(false) }
  }

  const primaryActions = [
    <Button key="0" type="submit" form="details-form" fullWidth size="lg">Continuar</Button>,
    <Button key="1" fullWidth size="lg" disabled={!wizard.storagePath} onClick={() => setStep(2)}>Continuar</Button>,
    <Button key="2" fullWidth size="lg" loading={submitting} disabled={wizard.signers.length===0} onClick={onFinalSubmit}>Enviar contrato</Button>,
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar title="Novo contrato" showBack onBack={() => router.push('/dashboard')} hideUserMenu />
      <ProgressSteps mode="dots" currentStep={step} totalSteps={3} labels={['Detalhes','Documento','Signatários']} className="px-6 pt-5 pb-2" />
      <div className="flex-1 px-5 pt-4 overflow-hidden">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="s0" variants={stepVariants} initial="initial" animate="animate" exit="exit">
              <form id="details-form" onSubmit={handleSubmit(onStep0)} noValidate className="flex flex-col gap-5">
                <div><h2 className="font-display text-xl font-bold text-ink-primary mb-1">Detalhes do contrato</h2><p className="text-sm text-ink-secondary font-body">Como se chama este contrato?</p></div>
                <Input label="Título" placeholder="Contrato de Prestação de Serviços" autoFocus error={errors.title?.message} {...register('title')} />
                <Input label="Descrição (opcional)" placeholder="Breve descrição do contrato" helper="Visível para os signatários" error={errors.description?.message} {...register('description')} />
              </form>
            </motion.div>
          )}
          {step === 1 && (
            <motion.div key="s1" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col gap-5">
              <div><h2 className="font-display text-xl font-bold text-ink-primary mb-1">Documento</h2><p className="text-sm text-ink-secondary font-body">Carregue o PDF que vai ser assinado.</p></div>
              <PdfUploader onUploadComplete={(path) => setWizard(w=>({...w, storagePath:path}))} onError={msg => setServerError(msg)} />
              {wizard.storagePath && <p className="text-xs text-success text-center font-body font-semibold">✓ PDF carregado com sucesso</p>}
            </motion.div>
          )}
          {step === 2 && (
            <motion.div key="s2" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col gap-5">
              <div><h2 className="font-display text-xl font-bold text-ink-primary mb-1">Signatários</h2><p className="text-sm text-ink-secondary font-body">Quem precisa de assinar?</p></div>
              <AddSignerForm signers={wizard.signers} onChange={s => setWizard(w=>({...w, signers:s}))} />
              {serverError && <p role="alert" className="text-sm text-danger text-center font-body">{serverError}</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <BottomBarSpacer />
      <BottomBar primary={primaryActions[step]!} secondary={step > 0 ? <Button variant="ghost" size="sm" onClick={() => setStep(s=>s-1)}>Voltar</Button> : undefined} />
    </div>
  )
}
