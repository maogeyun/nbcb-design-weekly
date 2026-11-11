import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { PREFER_DESKTOP_COOKIE } from '@/lib/app-link';

const MOBILE_UA_RE =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i;

const SKIP_PREFIXES = ['/m', '/admin', '/api', '/_next', '/static-data', '/skills/'];

function shouldSkip(pathname: string): boolean {
  if (pathname.includes('.')) return true;
  return SKIP_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (searchParams.get('desktop') === '1') {
    const url = request.nextUrl.clone();
    url.searchParams.delete('desktop');
    const response = NextResponse.redirect(url);
    response.cookies.set(PREFER_DESKTOP_COOKIE, '1', {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    });
    return response;
  }

  if (shouldSkip(pathname)) {
    return NextResponse.next();
  }

  if (request.cookies.get(PREFER_DESKTOP_COOKIE)?.value === '1') {
    return NextResponse.next();
  }

  const ua = request.headers.get('user-agent') ?? '';
  if (!MOBILE_UA_RE.test(ua)) {
    return NextResponse.next();
  }

  const mobileUrl = request.nextUrl.clone();
  mobileUrl.pathname = pathname === '/' ? '/m' : `/m${pathname}`;
  return NextResponse.redirect(mobileUrl);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
