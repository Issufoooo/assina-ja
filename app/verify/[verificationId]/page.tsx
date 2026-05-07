'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle, Download, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react'
import { PublicShell } from '@/components/layout/PublicShell'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PageLoadingState } from '@/components/ui/LoadingState'
import { fadeUpVariants, listContainerVariants, listItemVariants, springFast } from '@/lib/motion'
import { formatDate, formatDateTime } from '@/lib/utils'
import { formatVerificationId } from '@/types/api'
import type { VerificationPageState } from '@/types/contract'
import type { DocumentAccessResponse, ApiError } from '@/types/api'
import { motion as m } from 'framer-motion'

const STATE_CONFIG = {
  valid:        { Icon: CheckCircle2,  color:'text-success', bg:'bg-success-dim',  border:'border-success/20',  label:'Documento Válido' },
  revoked:      { Icon: XCircle,       color:'text-danger',  bg:'bg-danger-dim',   border:'border-danger/20',   label:'Documento Revogado' },
  not_found:    { Icon: HelpCircle,    color:'text-ink-muted', bg:'bg-surface-raised', border:'border-border', label:'Documento Não Encontrado' },
  inconclusive: { Icon: AlertTriangle, color:'text-warning',  bg:'bg-warning-dim',  border:'border-warning/20',  label:'Verificação Inconclusiva' },
} as const

