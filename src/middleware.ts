// middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  const publicPaths = ['/login', '/'];
  const isPublicPath = publicPaths.includes(pathname);

  // Allow access to public paths like /login
  if (isPublicPath) {
    return NextResponse.next();
  }
  // The 'next-router-state-tree' header is absent on direct navigation.
  const isDirectAccess = !request.headers.get('next-router-state-tree');
  
  // If accessing a protected route via direct URL, force redirect to login
  if (!isPublicPath && isDirectAccess) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // For internal navigation, check if the session token is valid
  if (!isPublicPath && !sessionToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// Configures which paths the middleware will run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    '/', // Also run on the root path
  ],
};