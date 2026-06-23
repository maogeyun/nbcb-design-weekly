import { cookies } from 'next/headers';

const SESSION_COOKIE = 'nbcb_admin_session';
const SESSION_VALUE = 'authenticated';

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value === SESSION_VALUE;
}

export function getAdminCredentials() {
  return {
    email: process.env.ADMIN_EMAIL ?? 'editor@nbcb.com',
    password: process.env.ADMIN_PASSWORD ?? 'nbcb2026',
  };
}

export const sessionCookieName = SESSION_COOKIE;
export const sessionCookieValue = SESSION_VALUE;
