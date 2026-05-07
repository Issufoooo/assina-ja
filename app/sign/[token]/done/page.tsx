'use client'
import { useSearchParams } from 'next/navigation'
import { PublicShell } from '@/components/layout/PublicShell'
import { FullPageSuccess } from '@/components/ui/SuccessState'
import { Button } from '@/components/ui/Button'
import { ExternalLink } from 'lucide-react'

export default function SignDonePage() {
  const verificationId = useSearchParams().get('vid')
  return (
    <PublicShell hideBrand>
      <FullPageSuccess
        title="Documento assinado!"
        description="A sua assinatura foi registada com sucesso. O emissor será notificado."
        referenceId={verificationId ?? undefined}
        action={verificationId ? (
          <Button variant="secondary" fullWidth iconRight={<ExternalLink size={15}/>}
            onClick={() => window.open(`${process.env.NEXT_PUBLIC_APP_URL}/verify/${verificationId}`,'_blank','noopener,noreferrer')}>
            Ver certificado de verificação
          </Button>
        ) : undefined}
      />
    </PublicShell>
  )
}
