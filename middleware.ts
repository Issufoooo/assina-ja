import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set() {},
        remove() {},
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  const isLandingPage = pathname === '/'
  const isAuthPage = pathname === '/login' || pathname === '/register'
  const isDashboardRoute =
    pathname === '/dashboard' || pathname.startsWith('/dashboard/')
  const isPublicRoute =
    isLandingPage ||
    isAuthPage ||
    pathname === '/auth/callback' ||
    pathname.startsWith('/sign/') ||
    pathname.startsWith('/verify/') ||
    pathname.startsWith('/api/') ||
    pathname === '/favicon.ico'

  if (isPublicRoute) {
    return response
  }

  if (isDashboardRoute && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}