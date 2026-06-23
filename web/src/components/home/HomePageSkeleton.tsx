'use client';

import { Flex, Skeleton } from 'antd';
import { FEATURED_ARTICLE_CARD_HEIGHT } from '@/components/home/FeaturedArticleCard';
import { brandTokens } from '@/lib/tokens';

export function HomePageSkeleton() {
  return (
    <div style={{ width: '100%' }}>
      <section
        style={{
          background: brandTokens.colorHeroBg,
          padding: '64px 24px',
        }}
      >
        <Flex vertical align="center" gap={24}>
          <Skeleton.Input active style={{ width: 90, height: 28 }} />
          <Skeleton.Input active style={{ width: 480, height: 46 }} />
          <Skeleton.Input active style={{ width: 313, height: 24 }} />
        </Flex>
      </section>
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
          <Flex align="center" justify="space-between">
            <Skeleton.Input active style={{ width: 180, height: 38 }} />
            <Skeleton.Input active style={{ width: 75, height: 22 }} />
          </Flex>
          <div className="home-article-grid">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  height: FEATURED_ARTICLE_CARD_HEIGHT,
                  borderRadius: brandTokens.borderRadiusXL,
                  padding: 24,
                  border: `1px solid ${brandTokens.colorBorderSecondary}`,
                  boxShadow:
                    '0 6px 16px rgba(0,0,0,0.08), 0 3px 6px -4px rgba(0,0,0,0.12), 0 9px 28px 8px rgba(0,0,0,0.05)',
                }}
              >
                <Skeleton active paragraph={{ rows: 5 }} />
              </div>
            ))}
          </div>
          <Flex vertical align="center" gap={24}>
            <Skeleton.Button active style={{ width: 280, height: 52 }} />
            <Skeleton.Input active style={{ width: 299, height: 20 }} />
          </Flex>
        </Flex>
      </section>
    </div>
  );
}
