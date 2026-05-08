'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Float, Reveal } from '@/components/ui/reveal'
import BrandIntro from '@/components/processing/BrandIntro'
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  FileCheck2,
  LockKeyhole,
  QrCode,
  ShieldCheck,
  Smartphone,
  UploadCloud,
  Users,
} from 'lucide-react'

const flowCards = [
  {
    title: 'Quem envia',
    text: 'Carrega o PDF, adiciona os signatários e acompanha tudo no painel.',
    icon: UploadCloud,
  },
  {
    title: 'Quem assina',
    text: 'Recebe um link, confirma o código OTP e assina no telemóvel.',
    icon: Smartphone,
  },
  {
    title: 'Quem verifica',
    text: 'Usa o QR ou ID de verificação para confirmar a validade do documento.',
    icon: QrCode,
  },
]

const trustCards = [
  { title: 'Assinatura auditável', text: 'Cada ação fica registada com data, estado e prova de integridade.', icon: ShieldCheck },
  { title: 'Documento final protegido', text: 'O PDF final recebe certificado, QR e hash SHA-256.', icon: FileCheck2 },
  { title: 'Sem conta para assinar', text: 'O signatário apenas abre o link, confirma e assina.', icon: Users },
]

function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <div className="relative grid h-12 w-12 shrink-0 place-items-center rounded-full glass-soft sm:h-14 sm:w-14">
        <Image
          src="/brand/assinaja-mark.png"
          alt="AssinaJá"
          width={38}
          height={24}
          className="logo-mark object-contain"
          priority
        />
      </div>
      {!compact && (
        <div className="leading-none">
          <p className="font-display text-lg font-extrabold tracking-tight text-ink-primary sm:text-xl">AssinaJá</p>
          <p className="mt-1 text-[11px] font-semibold text-ink-muted sm:text-xs">Assinatura digital</p>
        </div>
      )}
    </div>
  )
}

