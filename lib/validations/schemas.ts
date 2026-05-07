import { z } from 'zod'

export const addSignerSchema = z.object({
  fullName: z.string().min(2).max(120).trim(),
  email:    z.string().email().toLowerCase().trim().nullable().optional(),
  phone:    z.string().min(7).max(30).trim().nullable().optional(),
}).refine((d) => d.email != null || d.phone != null, {
  message: 'Indique email ou telefone', path: ['email'],
})

export const createContractSchema = z.object({
  title:           z.string().min(2).max(200).trim(),
  description:     z.string().max(1000).trim().optional().nullable(),
  originalPdfPath: z.string().min(1),
  expiresAt:       z.string().datetime().optional().nullable(),
  signers:         z.array(addSignerSchema).min(1).max(20),
})

export const otpSendSchema   = z.object({ signingToken: z.string().uuid() })
export const otpVerifySchema = z.object({
  signingToken: z.string().uuid(),
  code: z.string().length(6).regex(/^\d{6}$/),
})

export const signatureSubmitSchema = z.object({
  signingToken:  z.string().uuid(),
  signatureData: z.string().min(1).max(500_000),
  signatureType: z.enum(['drawn', 'typed']),
})

export type CreateContractInput  = z.infer<typeof createContractSchema>
export type AddSignerInput       = z.infer<typeof addSignerSchema>
export type OtpSendInput         = z.infer<typeof otpSendSchema>
export type OtpVerifyInput       = z.infer<typeof otpVerifySchema>
export type SignatureSubmitInput  = z.infer<typeof signatureSubmitSchema>
