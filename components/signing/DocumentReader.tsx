'use client'
import { useRef, useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { springSmooth } from '@/lib/motion'

export function DocumentReader({ pdfUrl, onScrollComplete, alreadyRead=false }: { pdfUrl: string; onScrollComplete: () => void; alreadyRead?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(alreadyRead ? 1 : 0)
  const [unlocked, setUnlocked] = useState(alreadyRead)
  const notifiedRef = useRef(alreadyRead)

  const handleScroll = useCallback(() => {
    const el = containerRef.current; if (!el) return
    const scrollHeight = el.scrollHeight - el.clientHeight
    if (scrollHeight <= 0) { if (!notifiedRef.current) { notifiedRef.current=true; setProgress(1); setUnlocked(true); onScrollComplete() } return }
    const pct = Math.min(el.scrollTop / scrollHeight, 1); setProgress(pct)
    if (pct >= 0.9 && !notifiedRef.current) { notifiedRef.current=true; setUnlocked(true); onScrollComplete() }
  }, [onScrollComplete])

  useEffect(() => { handleScroll() }, [handleScroll])

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="h-1 rounded-full bg-primary-dim overflow-hidden" role="progressbar" aria-valuenow={Math.round(progress*100)} aria-valuemin={0} aria-valuemax={100} aria-label="Progresso de leitura">
        <motion.div className="h-full rounded-full origin-left" style={{ background:'linear-gradient(90deg,#0033FF,#977DFF)', transformOrigin:'left' }} animate={{ scaleX: progress }} transition={springSmooth}/>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-ink-muted font-body">{unlocked ? 'Documento lido' : 'Role para ler o documento'}</p>
        {!unlocked && <p className="text-xs text-ink-muted font-body">{Math.round(progress*100)}%</p>}
      </div>
      <div ref={containerRef} onScroll={handleScroll} className="w-full overflow-y-auto overscroll-contain rounded-2xl border border-border bg-surface shadow-sm pdf-container" style={{ height:420 }} tabIndex={0} aria-label="Conteúdo do documento">
        <iframe src={`${pdfUrl}#toolbar=0&navpanes=0`} title="Contrato para assinatura" className="w-full" style={{ height:800, border:'none', display:'block' }} loading="lazy"/>
      </div>
      {!unlocked && <p className="text-xs text-ink-muted text-center font-body py-1">Role até ao fim para continuar</p>}
    </div>
  )
}
