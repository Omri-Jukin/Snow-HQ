import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const TOKEN_COOKIE = 'studio_token'

export function middleware(request: NextRequest) {
  const requiredToken = process.env.STUDIO_ACCESS_TOKEN
  if (!requiredToken) return NextResponse.next()

  const url = new URL(request.url)
  const pathname = url.pathname

  // Allow auth route and API to pass
  if (pathname.startsWith('/api/studio/auth') || pathname.startsWith('/auth')) {
    return NextResponse.next()
  }

  const cookie = request.cookies.get(TOKEN_COOKIE)?.value
  if (cookie === requiredToken) return NextResponse.next()

  const loginUrl = new URL('/auth', request.url)
  loginUrl.searchParams.set('redirect', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/((?!_next|.*\\.\w+$).*)'],
}
