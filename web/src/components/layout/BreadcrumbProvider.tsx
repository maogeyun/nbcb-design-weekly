'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { BreadcrumbPageData } from '@/lib/breadcrumb-routes';

interface BreadcrumbContextValue {
  pageData: BreadcrumbPageData | null;
  setPageData: (data: BreadcrumbPageData | null) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null);

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [pageData, setPageData] = useState<BreadcrumbPageData | null>(null);
  const value = useMemo(
    () => ({ pageData, setPageData }),
    [pageData],
  );

  return (
    <BreadcrumbContext.Provider value={value}>{children}</BreadcrumbContext.Provider>
  );
}

export function useBreadcrumbPageData() {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error('useBreadcrumbPageData must be used within BreadcrumbProvider');
  }
  return context;
}

/** Inject dynamic breadcrumb data for weekly/article pages. */
export function BreadcrumbPageData({ data }: { data: BreadcrumbPageData }) {
  const { setPageData } = useBreadcrumbPageData();

  useEffect(() => {
    setPageData(data);
    return () => setPageData(null);
  }, [data.issueNumber, data.issueId, data.title, setPageData]);

  return null;
}

export function useBreadcrumbContextPageData() {
  const context = useContext(BreadcrumbContext);
  return context?.pageData ?? null;
}
