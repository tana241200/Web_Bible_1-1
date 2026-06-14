import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token =
    request.cookies.get('access_token')?.value;

  const pathname =
    request.nextUrl.pathname;

  const publicRoutes = [
    '/login',
    '/register',
  ];

  const isPublic = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!token && !isPublic) {
    return NextResponse.redirect(
      new URL('/login', request.url)
    );
  }

  if (token && isPublic) {
    return NextResponse.redirect(
      new URL('/dashboard', request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Skip:
     * - API routes
     * - static files
     * - next internals
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};