// middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('accessToken')?.value;

  //console.log(`MIDDLEWARE: Path: ${pathname}, Token Exists: ${!!token}`);

  //const isPublicAuthPath = pathname.startsWith('/login') || pathname.startsWith('/verify-otp') || pathname.startsWith('/');
  
  // A list of all your top-level protected routes
  const protectedPaths = 
  [ 
    '/dashboard', 
    '/backoffice',
    '/backoffice/transactions', 
    '/backoffice/dashboard',
    '/backoffice/user-accounts',
    '/backoffice/special-limits',
    '/backoffice/reconciliation',
    '/backoffice/financial-metrics',
    '/backoffice/customer-analytics',
    '/backoffice/compliance-risk',
    '/backoffice/operational-efficiency',
    '/backoffice/transactions', 


    //fx routes
    '/fx-navigator',
    '/fx-navigator/dashboard',
    '/fx-navigator/rate-manager',

    //omnisupport
    '/omnisupport',
    '/omnisupport/whatsapp',
    '/omnisupport/sms',
    '/omnisupport/in-app',

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

  return NextResponse.next();
}

// THIS IS THE CRITICAL FIX: The new matcher
export const config = {
  matcher: [
   
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};