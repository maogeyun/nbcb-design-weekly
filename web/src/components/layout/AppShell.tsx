'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Flex, Layout } from 'antd';
import { motion, useReducedMotion } from 'framer-motion';
import {
  BookOutlined,
  FileSearchOutlined,
  FolderOutlined,
  InfoCircleOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { MobileTabBar } from './MobileTabBar';
import { PageFooter } from './PageFooter';
import { SiteBrandLogo } from './SiteBrandLogo';
import { BreadcrumbBar } from './BreadcrumbBar';
import { BreadcrumbProvider } from './BreadcrumbProvider';
import { brandTokens } from '@/lib/tokens';

const { Header, Content } = Layout;

const NAV_ITEMS = [
  { key: '/weekly/current', label: '最新周刊', icon: <BookOutlined /> },
  { key: '/archive', label: '归档', icon: <FolderOutlined /> },
  { key: '/search', label: '搜索', icon: <FileSearchOutlined /> },
  { key: '/skills', label: '技能', icon: <ThunderboltOutlined /> },
  { key: '/about', label: '关于', icon: <InfoCircleOutlined /> },
];

function resolveSelectedKey(pathname: string, latestIssueId: string | null): string {
  if (pathname === '/' || pathname === '/weekly/current') {
    return '/weekly/current';
  }
  const weeklyMatch = pathname.match(/^\/weekly\/([^/?#]+)/);
  if (weeklyMatch) {
    const id = weeklyMatch[1];
    if (latestIssueId && id === latestIssueId) {
      return '/weekly/current';
    }
    return '';
  }
  if (pathname.startsWith('/search')) return '/search';
  if (pathname.startsWith('/skills')) return '/skills';
  return NAV_ITEMS.find((item) => pathname === item.key)?.key ?? '';
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const isAdmin = pathname.startsWith('/admin');

  const [latestIssueId, setLatestIssueId] = useState<string | null>(null);

  // Read any cached latestIssueId only on the client after hydration to avoid
  // server/client mismatch from the useState initializer (typeof window branch).
  useEffect(() => {
    try {
      const cached = localStorage.getItem('latestIssueId');
      if (cached) setLatestIssueId(cached);
    } catch {}
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/issues/latest')
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        const id = json?.data?.id;
        if (id && typeof id === 'string') {
          setLatestIssueId(id);
          try {
            localStorage.setItem('latestIssueId', id);
          } catch {}
        }
      })
      .catch(() => {
        // ignore fetch errors; keep cached value if any
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (isAdmin) {
    return <>{children}</>;
  }

  const selectedKey = resolveSelectedKey(pathname, latestIssueId);
  const isHome = pathname === '/';

  return (
    <BreadcrumbProvider>
      <Layout
      style={{
        minHeight: '100vh',
        background: brandTokens.colorBgLayout,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          padding: '0 24px',
          borderBottom: `1px solid ${brandTokens.colorBorder}`,
          background: brandTokens.colorBgContainer,
        }}
      >
        <Flex
          align="center"
          justify="space-between"
          style={{ maxWidth: brandTokens.layoutMaxWidth, margin: '0 auto', height: '100%' }}
        >
          <Link
            href="/"
            aria-label="宁波银行设计周刊"
            style={{ display: 'flex', alignItems: 'center', flexShrink: 0, textDecoration: 'none' }}
            suppressHydrationWarning
          >
            <SiteBrandLogo />
          </Link>
          <nav
            className="desktop-nav"
            style={{
              flex: 1,
              display: 'none',
              justifyContent: 'flex-end',
              minWidth: 360,
            }}
            suppressHydrationWarning
          >
            <Flex align="center" gap={28}>
              {NAV_ITEMS.map((item) => {
                const isActive = item.key === selectedKey;
                const href = item.key === '/weekly/current' ? '/' : item.key;
                return (
                  <Link
                    key={item.key}
                    href={href}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                    suppressHydrationWarning
                  >
                    <motion.div
                      whileHover={prefersReducedMotion ? {} : { y: -1 }}
                      whileTap={prefersReducedMotion ? {} : { scale: 0.985 }}
                      transition={
                        prefersReducedMotion
                          ? { duration: 0 }
                          : { type: 'spring', stiffness: 420, damping: 28 }
                      }
                      style={{
                        position: 'relative',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '2px 0 6px',
                        fontSize: 14,
                        lineHeight: '22px',
                        color: isActive ? brandTokens.colorPrimary : brandTokens.colorText,
                        fontWeight: isActive ? 500 : 400,
                        cursor: 'pointer',
                      }}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="desktop-nav-active"
                          style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            bottom: 0,
                            height: 2,
                            background: brandTokens.colorPrimary,
                            borderRadius: 1,
                          }}
                          transition={
                            prefersReducedMotion
                              ? { duration: 0 }
                              : { type: 'spring', stiffness: 380, damping: 30 }
                          }
                        />
                      )}
                    </motion.div>
                  </Link>
                );
              })}
            </Flex>
          </nav>
        </Flex>
      </Header>
      <Content
        className="app-main-content"
        style={{
          flex: 'none',
          padding: isHome ? 0 : '24px 16px 40px',
        }}
      >
        {isHome ? (
          children
        ) : (
          <div style={{ maxWidth: brandTokens.contentMaxWidth, margin: '0 auto' }} suppressHydrationWarning>
            <BreadcrumbBar />
            {children}
          </div>
        )}
      </Content>
      <div style={{ marginTop: 'auto', width: '100%' }}>
        <PageFooter />
      </div>
      <MobileTabBar latestIssueId={latestIssueId} />
    </Layout>
    </BreadcrumbProvider>
  );
}
