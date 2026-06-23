'use client';

import { Flex, Typography } from 'antd';
import type { IssueSummary } from '@/types';
import { buildHeroSubtitle } from '@/lib/home-utils';
import { brandTokens } from '@/lib/tokens';

const { Title, Text } = Typography;

interface HomeHeroBannerProps {
  issue: IssueSummary;
}

export function HomeHeroBanner({ issue }: HomeHeroBannerProps) {
  const subtitle = buildHeroSubtitle(issue);

  return (
    <section
      style={{
        background: brandTokens.colorHeroBg,
        padding: '64px 24px',
      }}
      className="home-hero"
    >
      <Flex
        vertical
        align="center"
        gap={24}
        style={{ maxWidth: brandTokens.layoutMaxWidth, margin: '0 auto' }}
      >
        <Flex vertical align="center" gap={8}>
          <span
            style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: 100,
              background: 'rgba(255, 166, 47, 0.13)',
              color: brandTokens.colorPrimary,
              fontSize: 12,
              lineHeight: '20px',
              fontWeight: 400,
            }}
          >
            NEW ISSUE
          </span>
          <Title
            level={1}
            style={{
              margin: 0,
              fontSize: 38,
              lineHeight: '46px',
              fontWeight: 600,
              textAlign: 'center',
            }}
          >
            第 {issue.issue_number} 期 · {issue.publish_date}
          </Title>
        </Flex>

        <Flex vertical align="center" gap={12}>
          <Text
            style={{
              fontSize: 16,
              lineHeight: '24px',
              color: brandTokens.colorTextSecondary,
              textAlign: 'center',
            }}
          >
            {subtitle}
          </Text>
          <span
            style={{
              display: 'block',
              width: 60,
              height: 4,
              borderRadius: 2,
              background: brandTokens.colorPrimary,
            }}
          />
        </Flex>
      </Flex>
    </section>
  );
}
