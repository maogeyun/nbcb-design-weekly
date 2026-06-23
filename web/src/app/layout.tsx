import type { Metadata } from 'next';
import { AntdProvider } from '@/components/providers/AntdProvider';
import { AppShell } from '@/components/layout/AppShell';
import { SITE_NAME, SITE_TAGLINE } from '@/lib/constants';
import './globals.css';

export const metadata: Metadata = {
  title: SITE_NAME,
  description: SITE_TAGLINE,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <AntdProvider>
          <AppShell>{children}</AppShell>
        </AntdProvider>
      </body>
    </html>
  );
}
