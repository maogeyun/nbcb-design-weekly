'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { AppShell } from './AppShell';
import { IOSAppShell } from '@/components/ios/IOSAppShell';
import { StaticMobileEntry } from './StaticMobileEntry';
import { normalizePathname } from '@/lib/app-link';

export function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const path = normalizePathname(pathname);

  if (path.startsWith('/admin')) {
    return <>{children}</>;
  }

  return (
    <>
      <Suspense fallback={null}>
        <StaticMobileEntry />
      </Suspense>
      {path === '/m' || path.startsWith('/m/') ? (
        <IOSAppShell>{children}</IOSAppShell>
      ) : (
        <AppShell>{children}</AppShell>
      )}
    </>
  );
}
