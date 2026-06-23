'use client';

import { Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { resolveBreadcrumbs } from '@/lib/breadcrumb-routes';
import { useBreadcrumbContextPageData } from './BreadcrumbProvider';
import { SiteBreadcrumb } from './SiteBreadcrumb';

function BreadcrumbBarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pageData = useBreadcrumbContextPageData();

  const items = resolveBreadcrumbs({
    pathname,
    searchParams,
    pageData,
  });

  if (!items || items.length === 0) {
    return null;
  }

  return <SiteBreadcrumb items={items} />;
}

export function BreadcrumbBar() {
  return (
    <Suspense fallback={null}>
      <BreadcrumbBarContent />
    </Suspense>
  );
}
