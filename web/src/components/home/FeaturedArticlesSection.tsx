'use client';

import Link from 'next/link';
import { Flex, Skeleton, Typography } from 'antd';
import { motion, useReducedMotion } from 'framer-motion';
import type { Article } from '@/types';
import { buildAppHref } from '@/lib/app-link';
import { brandTokens } from '@/lib/tokens';
import {
  FEATURED_ARTICLE_CARD_HEIGHT,
  FeaturedArticleCard,
} from './FeaturedArticleCard';

const { Title, Text } = Typography;

interface FeaturedArticlesSectionProps {
  issueId: string;
  issueNumber: number;
  articles: Article[];
}

export function FeaturedArticlesSection({
  issueId,
  issueNumber,
  articles,
}: FeaturedArticlesSectionProps) {
  const prefersReducedMotion = useReducedMotion();

  if (articles.length === 0) return null;

  return (
    <section style={{ width: '100%' }}>
      <Flex
        align="center"
        justify="space-between"
        style={{ marginBottom: 60 }}
      >
        <Title
          level={2}
          style={{ margin: 0, fontSize: 30, lineHeight: '38px', fontWeight: 600 }}
        >
          本期精选文章
        </Title>
        <Link
          href={buildAppHref(`/weekly/${issueId}`, { from: 'home' })}
          style={{
            color: brandTokens.colorPrimary,
            fontSize: 14,
            lineHeight: '22px',
            textDecoration: 'none',
          }}
        >
          查看全部{' '}
          <motion.span
            whileHover={prefersReducedMotion ? {} : { x: 4 }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { type: 'spring', stiffness: 380, damping: 26 }
            }
            style={{ display: 'inline-block' }}
          >
            →
          </motion.span>
        </Link>
      </Flex>

      <div className="home-article-grid">
        {articles.map((article) => (
          <FeaturedArticleCard
            key={article.id}
            article={article}
            issueId={issueId}
            issueNumber={issueNumber}
          />
        ))}
      </div>
    </section>
  );
}

export function FeaturedArticlesSectionSkeleton() {
  return (
    <section style={{ width: '100%' }}>
      <Flex align="center" justify="space-between" style={{ marginBottom: 60 }}>
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
              border: `1px solid ${brandTokens.colorBorderSecondary}`,
              boxShadow:
                '0 6px 16px rgba(0,0,0,0.08), 0 3px 6px -4px rgba(0,0,0,0.12), 0 9px 28px 8px rgba(0,0,0,0.05)',
              overflow: 'hidden',
              padding: 24,
            }}
          >
            <Skeleton active paragraph={{ rows: 6 }} />
          </div>
        ))}
      </div>
    </section>
  );
}
