import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function hasSupabaseAuthCookie(request: NextRequest) {
  return request.cookies
    .getAll()
    .some((cookie) => cookie.name.includes('sb-') && cookie.name.includes('-auth-token'));
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Protect explore route.
  if (pathname === '/explore') {
    if (!hasSupabaseAuthCookie(request)) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.searchParams.set('returnTo', `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/explore'],
};
