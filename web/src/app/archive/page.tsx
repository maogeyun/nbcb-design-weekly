'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card, Empty, Flex, Skeleton, Space, Tag, Typography } from 'antd';
import { motion, useReducedMotion } from 'framer-motion';
import type { IssueSummary } from '@/types';
import { CATEGORY_LABELS } from '@/lib/constants';
import { buildAppHref } from '@/lib/app-link';
import { brandTokens } from '@/lib/tokens';
import { fetchPublishedIssues } from '@/lib/public-data-client';
import { PageHeader } from '@/components/layout/PageHeader';

const { Text, Paragraph } = Typography;

export default function ArchivePage() {
  const [issues, setIssues] = useState<IssueSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublishedIssues()
      .then((data) => {
        setIssues(data ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Flex vertical gap={16}>
        <PageHeader title="周刊归档" description="按发布时间倒序" />
        <Skeleton active paragraph={{ rows: 6 }} />
      </Flex>
    );
  }

  return (
    <Flex vertical gap={16}>
      <PageHeader title="周刊归档" description="按发布时间倒序" />

      {issues.length === 0 ? (
        <Empty description="暂无已发布周刊" />
      ) : (
        <Flex vertical gap={12}>
          {issues.map((issue) => (
            <ArchiveItemCard key={issue.id} issue={issue} />
          ))}
        </Flex>
      )}
    </Flex>
  );
}

function ArchiveItemCard({ issue }: { issue: IssueSummary }) {
  const { category_counts: c } = issue;
  const isPublished = issue.status === 'published';
  const prefersReducedMotion = useReducedMotion();

  const cardContent = (
    <Flex vertical gap={6}>
      <Space>
        <Text strong style={{ fontSize: 16 }}>
          第 {issue.issue_number} 期
        </Text>
        {!isPublished && <Tag>已下线</Tag>}
      </Space>
      <Text type="secondary">
        {issue.publish_date} · {issue.article_count} 篇
      </Text>
      {issue.cover_summary?.trim() && (
        <Paragraph
          type="secondary"
          ellipsis={{ rows: 3 }}
          style={{ marginBottom: 0, fontSize: 13, lineHeight: 1.5 }}
        >
          {issue.cover_summary.trim()}
        </Paragraph>
      )}
      <Text type="secondary" style={{ fontSize: 13 }}>
        {CATEGORY_LABELS.ui_design} {c.ui_design} ·{' '}
        {CATEGORY_LABELS.design_experience} {c.design_experience} ·{' '}
        {CATEGORY_LABELS.ai_frontier} {c.ai_frontier}
      </Text>
    </Flex>
  );

  // 非发布状态：不可交互，不加 hover 动效
  if (!isPublished) {
    return (
      <Card
        hoverable={false}
        variant="borderless"
        style={{
          borderRadius: brandTokens.borderRadiusLG,
          opacity: 0.6,
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        }}
      >
        {cardContent}
      </Card>
    );
  }

  // 已发布：可点击卡片，增加专业 hover 动效
  const baseShadow = '0 1px 2px rgba(0,0,0,0.04)';
  const hoverShadow =
    '0 8px 24px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)';

  return (
    <Link
      href={buildAppHref(`/weekly/${issue.id}`, { from: 'archive' })}
      style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
    >
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
          borderRadius: brandTokens.borderRadiusLG,
          boxShadow: baseShadow,
        }}
      >
        <Card
          hoverable={false}
          variant="borderless"
          style={{
            borderRadius: brandTokens.borderRadiusLG,
            background: brandTokens.colorBgContainer,
          }}
        >
          {cardContent}
        </Card>
      </motion.div>
    </Link>
  );
}
