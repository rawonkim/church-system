import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/session'

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')
  const path = request.nextUrl.pathname

  // Public paths
  if (path === '/login' || path === '/register' || path === '/login/find') {
    if (session) {
      // Verify session before redirecting home
      const payload = await decrypt(session.value)
      if (payload) {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }
    return NextResponse.next()
  }

  // Protect all other routes
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Verify session integrity
  const payload = await decrypt(session.value)
  if (!payload) {
    // Invalid session, clear cookie and redirect
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('session')
    return response
  }

  // Admin only routes
  if (path.startsWith('/admin') || path.startsWith('/tax') || path.startsWith('/ledger')) {
    if (path.startsWith('/admin') || path.startsWith('/tax')) {
      if (payload.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
