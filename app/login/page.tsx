'use client'

import { Suspense, useState } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import type { Route } from 'next'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { fadeUpVariants, listContainerVariants, listItemVariants } from '@/lib/motion'
import BrandIntro from '@/components/processing/BrandIntro'

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Obrigatório'),
})

type Fields = z.infer<typeof schema>

function getSafeRedirect(redirectTo: string | null): Route {
  const allowedRoutes = [
    '/dashboard',
    '/dashboard/billing',
    '/dashboard/account',
    '/dashboard/contracts/new',
  ] as const

  if (
    redirectTo &&
    allowedRoutes.includes(redirectTo as (typeof allowedRoutes)[number])
  )
    return redirectTo as Route

  return '/dashboard'
}

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const safeRedirect = getSafeRedirect(searchParams.get('redirectTo'))

  const [serverError, setServerError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Fields>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: Fields) => {
    setServerError(null)
    setProcessing(false)

    const { error } = await createClient().auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      setServerError(
        error.message.includes('Invalid') ||
          error.message.includes('invalid')
          ? 'Email ou palavra-passe incorretos.'
          : 'Erro ao entrar. Tente novamente.'
      )
      setProcessing(false)
      return
    }

    setProcessing(true)
  }

  if (processing) {
    return (
      <BrandIntro
        duration={4300}
        message="A validar sessão e abrir o seu painel"
        onComplete={() => {
          router.push(safeRedirect)
          router.refresh()
        }}
      />
    )
  }

  return (
    <main className="min-h-screen bg-app-atmosphere px-5 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[500px] flex-col justify-center">
        <motion.div
          variants={fadeUpVariants}
          initial="initial"
          animate="animate"
          className="mb-10"
        >
          <Link
            href="/"
            className="glass-soft mb-10 inline-flex items-center gap-3 rounded-full px-4 py-3"
          >
            <Image
              src="/brand/assinaja-mark.png"
              alt="AssinaJá"
              width={44}
              height={28}
              className="logo-mark"
              priority
            />
            <div>
              <p className="font-display text-base font-extrabold text-ink-primary">
                AssinaJá
              </p>
              <p className="mt-1 text-xs font-semibold text-ink-muted">
                Assinatura digital
              </p>
            </div>
          </Link>

          <h1 className="font-display text-[44px] font-extrabold leading-[1] tracking-[-0.055em] text-ink-primary">
            Bem-vindo
            <br />
            de volta.
          </h1>

          <p className="mt-4 text-lg font-medium text-ink-secondary">
            Entre para gerir os seus contratos.
          </p>
        </motion.div>

        <motion.form
          variants={listContainerVariants}
          initial="initial"
          animate="animate"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="glass rounded-[34px] p-6 sm:p-7"
        >
          <div className="flex flex-col gap-5">
            <motion.div variants={listItemVariants}>
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                autoCapitalize="none"
                inputMode="email"
                placeholder="o-seu@email.com"
                error={errors.email?.message}
                {...register('email')}
              />
            </motion.div>

            <motion.div variants={listItemVariants}>
              <Input
                label="Palavra-passe"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
              />
            </motion.div>

            {serverError && (
              <p className="text-center text-sm font-semibold text-danger">
                {serverError}
              </p>
            )}

            <motion.div variants={listItemVariants}>
              <Button
                type="submit"
                fullWidth
                loading={isSubmitting}
                size="lg"
              >
                Entrar
              </Button>
            </motion.div>
          </div>
        </motion.form>

        <p className="mt-6 text-center text-sm font-semibold text-ink-secondary">
          Não tem conta?{' '}
          <Link
            href="/register"
            className="font-extrabold text-primary hover:text-primary-deep"
          >
            Criar conta
          </Link>
        </p>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  )
}