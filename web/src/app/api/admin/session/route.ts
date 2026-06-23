import { NextResponse } from 'next/server';
import {
  getAdminCredentials,
  isAdminAuthenticated,
  sessionCookieName,
  sessionCookieValue,
} from '@/lib/auth';

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = getAdminCredentials();

  if (body.email !== email || body.password !== password) {
    return NextResponse.json({ error: '账号或密码错误' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(sessionCookieName, sessionCookieValue, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 8 * 60 * 60,
    path: '/',
  });
  return response;
}

export async function GET() {
  const authed = await isAdminAuthenticated();
  return NextResponse.json({ authenticated: authed });
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(sessionCookieName);
  return response;
}
