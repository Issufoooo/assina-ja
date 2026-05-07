import { type EmailOtpType } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)

  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/dashboard'

  const supabase = createServerClient()

  if (code) {
    await supabase.auth.exchangeCodeForSession(code)
  } else if (token_hash && type) {
    await supabase.auth.verifyOtp({ type, token_hash })
  }

  return NextResponse.redirect(new URL(next, origin))
}