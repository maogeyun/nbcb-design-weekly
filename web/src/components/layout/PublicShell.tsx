'use client';

import { usePathname } from 'next/navigation';
import { AppShell } from './AppShell';
import { IOSAppShell } from '@/components/ios/IOSAppShell';

export function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname.startsWith('/admin')) {
    return <>{children}</>;
  }

  if (pathname.startsWith('/m')) {
    return <IOSAppShell>{children}</IOSAppShell>;
  }

  return <AppShell>{children}</AppShell>;
}
