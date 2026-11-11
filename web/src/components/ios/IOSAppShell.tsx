'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { IOSTabBar } from './IOSTabBar';
import { fetchLatestIssueId } from '@/lib/public-data-client';
import '@/app/ios-mobile.css';

const HIDE_TAB_PATHS = ['/m/article/', '/m/weekly/'];

export function IOSAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [latestIssueId, setLatestIssueId] = useState<string | null>(null);

  const hideTabBar = HIDE_TAB_PATHS.some((p) => pathname.startsWith(p));

  useEffect(() => {
    try {
      const cached = localStorage.getItem('latestIssueId');
      if (cached) setLatestIssueId(cached);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchLatestIssueId()
      .then((id) => {
        if (cancelled || !id) return;
        setLatestIssueId(id);
        try {
          localStorage.setItem('latestIssueId', id);
        } catch {
          // ignore
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className={`ios-app ios-app-shell${hideTabBar ? ' ios-app-shell--no-tab' : ''}`}>
      <main className="ios-app-main">{children}</main>
      {!hideTabBar && <IOSTabBar latestIssueId={latestIssueId} />}
    </div>
  );
}
