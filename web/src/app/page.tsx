'use client';

import { Empty, Flex } from 'antd';
import { useEffect, useState } from 'react';
import type { IssueHomePreview } from '@/types';
import { SITE_TAGLINE } from '@/lib/constants';
import { brandTokens } from '@/lib/tokens';
import { fetchLatestIssuePreview } from '@/lib/public-data-client';
import { HomeHeroBanner } from '@/components/home/HomeHeroBanner';
import { FeaturedArticlesSection } from '@/components/home/FeaturedArticlesSection';
import { HomeArchiveCTA } from '@/components/home/HomeArchiveCTA';
import { HomePageSkeleton } from '@/components/home/HomePageSkeleton';

export default function HomePage() {
  const [latest, setLatest] = useState<IssueHomePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchLatestIssuePreview()
      .then((data) => {
        setLatest(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <HomePageSkeleton />;
  }

  if (error) {
    return (
      <Flex
        vertical
        align="center"
        justify="center"
        style={{ padding: '80px 24px', minHeight: 320 }}
      >
        <Empty description="加载失败，请稍后刷新重试" />
      </Flex>
    );
  }

  if (!latest) {
    return (
      <Flex
        vertical
        align="center"
        justify="center"
        style={{ padding: '80px 24px', minHeight: 320 }}
      >
        <Empty description="首期周刊筹备中，敬请期待">
          <p style={{ margin: 0, color: brandTokens.colorTextSecondary }}>
            {SITE_TAGLINE}
          </p>
        </Empty>
      </Flex>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <HomeHeroBanner issue={latest} />

      <section
        style={{
          background: brandTokens.colorBgContainer,
          padding: '64px 24px 64px',
        }}
      >
        <Flex
          vertical
          gap={60}
          style={{ maxWidth: brandTokens.layoutMaxWidth, margin: '0 auto' }}
        >
          <FeaturedArticlesSection
            issueId={latest.id}
            issueNumber={latest.issue_number}
            articles={latest.preview_articles}
          />
          <HomeArchiveCTA issue={latest} />
        </Flex>
      </section>
    </div>
  );
}
