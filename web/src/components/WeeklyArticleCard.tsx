'use client';

import Link from 'next/link';
import { Button, Card, Flex, Space, Typography } from 'antd';
import { motion, useReducedMotion } from 'framer-motion';
import type { Article } from '@/types';
import type { WeeklyFrom } from '@/lib/app-link';
import { buildAppHref } from '@/lib/app-link';
import { truncateIntro } from '@/lib/article-utils';
import { brandTokens } from '@/lib/tokens';
import { CategoryTag } from './CategoryTag';
import { ReadOriginalButton } from './ReadOriginalButton';
import { ArticleAttachmentDownload } from './ArticleAttachmentDownload';

const { Text, Paragraph } = Typography;

interface WeeklyArticleCardProps {
  article: Article;
  issueId: string;
  issueNumber: number;
  weeklyFrom: WeeklyFrom;
}

export function WeeklyArticleCard({
  article,
  issueId,
  issueNumber,
  weeklyFrom,
}: WeeklyArticleCardProps) {
  const articleHref = buildAppHref(`/article/${article.id}`, {
    from: 'weekly',
    issueId,
    issueNumber,
    weeklyFrom,
  });
  const prefersReducedMotion = useReducedMotion();

  const baseShadow = '0 1px 2px rgba(0,0,0,0.04)';
  const hoverShadow =
    '0 8px 24px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)';

  return (
    <motion.div
      whileHover={
        prefersReducedMotion ? {} : { y: -4, boxShadow: hoverShadow }
      }
      whileTap={
        prefersReducedMotion ? {} : { scale: 0.997 }
      }
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { type: 'spring', stiffness: 400, damping: 30 }
      }
      style={{
        marginBottom: 16,
        borderRadius: brandTokens.borderRadiusLG,
        boxShadow: baseShadow,
      }}
    >
      <Card
        variant="borderless"
        hoverable={false}
        styles={{
          body: { padding: 20 },
        }}
        style={{
          borderRadius: brandTokens.borderRadiusLG,
          background: brandTokens.colorBgContainer,
        }}
      >
        <Flex vertical gap={8}>
          <CategoryTag category={article.category} />
          <Link href={articleHref} style={{ textDecoration: 'none' }}>
            <Text
              strong
              style={{
                fontSize: 16,
                lineHeight: 1.5,
                color: brandTokens.colorText,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {article.title}
            </Text>
          </Link>
          <Paragraph
            type="secondary"
            ellipsis={{ rows: 3 }}
            style={{ marginBottom: 0 }}
          >
            {truncateIntro(article.introduction, 120)}
          </Paragraph>
          <Text type="secondary" style={{ fontSize: 13 }}>
            {article.source_name} · {article.published_at}
          </Text>
          <Flex justify="space-between" align="center" wrap="wrap" gap={8}>
            <Link href={articleHref}>
              <Button size="small">查看介绍</Button>
            </Link>
            <Space wrap size={8}>
              {article.attachment && (
                <ArticleAttachmentDownload attachment={article.attachment} size="small" />
              )}
              <ReadOriginalButton
                url={article.original_url}
                linkStatus={article.link_status}
                articleId={article.id}
                size="small"
              />
            </Space>
          </Flex>
        </Flex>
      </Card>
    </motion.div>
  );
}
