import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, type SessionData } from '@/lib/session';

export async function middleware(request: NextRequest) {
  const session = await getIronSession<SessionData>(request.cookies, sessionOptions);
  const { isLoggedIn } = session;
  const { pathname } = request.nextUrl;

  // If user is trying to access login page but is already logged in, redirect to home
  if (isLoggedIn && pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If user is trying to access a protected page and is not logged in, redirect to login
  if (!isLoggedIn && !pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - /uploads (user uploaded images)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|uploads).*)',
  ],
};
