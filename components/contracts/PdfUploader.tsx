'use client'
import { useCallback, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, X, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fadeUpVariants, springSmooth } from '@/lib/motion'

export interface PdfUploaderProps { onUploadComplete: (storagePath: string, file: File) => void; onError?: (message: string) => void; disabled?: boolean }

export function PdfUploader({ onUploadComplete, onError, disabled = false }: PdfUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [state,    setState]    = useState<'idle'|'uploading'|'done'|'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [fileName, setFileName] = useState<string|null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string|null>(null)

  const handleFile = useCallback(async (file: File) => {
    setErrorMsg(null)
    if (file.type !== 'application/pdf') { const m='Apenas ficheiros PDF são aceites.'; setErrorMsg(m); setState('error'); onError?.(m); return }
    if (file.size > 10*1024*1024) { const m='O ficheiro não pode exceder 10 MB.'; setErrorMsg(m); setState('error'); onError?.(m); return }
    setFileName(file.name); setState('uploading'); setProgress(10)
    try {
      const urlRes = await fetch('/api/contracts/upload-url', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ fileName: file.name, fileSizeBytes: file.size, mimeType: 'application/pdf' }) })
      if (!urlRes.ok) throw new Error('Erro ao obter URL de upload.')
      const { uploadUrl, storagePath } = await urlRes.json() as { uploadUrl:string; storagePath:string }
      setProgress(40)
      const uploadRes = await fetch(uploadUrl, { method:'PUT', headers:{'Content-Type':'application/pdf'}, body: file })
      if (!uploadRes.ok) throw new Error('Falha no upload. Tente novamente.')
      setProgress(100); setState('done'); onUploadComplete(storagePath, file)
    } catch (err) { const m = err instanceof Error ? err.message : 'Erro desconhecido.'; setErrorMsg(m); setState('error'); onError?.(m) }
  }, [onUploadComplete, onError])

  const handleDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragOver(false); if (!disabled) { const f=e.dataTransfer.files[0]; if (f) handleFile(f) } }, [disabled, handleFile])

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {(state === 'idle' || state === 'error') && (
          <motion.div key="drop" variants={fadeUpVariants} initial="initial" animate="animate"
            onClick={() => !disabled && inputRef.current?.click()}
            onDrop={handleDrop} onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragOver(true) }} onDragLeave={() => setDragOver(false)}
            role="button" tabIndex={disabled ? -1 : 0} aria-label="Clique ou arraste um PDF"
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click() }}
            className={cn('flex flex-col items-center justify-center gap-3 min-h-[160px] rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary',
              dragOver ? 'border-primary bg-primary-dim scale-[1.01]' : 'border-border hover:border-primary/40 hover:bg-surface-dark',
              disabled && 'opacity-50 cursor-not-allowed',
              state === 'error' && 'border-danger/40 bg-danger-dim')}>
            <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center', state==='error' ? 'bg-danger-dim' : 'bg-surface shadow-xs')}>
              {state === 'error' ? <X size={22} className="text-danger"/> : <Upload size={22} className="text-ink-muted"/>}
            </div>
            <div className="text-center px-4">
              {state === 'error'
                ? <><p className="text-sm font-body font-semibold text-danger">{errorMsg}</p><p className="text-xs text-ink-muted mt-1">Clique para tentar novamente</p></>
                : <><p className="text-sm font-body font-semibold text-ink-primary">{dragOver ? 'Solte o ficheiro aqui' : 'Seleccione ou arraste um PDF'}</p><p className="text-xs text-ink-muted mt-1">Máximo 10 MB · Apenas PDF</p></>}
            </div>
            <input ref={inputRef} type="file" accept="application/pdf" onChange={e => { const f=e.target.files?.[0]; if (f) handleFile(f); e.target.value='' }} disabled={disabled} className="sr-only" />
          </motion.div>
        )}
        {state === 'uploading' && (
          <motion.div key="uploading" variants={fadeUpVariants} initial="initial" animate="animate" className="rounded-2xl border border-border bg-surface shadow-sm p-5 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-dim flex items-center justify-center shrink-0"><FileText size={18} className="text-primary"/></div>
              <div className="flex-1 min-w-0"><p className="text-sm font-body font-semibold text-ink-primary truncate">{fileName}</p><p className="text-xs text-ink-muted">A carregar…</p></div>
            </div>
            <div className="h-1.5 rounded-full bg-primary-dim overflow-hidden">
              <motion.div className="h-full rounded-full origin-left" style={{ background:'linear-gradient(90deg,#0033FF,#977DFF)', transformOrigin:'left' }} animate={{ scaleX: progress/100 }} transition={springSmooth} />
            </div>
          </motion.div>
        )}
        {state === 'done' && (
          <motion.div key="done" variants={fadeUpVariants} initial="initial" animate="animate" className="rounded-2xl border border-success/20 bg-success-dim p-5 flex items-center gap-3">
            <CheckCircle2 size={20} className="text-success shrink-0"/>
            <div className="flex-1 min-w-0"><p className="text-sm font-body font-semibold text-ink-primary truncate">{fileName}</p><p className="text-xs text-success font-semibold">Upload concluído</p></div>
            <button onClick={() => { setState('idle'); setProgress(0); setFileName(null); setErrorMsg(null) }} aria-label="Remover ficheiro" className="p-1.5 rounded-lg text-ink-muted hover:text-danger hover:bg-danger-dim transition-colors"><X size={16}/></button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
