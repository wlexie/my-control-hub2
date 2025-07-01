// middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('accessToken')?.value;

  //console.log(`MIDDLEWARE: Path: ${pathname}, Token Exists: ${!!token}`);

  const isPublicAuthPath = pathname.startsWith('/login') || pathname.startsWith('/verify-otp');
  
  // A list of all your top-level protected routes
  const protectedPaths = 
  ['/dashboard', 
    '/backoffice/transactions', 
    '/backoffice/dashboard',
    '/backoffice/user-accounts',
    '/backoffice/special-limits',
    '/backoffice/reconciliation',
    '/backoffice/financial-metrics',
    '/backoffice/customer-analytics',
    '/backoffice/compliance-risk',
    '/backoffice/operational-efficiency',

    //fx routes
    '/fx-navigator/dashboard',
    '/fx-navigator/rate-manager',

    //omnisupport
    '/omnisupport',

    //access manager
    '/access-manager',
    '/access-manager/user-access',

    //promitto
    '/promitto/dashboard',
    '/promitto/all-transactions',


   ]; 
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isPublicAuthPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // If none of the above rules match, allow the request to proceed
  return NextResponse.next();
}

// THIS IS THE CRITICAL FIX: The new matcher
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     *
     * This is a more standard and robust way to apply middleware to most pages.
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};