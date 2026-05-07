'use client'
import { useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { DocumentAccessResponse, ApiError } from '@/types/api'

export function ContractDetailClient({ contractId }: { contractId: string }) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string|null>(null)

  const handleDownload = async () => {
    setLoading(true); setError(null)
    try {
      const res = await fetch(`/api/documents/${contractId}/access`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ context:'owner' }) })
      if (!res.ok) { const d = await res.json() as ApiError; throw new Error(d.error ?? 'Erro') }
      const { signedUrl } = await res.json() as DocumentAccessResponse
      window.open(signedUrl, '_blank', 'noopener,noreferrer')
    } catch (err) { setError(err instanceof Error ? err.message : 'Erro') }
    finally { setLoading(false) }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button variant="secondary" size="sm" loading={loading} iconLeft={<Download size={14}/>} onClick={handleDownload}>Transferir PDF final</Button>
      {error && <p className="text-xs text-danger font-body">{error}</p>}
    </div>
  )
}
