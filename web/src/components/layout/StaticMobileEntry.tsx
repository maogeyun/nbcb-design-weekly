'use client';

import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  PREFER_DESKTOP_COOKIE,
  normalizePathname,
  toMobileHref,
  withTrailingSlash,
} from '@/lib/app-link';
import { isStaticExportMode } from '@/lib/public-data-client';

const MOBILE_UA_RE =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i;

const SKIP_PREFIXES = ['/m', '/admin', '/api', '/_next', '/static-data'];

function shouldSkip(pathname: string): boolean {
  if (pathname.includes('.')) return true;
  const path = normalizePathname(pathname);
  // Skill package/markdown files live under /skills/*.* (caught by `.` above).
  // The skills index page itself should still redirect to /m/skills.
  if (path.startsWith('/skills/') && path !== '/skills') return true;
  return SKIP_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setPreferDesktopCookie() {
  document.cookie = `${PREFER_DESKTOP_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

/**
 * Static hosting cannot run Next middleware. Mirror the mobile UA redirect
 * client-side when NEXT_PUBLIC_STATIC_EXPORT=1.
 */
export function StaticMobileEntry() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (!isStaticExportMode()) return;

    if (searchParams.get('desktop') === '1') {
      setPreferDesktopCookie();
      const next = new URLSearchParams(searchParams.toString());
      next.delete('desktop');
      const query = next.toString();
      const target = query
        ? `${withTrailingSlash(pathname)}?${query}`
        : withTrailingSlash(pathname);
      router.replace(target);
      return;
    }

    if (shouldSkip(pathname)) return;
    if (readCookie(PREFER_DESKTOP_COOKIE) === '1') return;
    if (typeof navigator === 'undefined' || !MOBILE_UA_RE.test(navigator.userAgent)) {
      return;
    }

    const query = searchParams.toString();
    const mobilePath = toMobileHref(pathname);
    const target = query ? `${mobilePath}?${query}` : mobilePath;
    router.replace(target);
  }, [pathname, router, searchParams]);

  return null;
}
