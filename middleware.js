import { NextResponse } from 'next/server'

export function middleware(request) {
  // Token'ı localStorage'dan kontrol et
  const token = request.cookies.get('token')?.value

  // Eğer token yoksa ve korumalı bir route'a erişmeye çalışıyorsa
  if (!token) {
    // Sign-in sayfasına yönlendir
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  return NextResponse.next()
}

// Middleware'in çalışacağı path'leri belirt
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - sign-in (sign in page)
     * - sign-up (sign up page)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sign-in|sign-up).*)',
  ],
} 