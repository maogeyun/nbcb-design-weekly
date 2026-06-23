'use client';

import Link from 'next/link';
import { Breadcrumb } from 'antd';
import type { BreadcrumbItem } from '@/lib/breadcrumbs';

interface SiteBreadcrumbProps {
  items: BreadcrumbItem[];
}

export function SiteBreadcrumb({ items }: SiteBreadcrumbProps) {
  return (
    <span suppressHydrationWarning>
      <Breadcrumb
        style={{ marginBottom: 8 }}
        items={items.map((item) => ({
          title: item.href ? (
            <Link href={item.href} suppressHydrationWarning>{item.label}</Link>
          ) : (
            <span
              title={item.title}
              style={{
                display: 'inline-block',
                maxWidth: 'min(40vw, 320px)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                verticalAlign: 'bottom',
              }}
              suppressHydrationWarning
            >
              {item.label}
            </span>
          ),
        }))}
      />
    </span>
  );
}