function KeyAccessPanel({ contractId, accessMode }: { contractId: string; accessMode: string }) {
  const [expanded, setExpanded] = useState(false)
  const [key, setKey]           = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string|null>(null)
  const [success, setSuccess]   = useState(false)

  if (accessMode === 'owner_only') return <div className="rounded-2xl bg-surface-raised border border-border p-4 text-center"><p className="text-sm text-ink-secondary font-body">O acesso a este documento está restrito ao emissor.</p></div>

  const handleDownload = async () => {
    setLoading(true); setError(null)
    try {
      const res = await fetch(`/api/documents/${contractId}/access`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ context:'verification_key', ...(accessMode !== 'public' && { key: key.trim() }) }) })
      const d = await res.json() as (DocumentAccessResponse & ApiError)
      if (!res.ok) throw new Error(d.error ?? 'Chave inválida.')
      setSuccess(true); window.open(d.signedUrl, '_blank', 'noopener,noreferrer')
    } catch (err) { setError(err instanceof Error ? err.message : 'Erro.') }
    finally { setLoading(false) }
  }

  if (accessMode === 'public') return (
    <Button variant="secondary" fullWidth iconLeft={<Download size={15}/>} loading={loading} onClick={handleDownload}>Transferir documento</Button>
  )

  return (
    <div className="rounded-2xl bg-surface border border-border shadow-sm overflow-hidden">
      <motion.button whileTap={{ scale:0.99 }} transition={springFast} onClick={() => setExpanded(v=>!v)}
        className="w-full flex items-center justify-between gap-3 p-4 text-left" aria-expanded={expanded}>
        <div className="flex items-center gap-2">
          <Download size={16} className="text-ink-muted" aria-hidden="true"/>
          <span className="text-sm font-body font-semibold text-ink-primary">Aceder ao documento completo</span>
        </div>
        {expanded ? <ChevronUp size={16} className="text-ink-muted"/> : <ChevronDown size={16} className="text-ink-muted"/>}
      </motion.button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }} transition={{ duration:0.2 }} className="overflow-hidden">
            <div className="px-4 pb-4 flex flex-col gap-3 border-t border-border-subtle pt-3">
              {success ? <p className="text-sm text-success font-body font-semibold text-center py-2">✓ Chave válida. A transferência foi iniciada.</p> : (
                <>
                  <div>
                    <p className="text-sm text-ink-secondary font-body mb-1">Este documento está protegido. Introduza a chave de verificação para transferir o PDF finalizado.</p>
                    <p className="text-xs text-ink-muted font-body">Onde encontrar a chave? No email de conclusão enviado a todos os participantes.</p>
                  </div>
                  <Input type="text" placeholder="Chave de verificação (24 caracteres)" value={key} onChange={e => { setKey(e.target.value); setError(null) }} error={error ?? undefined} autoCapitalize="none" autoCorrect="off" spellCheck={false}/>
                  <Button fullWidth loading={loading} disabled={key.trim().length === 0} onClick={handleDownload}>Verificar e transferir</Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function VerifyPage() {
  const params         = useParams()
  const verificationId = typeof params.verificationId === 'string' ? params.verificationId : ''
  const [state,    setState]    = useState<VerificationPageState|null>(null)
  const [loading,  setLoading]  = useState(true)
  const [contractId, setContractId] = useState<string|null>(null)

  useEffect(() => {
    if (!verificationId) return
    fetch(`/api/verify/${verificationId}`)
      .then(res => res.json())
      .then((data: Record<string,unknown>) => {
        const st = data.state as string
        if (st === 'valid') {
          setState({ state:'valid', data: { verificationId: data.verificationId as string, contractTitle: data.contractTitle as string, finalizedAt: new Date(data.finalizedAt as string), signerCount: data.signerCount as number, sha256Hash: data.sha256HashFull as string, signers: (data.signers as Array<{name:string;signedAt:string}>) ?? [], isPubliclyVerifiable:true, revokedAt:null, documentAccessMode: data.documentAccessMode as 'key_required'|'owner_only'|'public' } })
          fetch(`/api/verify/${verificationId}/contract-id`).then(r => r.ok ? r.json() as Promise<{contractId?:string}> : Promise.reject()).then(d => setContractId(d.contractId ?? null)).catch(() => {})
        } else if (st === 'revoked') setState({ state:'revoked', revokedAt: new Date(data.revokedAt as string), contractTitle: data.contractTitle as string })
        else if (st === 'not_found') setState({ state:'not_found' })
        else setState({ state:'inconclusive', reason: data.reason as string|undefined })
      })
      .catch(() => setState({ state:'inconclusive', reason:'Erro de rede.' }))
      .finally(() => setLoading(false))
  }, [verificationId])

  if (loading) return <PageLoadingState label="A verificar documento…"/>

  const stateKey = state?.state ?? 'inconclusive'
  const cfg = STATE_CONFIG[stateKey]
  const Icon = cfg.Icon

  return (
    <PublicShell>
      <div className="flex flex-col gap-6 py-8">

        {/* Status banner */}
        <motion.div variants={fadeUpVariants} initial="initial" animate="animate"
          className={`rounded-2xl border p-5 flex items-center gap-4 ${cfg.bg} ${cfg.border}`}>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-white/60 shadow-sm`}>
            <Icon size={26} className={cfg.color}/>
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-display text-base font-bold leading-tight ${cfg.color}`}>{cfg.label}</p>
            {verificationId && <p className="text-xs font-mono text-ink-muted mt-1 truncate">{formatVerificationId(verificationId)}</p>}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {state?.state === 'valid' && (
            <motion.div key="valid" variants={listContainerVariants} initial="initial" animate="animate" className="flex flex-col gap-4">

              {/* Certificate card */}
              <motion.div variants={listItemVariants} className="rounded-2xl bg-surface border border-border shadow-sm overflow-hidden">
                {/* Top gradient strip */}
                <div className="h-1.5" style={{ background:'linear-gradient(90deg,#0033FF,#977DFF)' }}/>
                <div className="p-5 flex flex-col gap-4">
                  <div>
                    <p className="text-2xs text-ink-muted uppercase tracking-widest font-body mb-1">Título do contrato</p>
                    <p className="text-base font-body font-bold text-ink-primary">{state.data.contractTitle}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border-subtle">
                    <div><p className="text-2xs text-ink-muted uppercase tracking-widest font-body">Finalizado</p><p className="text-sm text-ink-primary font-body font-semibold mt-0.5">{formatDate(state.data.finalizedAt)}</p></div>
                    <div><p className="text-2xs text-ink-muted uppercase tracking-widest font-body">Signatários</p><p className="text-sm text-ink-primary font-body font-semibold mt-0.5">{state.data.signerCount}</p></div>
                  </div>
                </div>
              </motion.div>

              {/* Integrity hash */}
              <motion.div variants={listItemVariants} className="rounded-2xl bg-surface border border-border shadow-xs p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck size={14} className="text-success shrink-0"/>
                  <p className="text-2xs text-ink-muted uppercase tracking-widest font-body">Hash SHA-256</p>
                </div>
                <p className="hash-display text-2xs text-ink-secondary break-all">{state.data.sha256Hash}</p>
              </motion.div>

              {/* Signers */}
              {state.data.signers.length > 0 && (
                <motion.div variants={listItemVariants} className="rounded-2xl bg-surface border border-border shadow-xs p-4">
                  <p className="text-2xs text-ink-muted uppercase tracking-widest font-body mb-3">Assinaturas</p>
                  <div className="flex flex-col gap-3">
                    {state.data.signers.map((s,i) => (
                      <div key={i} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-success shrink-0"/><p className="text-sm font-body text-ink-primary">{s.name}</p></div>
                        <p className="text-xs text-ink-muted font-body shrink-0">{formatDate(s.signedAt)}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Document access */}
              {contractId && (
                <motion.div variants={listItemVariants}>
                  <KeyAccessPanel contractId={contractId} accessMode={state.data.documentAccessMode}/>
                </motion.div>
              )}
            </motion.div>
          )}

          {state?.state === 'revoked' && (
            <motion.div key="revoked" variants={fadeUpVariants} initial="initial" animate="animate" className="rounded-2xl bg-surface border border-border shadow-sm p-5 flex flex-col gap-2">
              <p className="text-base font-body font-bold text-ink-primary">{state.contractTitle}</p>
              <p className="text-sm text-ink-secondary font-body">Este documento foi revogado em {formatDateTime(state.revokedAt)}.</p>
              <p className="text-xs text-ink-muted font-body mt-1">Contacte o emissor para mais informações.</p>
            </motion.div>
          )}

          {state?.state === 'not_found' && (
            <motion.div key="nf" variants={fadeUpVariants} initial="initial" animate="animate" className="rounded-2xl bg-surface border border-border shadow-sm p-5 text-center flex flex-col gap-2">
              <p className="text-sm text-ink-secondary font-body">Não foi encontrado nenhum documento com este ID de verificação.</p>
              <p className="text-xs text-ink-muted font-body">Verifique se o ID está correcto ou contacte o emissor.</p>
            </motion.div>
          )}

          {state?.state === 'inconclusive' && (
            <motion.div key="inc" variants={fadeUpVariants} initial="initial" animate="animate" className="rounded-2xl bg-surface border border-border shadow-sm p-5 flex flex-col gap-2">
              <p className="text-sm text-ink-primary font-body font-semibold">Não foi possível confirmar a autenticidade deste documento de forma definitiva.</p>
              {state.reason && <p className="text-xs text-ink-muted font-body">{state.reason}</p>}
              <p className="text-xs text-ink-muted font-body mt-1">Se recebeu este documento recentemente, aguarde alguns minutos e tente novamente.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PublicShell>
  )
}