function FloatingContractCard() {
  return (
    <div className="glass glass-interactive rounded-[30px] p-5 sm:rounded-[34px] sm:p-8">
      <div className="flex items-start justify-between gap-3 sm:gap-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-ghost sm:text-xs sm:tracking-[0.22em]">Contrato em progresso</p>
          <h3 className="mt-3 font-display text-xl font-extrabold leading-tight text-ink-primary sm:mt-4 sm:text-2xl">
            Prestação de<br />serviços
          </h3>
        </div>
        <div className="rounded-2xl bg-white/55 px-3.5 py-3 text-xs font-extrabold text-primary shadow-[inset_0_1px_0_rgba(255,255,255,.9)] sm:rounded-3xl sm:px-5 sm:py-4 sm:text-sm">
          3 de 3<br />assinaturas
        </div>
      </div>

      <div className="mt-5 space-y-3 sm:mt-7 sm:space-y-4">
        {['João Silva', 'Maria Costa', 'Ana M.'].map((name, index) => (
          <div key={name} className="glass-soft flex items-center gap-3 rounded-[22px] px-4 py-3 sm:gap-4 sm:rounded-[26px] sm:px-5 sm:py-4">
            <div className="brand-gradient brand-glow grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-extrabold text-white sm:h-11 sm:w-11">
              {name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-sm font-bold text-ink-primary sm:text-base">{name}</p>
              <p className="text-xs font-medium text-ink-muted sm:text-sm">Assinatura verificada</p>
            </div>
            <CheckCircle2 className="text-primary" size={22} />
          </div>
        ))}
      </div>

      <div className="glass-soft mt-4 rounded-[22px] px-4 py-3 sm:mt-5 sm:rounded-[26px] sm:px-5 sm:py-4">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-ghost">Integridade</p>
        <p className="mt-2 truncate font-mono text-xs text-ink-secondary sm:text-sm">SHA-256: a3f8b1c2d4e5f60182...</p>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [showIntro, setShowIntro] = useState(false)
  const [introChecked, setIntroChecked] = useState(false)

  useEffect(() => {
    const seen = window.sessionStorage.getItem('assinaja_intro_seen')

    if (!seen) {
      setShowIntro(true)
      window.sessionStorage.setItem('assinaja_intro_seen', 'true')
    }

    setIntroChecked(true)
  }, [])

  if (!introChecked) return null

  if (showIntro) {
    return (
      <BrandIntro
        duration={5200}
        showProgress={false}
        onComplete={() => setShowIntro(false)}
      />
    )
  }

  return (
    <main className="min-h-screen overflow-hidden bg-app-atmosphere text-ink-primary">
      <section className="relative px-5 pb-10 pt-6 sm:px-8 sm:pb-16 lg:px-10">
        <div className="pointer-events-none absolute left-1/2 top-16 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
        <div className="mx-auto max-w-6xl">
          <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7 }} className="glass-heavy mx-auto flex h-[64px] max-w-3xl items-center justify-between gap-3 rounded-full px-3.5 sm:h-[74px] sm:px-6">
            <BrandLogo />
            <Link
              href="/register"
              className="brand-gradient brand-glow inline-flex h-11 shrink-0 items-center justify-center rounded-full px-4 text-sm font-extrabold text-white transition-transform duration-200 hover:-translate-y-0.5 sm:h-13 sm:px-6 sm:text-base"
            >
              Começar grátis
            </Link>
          </motion.header>

          <div className="grid items-center gap-8 pt-10 sm:gap-10 sm:pt-16 lg:grid-cols-[1fr_.9fr] lg:pt-20">
            <Reveal><div>
              <motion.div initial={{ scale: .9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: .2 }} className="glass-soft inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-extrabold text-primary sm:gap-3 sm:px-5 sm:py-3 sm:text-sm">
                <ShieldCheck size={20} />
                Assinatura verificada e auditável
              </motion.div>

              <Float className="relative mt-7 h-24 w-44 sm:mt-10 sm:h-32 sm:w-64">
                <Image
                  src="/brand/assinaja-mark.png"
                  alt="Símbolo AssinaJá"
                  fill
                  className="logo-mark object-contain object-left"
                  priority
                />
              </Float>

              <motion.h1 initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: .15, duration: .8 }} className="mt-7 max-w-3xl font-display text-[42px] font-extrabold leading-[0.97] tracking-[-0.055em] text-ink-primary text-balance sm:mt-8 sm:text-6xl lg:text-7xl">
                Sua assinatura digital.{' '}
                <span className="gradient-text">Rápida, segura e profissional.</span>
              </motion.h1>
              <motion.p initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: .25, duration: .8 }} className="mt-6 max-w-2xl text-base font-medium leading-7 text-ink-secondary sm:mt-7 sm:text-xl sm:leading-8">
                Envie contratos, recolha assinaturas remotas e valide cada documento com uma experiência elegante, moderna e pronta para crescer.
              </motion.p>

              <motion.div initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: .35, duration: .8 }} className="mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:gap-4">
                <Link
                  href="/register"
                  className="brand-gradient brand-glow inline-flex h-12 items-center justify-center gap-2.5 rounded-[20px] px-5 text-sm font-extrabold text-white transition-transform duration-200 hover:-translate-y-0.5 sm:h-14 sm:rounded-[24px] sm:px-8 sm:text-base"
                >
                  Começar agora <ArrowRight size={20} />
                </Link>
                <Link
                  href="/login"
                  className="glass-soft inline-flex h-12 items-center justify-center rounded-[20px] px-5 text-sm font-extrabold text-ink-primary transition-transform duration-200 hover:-translate-y-0.5 sm:h-14 sm:rounded-[24px] sm:px-8 sm:text-base"
                >
                  Já tenho conta
                </Link>
              </motion.div>
            </div></Reveal>

            <Reveal delay={0.2}><div className="relative lg:pl-4">
              <motion.div whileHover={{ rotate: -.5, y: -6 }} transition={{ duration: .35 }}>
              <FloatingContractCard />
              </motion.div>
            </div></Reveal>
          </div>
        </div>
      </section>

      <section className="px-5 py-7 sm:px-8 sm:py-10">
        <div className="mx-auto grid max-w-6xl gap-4 sm:gap-5 md:grid-cols-3">
          {flowCards.map(({ title, text, icon: Icon }, index) => (
            <Reveal key={title} delay={index * 0.08}><motion.div whileHover={{ y: -8 }} transition={{ duration: .25 }} className="glass glass-interactive rounded-[30px] p-5 sm:rounded-[34px] sm:p-7">
              <div className="glass-soft mb-5 grid h-12 w-12 place-items-center rounded-full sm:mb-8 sm:h-14 sm:w-14">
                <Icon size={24} className="text-primary" />
              </div>
              <h2 className="font-display text-[22px] font-extrabold tracking-tight text-ink-primary sm:text-2xl">{title}</h2>
              <p className="mt-3 text-[15px] font-medium leading-7 text-ink-secondary sm:mt-4 sm:text-base">{text}</p>
            </motion.div></Reveal>
          ))}
        </div>
      </section>

      <section className="px-5 py-7 sm:px-8 sm:py-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 max-w-2xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-primary sm:text-sm sm:tracking-[0.22em]">Confiança para todos os lados</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink-primary sm:text-4xl">Feito para documentos sérios.</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {trustCards.map(({ title, text, icon: Icon }, index) => (
              <Reveal key={title} delay={index * 0.08}><motion.div whileHover={{ y: -6 }} className="glass-soft rounded-[28px] p-5 sm:rounded-[30px] sm:p-6">
                <Icon size={24} className="text-primary" />
                <h3 className="mt-4 font-display text-lg font-extrabold text-ink-primary sm:mt-5 sm:text-xl">{title}</h3>
                <p className="mt-3 text-sm font-medium leading-6 text-ink-secondary">{text}</p>
              </motion.div></Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-8 sm:px-8 sm:py-12">
        <Reveal><div className="glass-heavy mx-auto max-w-5xl rounded-[34px] p-5 sm:rounded-[38px] sm:p-10">
          <div className="grid items-center gap-8 md:grid-cols-[1fr_.85fr]">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/55 px-4 py-2 text-sm font-extrabold text-primary">
                <Clock3 size={18} /> 3 meses grátis
              </p>
              <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-ink-primary sm:mt-6 sm:text-4xl">Depois, apenas 600 MT/mês.</h2>
              <p className="mt-3 text-[15px] font-medium leading-7 text-ink-secondary sm:mt-4 sm:text-base">
                Comece sem pagar. Quando o período premium terminar, mantém acesso ao sistema por uma taxa mensal simples.
              </p>
            </div>
            <div className="rounded-[28px] bg-[#00033D] p-5 text-white shadow-[0_30px_70px_rgba(0,3,61,.26)] sm:rounded-[32px] sm:p-6">
              <p className="text-sm font-bold text-white/60">Plano Premium</p>
              <p className="mt-3 font-display text-4xl font-extrabold sm:text-5xl">600 MT</p>
              <p className="mt-1 text-sm font-semibold text-white/60">por mês, após o trial</p>
              <Link href="/register" className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-white text-sm font-extrabold text-[#00033D]">
                Começar grátis
              </Link>
            </div>
          </div>
        </div></Reveal>
      </section>
    </main>
  )
}
