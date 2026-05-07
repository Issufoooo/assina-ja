'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import type { Route } from 'next'
import { motion, AnimatePresence } from 'framer-motion'
import { PublicShell } from '@/components/layout/PublicShell'
import { Button } from '@/components/ui/Button'
import { OtpInput } from '@/components/ui/OtpInput'
import { BottomBar, BottomBarSpacer } from '@/components/ui/BottomBar'
import { PageLoadingState } from '@/components/ui/LoadingState'
import { DocumentReader } from '@/components/signing/DocumentReader'
import { SignaturePad } from '@/components/signing/SignaturePad'
import { stepVariants } from '@/lib/motion'
import { maskEmail } from '@/lib/utils'
import { STATUS_TO_STEP } from '@/types/signer'
import type { SignerContext, SigningStep } from '@/types/signer'
import type { SignatureType } from '@/types/database'
import type { ApiError, DocumentAccessResponse } from '@/types/api'
import type { OtpVerifyResult, SignatureSubmitResult } from '@/types/signer'

export default function SignPage() {
  const params = useParams()
  const router = useRouter()
  const token = typeof params.token === 'string' ? params.token : ''

  const [context, setContext] = useState<SignerContext | null>(null)
  const [step, setStep] = useState<SigningStep>('entry')
  const [loadError, setLoadError] = useState<string | null>(null)
  const [otpValue, setOtpValue] = useState('')
  const [otpError, setOtpError] = useState<string | null>(null)
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpSending, setOtpSending] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [docRead, setDocRead] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [signatureData, setSignatureData] = useState('')
  const [signatureType, setSignatureType] = useState<SignatureType>('drawn')
  const [signing, setSigning] = useState(false)
  const [signError, setSignError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return

    fetch(`/api/sign/${token}`)
      .then(async (res) => {
        if (!res.ok) {
          const d = (await res.json()) as ApiError
          throw new Error(d.error ?? 'Link inválido.')
        }
        return res.json() as Promise<SignerContext>
      })
      .then((ctx) => {
        setContext(ctx)

        if (ctx.status === 'signed') {
          router.replace(`/sign/${token}/done` as Route)
          return
        }

        setStep(STATUS_TO_STEP[ctx.status])

        if (ctx.documentReadAt) {
          setDocRead(true)
        }
      })
      .catch((err) =>
        setLoadError(err instanceof Error ? err.message : 'Erro.')
      )
  }, [token, router])

  useEffect(() => {
    if (resendTimer <= 0) return

    const id = setInterval(() => setResendTimer((t) => t - 1), 1000)
    return () => clearInterval(id)
  }, [resendTimer])

  const sendOtp = useCallback(async () => {
    setOtpSending(true)
    setOtpError(null)

    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signingToken: token }),
      })

      const d = (await res.json()) as {
        retryAfterSeconds?: number
        error?: string
      }

      if (!res.ok) {
        if (d.retryAfterSeconds) setResendTimer(d.retryAfterSeconds)
        throw new Error(d.error ?? 'Erro.')
      }

      setOtpSent(true)
      setResendTimer(60)
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : 'Erro.')
    } finally {
      setOtpSending(false)
    }
  }, [token])

  useEffect(() => {
    if (step === 'verify' && !otpSent) {
      sendOtp()
    }
  }, [step, otpSent, sendOtp])

  const verifyOtp = useCallback(
    async (code: string) => {
      setOtpLoading(true)
      setOtpError(null)

      try {
        const res = await fetch('/api/otp/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ signingToken: token, code }),
        })

        const d = (await res.json()) as OtpVerifyResult & { error?: string }

        if (!res.ok) {
          throw new Error(d.error ?? 'Código inválido.')
        }

        setStep('read')

        if (context) {
          fetch(`/api/documents/${context.contractId}/access`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ context: 'verification_key' }),
          })
            .then((r) =>
              r.ok
                ? (r.json() as Promise<DocumentAccessResponse>)
                : Promise.reject()
            )
            .then((doc) => setPdfUrl(doc.signedUrl))
            .catch(() => setDocRead(true))
        }
      } catch (err) {
        setOtpError(err instanceof Error ? err.message : 'Erro.')
        setOtpValue('')
      } finally {
        setOtpLoading(false)
      }
    },
    [token, context]
  )

  const handleDocRead = useCallback(async () => {
    setDocRead(true)

    await fetch(`/api/sign/${token}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markDocumentRead: true }),
    }).catch(() => {})
  }, [token])

  const submitSignature = useCallback(async () => {
    if (!signatureData.trim()) {
      setSignError('Por favor, assine o documento.')
      return
    }

    setSigning(true)
    setSignError(null)

    try {
      const res = await fetch(`/api/sign/${token}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signingToken: token,
          signatureData: signatureData.trim(),
          signatureType,
        }),
      })

      const d = (await res.json()) as SignatureSubmitResult & { error?: string }

      if (!res.ok) {
        throw new Error(d.error ?? 'Erro.')
      }

      const destination = `/sign/${token}/done${
        d.verificationId ? `?vid=${d.verificationId}` : ''
      }` as Route

      router.push(destination)
    } catch (err) {
      setSignError(err instanceof Error ? err.message : 'Erro.')
      setSigning(false)
    }
  }, [token, signatureData, signatureType, router])

  if (loadError) {
    return (
      <PublicShell>
        <div className="flex flex-col items-center justify-center flex-1 gap-4 py-16 text-center px-4">
          <div className="w-14 h-14 rounded-2xl bg-danger-dim flex items-center justify-center">
            <span className="text-2xl">⚠</span>
          </div>
          <h1 className="font-display text-xl font-bold text-ink-primary">
            Link inválido
          </h1>
          <p className="text-sm text-ink-secondary font-body max-w-xs">
            {loadError}
          </p>
        </div>
      </PublicShell>
    )
  }

  if (!context) {
    return <PageLoadingState label="A carregar contrato…" />
  }

  const stepIndex = { entry: 0, verify: 1, read: 2, sign: 3 }[step]

  const primaryCta: Record<SigningStep, React.ReactNode> = {
    entry: (
      <Button fullWidth size="lg" onClick={() => setStep('verify')}>
        Começar a assinar
      </Button>
    ),
    verify: (
      <Button
        fullWidth
        size="lg"
        loading={otpLoading}
        disabled={otpValue.length < 6 || otpLoading}
        onClick={() => verifyOtp(otpValue)}
      >
        Verificar código
      </Button>
    ),
    read: (
      <Button
        fullWidth
        size="lg"
        disabled={!docRead}
        onClick={() => setStep('sign')}
      >
        {docRead ? 'Continuar para assinar' : 'Role o documento para continuar'}
      </Button>
    ),
    sign: (
      <Button
        fullWidth
        size="lg"
        loading={signing}
        disabled={!signatureData.trim() || signing}
        onClick={submitSignature}
      >
        Assinar documento
      </Button>
    ),
  }

  return (
    <PublicShell currentStep={stepIndex} totalSteps={4}>
      <AnimatePresence mode="wait">
        {step === 'entry' && (
          <motion.div
            key="entry"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col gap-5 py-8"
          >
            <div className="flex flex-col gap-2">
              <p className="text-2xs text-ink-muted font-body uppercase tracking-widest">
                Convite de assinatura
              </p>
              <h1 className="font-display text-2xl font-bold text-ink-primary leading-tight">
                {context.contractTitle}
              </h1>
              {context.contractDescription && (
                <p className="text-sm text-ink-secondary font-body">
                  {context.contractDescription}
                </p>
              )}
            </div>

            <div className="rounded-2xl bg-surface border border-border shadow-sm p-4 flex flex-col gap-1">
              <p className="text-2xs text-ink-muted font-body">Enviado por</p>
              <p className="text-base font-body font-bold text-ink-primary">
                {context.senderName}
              </p>
            </div>

            <div className="rounded-2xl bg-surface border border-border shadow-sm p-4">
              <p className="text-2xs text-ink-muted font-body mb-1">
                Assinar como
              </p>
              <p className="text-base font-body font-bold text-ink-primary">
                {context.fullName}
              </p>
              {context.email && (
                <p className="text-sm text-ink-secondary font-body mt-0.5">
                  {context.email}
                </p>
              )}
            </div>

            <p className="text-xs text-ink-muted font-body text-center leading-relaxed">
              Ao continuar irá verificar a sua identidade e assinar digitalmente
              este documento.
            </p>
          </motion.div>
        )}

        {step === 'verify' && (
          <motion.div
            key="verify"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col gap-6 py-8"
          >
            <div className="flex flex-col gap-2">
              <h1 className="font-display text-2xl font-bold text-ink-primary">
                Verificar identidade
              </h1>
              <p className="text-sm text-ink-secondary font-body">
                Enviámos um código de 6 dígitos para{' '}
                <span className="text-ink-primary font-semibold">
                  {context.email
                    ? maskEmail(context.email)
                    : context.phone ?? ''}
                </span>
              </p>
            </div>

            <OtpInput
              value={otpValue}
              onChange={setOtpValue}
              onComplete={verifyOtp}
              error={otpError ?? undefined}
              disabled={otpLoading}
              label="Código de verificação"
            />

            <div className="flex flex-col items-center gap-2">
              {resendTimer > 0 ? (
                <p className="text-sm text-ink-muted font-body">
                  Reenviar em {resendTimer}s
                </p>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  loading={otpSending}
                  onClick={() => {
                    setOtpValue('')
                    sendOtp()
                  }}
                >
                  Reenviar código
                </Button>
              )}
            </div>
          </motion.div>
        )}

        {step === 'read' && (
          <motion.div
            key="read"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col gap-4 py-4"
          >
            <div>
              <h1 className="font-display text-xl font-bold text-ink-primary">
                Leia o documento
              </h1>
              <p className="text-sm text-ink-secondary font-body mt-1">
                Role até ao fim para continuar.
              </p>
            </div>

            {pdfUrl ? (
              <DocumentReader
                pdfUrl={pdfUrl}
                onScrollComplete={handleDocRead}
                alreadyRead={!!context.documentReadAt}
              />
            ) : (
              <div className="rounded-2xl bg-surface border border-border shadow-sm p-6 flex flex-col items-center gap-3 text-center">
                <p className="text-sm text-ink-secondary font-body">
                  Documento disponível após verificação.
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDocRead(true)
                    setStep('sign')
                  }}
                >
                  Continuar sem pré-visualização
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {step === 'sign' && (
          <motion.div
            key="sign"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col gap-5 py-4"
          >
            <div>
              <h1 className="font-display text-xl font-bold text-ink-primary">
                Assinar
              </h1>
              <p className="text-sm text-ink-secondary font-body mt-1">
                A sua assinatura ficará registada no documento.
              </p>
            </div>

            <SignaturePad
              signerName={context.fullName}
              onSignature={(data, type) => {
                setSignatureData(data)
                setSignatureType(type)
                setSignError(null)
              }}
            />

            {signError && (
              <p
                role="alert"
                className="text-sm text-danger font-body text-center"
              >
                {signError}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <BottomBarSpacer />
      <BottomBar primary={primaryCta[step]} />
    </PublicShell>
  )
}