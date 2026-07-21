import { NextResponse, type NextRequest } from 'next/server';
import { convexAuthNextjsMiddleware } from '@convex-dev/auth/nextjs/server';
import {
  ACCESS_COOKIE_NAME,
  isAccessProtectionEnabled,
  isValidAccessCookie,
} from '@/lib/access-control';

const PUBLIC_PATH_PREFIXES = [
  '/',
  '/access',
  '/api/access',
  '/privacy',
  '/favicon.ico',
  '/manifest.webmanifest',
  '/pdf.worker.min.mjs',
  '/libarchive-worker.js',
  '/libarchive.wasm',
];

function isPublicPath(pathname: string): boolean {
  return (
    PUBLIC_PATH_PREFIXES.some((path) =>
      path === '/' ? pathname === '/' : pathname === path || pathname.startsWith(`${path}/`),
    ) ||
    pathname.startsWith('/_next/') ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|ico)$/.test(pathname)
  );
}

const convexAuthMiddleware = convexAuthNextjsMiddleware(
  async (request) => {
    const { pathname, search } = request.nextUrl;

    if (!isAccessProtectionEnabled()) {
      return NextResponse.next();
    }

    const hasAccess = isValidAccessCookie(request.cookies.get(ACCESS_COOKIE_NAME)?.value);

    if (hasAccess && pathname === '/access') {
      return NextResponse.redirect(new URL('/app', request.url));
    }

    if (hasAccess || isPublicPath(pathname)) {
      return NextResponse.next();
    }

    const accessUrl = new URL('/access', request.url);
    accessUrl.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(accessUrl);
  },
  { apiRoute: '/api/auth' }
);

export function proxy(request: NextRequest) {
  // Second argument is Convex auth options bag; empty object is valid at runtime.
  return convexAuthMiddleware(request, {} as Parameters<typeof convexAuthMiddleware>[1]);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
