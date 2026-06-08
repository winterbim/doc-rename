import { NextResponse, type NextRequest } from 'next/server';
import {
  ACCESS_COOKIE_NAME,
  getAccessCookieValue,
  isAccessProtectionEnabled,
  isValidAccessPassword,
  normalizeNextPath,
} from '@/lib/access-control';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const password = formData.get('password');
  const nextPath = normalizeNextPath(formData.get('next'));

  if (!isAccessProtectionEnabled()) {
    return NextResponse.redirect(new URL(nextPath, request.url), { status: 303 });
  }

  if (!isValidAccessPassword(password)) {
    const accessUrl = new URL('/access', request.url);
    accessUrl.searchParams.set('error', '1');
    accessUrl.searchParams.set('next', nextPath);
    return NextResponse.redirect(accessUrl, { status: 303 });
  }

  const response = NextResponse.redirect(new URL(nextPath, request.url), { status: 303 });
  response.cookies.set({
    name: ACCESS_COOKIE_NAME,
    value: getAccessCookieValue(),
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
