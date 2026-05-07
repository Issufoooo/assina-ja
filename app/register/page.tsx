'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { fadeUpVariants, listContainerVariants, listItemVariants, scaleInVariants } from '@/lib/motion'
import BrandIntro from '@/components/processing/BrandIntro'

const schema = z
  .object({
    fullName: z.string().min(2, 'Mínimo 2 caracteres').max(120),
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'As palavras-passe não coincidem',
    path: ['confirmPassword'],
  })

type Fields = z.infer<typeof schema>

function ConfirmationSent({ email }: { email: string }) {
  return (
    <motion.div variants={fadeUpVariants} initial="initial" animate="animate" className="flex min-h-screen flex-col items-center justify-center gap-6 bg-app-atmosphere px-6 text-center">
      <motion.div variants={scaleInVariants} initial="initial" animate="animate" className="glass-soft grid h-20 w-20 place-items-center rounded-full">
        <Mail size={30} className="text-primary" />
      </motion.div>
      <div className="flex max-w-sm flex-col gap-3">
        <h1 className="font-display text-3xl font-extrabold text-ink-primary">Verifique o seu email</h1>
        <p className="text-base font-medium leading-relaxed text-ink-secondary">
          Enviámos um link para <span className="font-extrabold text-ink-primary">{email}</span>. Clique no link para ativar a sua conta.
        </p>
      </div>
      <Link href="/login" className="text-sm font-extrabold text-primary hover:text-primary-deep">Voltar ao início de sessão</Link>
    </motion.div>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [confirmEmail, setConfirmEmail] = useState<string | null>(null)
  const [processing, setProcessing] = useState<
    | { next: 'dashboard'; message: string }
    | { next: 'confirm'; message: string; email: string }
    | null
  >(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Fields>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: Fields) => {
    setServerError(null)
    setProcessing(null)
    const { data: authData, error } = await createClient().auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.fullName.trim() },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/dashboard`,
      },
    })

    if (error) {
      setServerError(error.message.includes('already') ? 'Email já registado.' : 'Erro ao criar conta.')
      return
    }
    if (authData.user && authData.user.identities?.length === 0) {
      setServerError('Email já registado.')
      return
    }
    if (authData.session) {
      setProcessing({
        next: 'dashboard',
        message: 'A criar conta e preparar o seu painel',
      })
      return
    }

    setProcessing({
      next: 'confirm',
      email: data.email,
      message: 'A criar conta e preparar a confirmação',
    })
  }

  if (processing) {
    return (
      <BrandIntro
        duration={4700}
        message={processing.message}
        onComplete={() => {
          if (processing.next === 'dashboard') {
            router.push('/dashboard')
            router.refresh()
            return
          }

          setConfirmEmail(processing.email)
          setProcessing(null)
        }}
      />
    )
  }

  if (confirmEmail) return <ConfirmationSent email={confirmEmail} />

  return (
    <main className="min-h-screen bg-app-atmosphere px-5 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[500px] flex-col justify-center">
        <motion.div variants={fadeUpVariants} initial="initial" animate="animate" className="mb-8">
          <Link href="/" className="glass-soft mb-9 inline-flex items-center gap-3 rounded-full px-4 py-3">
            <Image src="/brand/assinaja-mark.png" alt="AssinaJá" width={44} height={28} className="logo-mark" priority />
            <div>
              <p className="font-display text-base font-extrabold leading-none text-ink-primary">AssinaJá</p>
              <p className="mt-1 text-xs font-semibold leading-none text-ink-muted">Assinatura digital</p>
            </div>
          </Link>
          <h1 className="font-display text-[40px] font-extrabold leading-[1] tracking-[-0.055em] text-ink-primary">
            Comece a enviar<br />contratos.
          </h1>
          <p className="mt-4 text-lg font-medium text-ink-secondary">Crie a sua conta em segundos.</p>
        </motion.div>

        <motion.form variants={listContainerVariants} initial="initial" animate="animate" onSubmit={handleSubmit(onSubmit)} noValidate className="glass rounded-[34px] p-6 sm:p-7">
          <div className="flex flex-col gap-5">
            <motion.div variants={listItemVariants}>
              <Input label="Nome completo" type="text" autoComplete="name" autoCapitalize="words" placeholder="João Silva" error={errors.fullName?.message} {...register('fullName')} />
            </motion.div>
            <motion.div variants={listItemVariants}>
              <Input label="Email" type="email" autoComplete="email" autoCapitalize="none" inputMode="email" placeholder="o-seu@email.com" error={errors.email?.message} {...register('email')} />
            </motion.div>
            <motion.div variants={listItemVariants}>
              <Input label="Palavra-passe" type="password" autoComplete="new-password" placeholder="Mínimo 8 caracteres" helper="Mínimo de 8 caracteres" error={errors.password?.message} {...register('password')} />
            </motion.div>
            <motion.div variants={listItemVariants}>
              <Input label="Confirmar palavra-passe" type="password" autoComplete="new-password" placeholder="Repita a palavra-passe" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
            </motion.div>
            {serverError && <p role="alert" className="text-center text-sm font-semibold text-danger">{serverError}</p>}
            <motion.div variants={listItemVariants}>
              <Button type="submit" fullWidth loading={isSubmitting} size="lg">Criar conta</Button>
            </motion.div>
          </div>
        </motion.form>

        <p className="mt-6 text-center text-sm font-semibold text-ink-secondary">
          Já tem conta? <Link href="/login" className="font-extrabold text-primary hover:text-primary-deep">Iniciar sessão</Link>
        </p>
      </div>
    </main>
  )
}
