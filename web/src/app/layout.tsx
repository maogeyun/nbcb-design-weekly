import type { Metadata } from 'next';
import { AntdProvider } from '@/components/providers/AntdProvider';
import { PublicShell } from '@/components/layout/PublicShell';
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
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <AntdProvider>
          <PublicShell>{children}</PublicShell>
        </AntdProvider>
      </body>
    </html>
  );
}
