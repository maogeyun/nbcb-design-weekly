'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { App, Button, Empty, Flex, Space, Tabs, Typography } from 'antd';
import type { ArticleCategory, IssueDetail } from '@/types';
import { CATEGORY_LABELS } from '@/lib/constants';
import { buildAppHref } from '@/lib/app-link';
import { filterArticlesByCategory, parseArticleCategory } from '@/lib/article-utils';
import { WeeklyArticleCard } from '@/components/WeeklyArticleCard';
import { brandTokens } from '@/lib/tokens';

const { Title, Paragraph, Text } = Typography;

function buildWeeklyHref(
  issueId: string,
  from: string | null,
  category?: ArticleCategory,
): string {
  const base = buildAppHref(`/weekly/${issueId}`, {
    from: from === 'archive' ? 'archive' : from === 'home' ? 'home' : undefined,
  });
  if (!category) return base;
  const separator = base.includes('?') ? '&' : '?';
  return `${base}${separator}category=${category}`;
}

export function WeeklyPageClient({ issue }: { issue: IssueDetail }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCategory = searchParams.get('category');
  const from = searchParams.get('from');
  const category = parseArticleCategory(rawCategory);
  const { message } = App.useApp();

  useEffect(() => {
    if (rawCategory && !category) {
      router.replace(buildWeeklyHref(issue.id, from));
    }
  }, [rawCategory, category, issue.id, from, router]);

  const filtered = useMemo(
    () => filterArticlesByCategory(issue.articles, category),
    [issue.articles, category],
  );

  const tabItems = [
    { key: 'all', label: '全部' },
    ...(['ui_design', 'design_experience', 'ai_frontier'] as ArticleCategory[]).map(
      (c) => ({
        key: c,
        label: CATEGORY_LABELS[c],
      }),
    ),
  ];

  const activeKey = category ?? 'all';
  const weeklyFrom = from === 'archive' ? 'archive' : 'home';

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(
        window.location.origin + buildWeeklyHref(issue.id, from, category ?? undefined),
      );
      message.success('链接已复制');
    } catch {
      message.error('复制失败');
    }
  };

  return (
    <Flex vertical gap={16}>
      <div>
        <Title level={2} style={{ margin: 0 }}>
          第 {issue.issue_number} 期
        </Title>
        <Text type="secondary">
          {issue.publish_date} · 共 {issue.article_count} 篇
        </Text>
      </div>

      {issue.cover_summary && (
        <Paragraph
          style={{
            marginBottom: 0,
            padding: 16,
            borderRadius: brandTokens.borderRadiusLG,
            background: brandTokens.colorPrimaryBg,
            color: brandTokens.colorTextSecondary,
          }}
        >
          {issue.cover_summary}
        </Paragraph>
      )}

      <Tabs
        activeKey={activeKey}
        items={tabItems}
        onChange={(key) => {
          router.replace(
            buildWeeklyHref(
              issue.id,
              from,
              key === 'all' ? undefined : (key as ArticleCategory),
            ),
          );
        }}
      />

      {filtered.length === 0 ? (
        <Empty
          description={`本期暂无${category ? CATEGORY_LABELS[category] : ''}文章`}
        />
      ) : (
        filtered.map((article) => (
          <WeeklyArticleCard
            key={article.id}
            article={article}
            issueId={issue.id}
            issueNumber={issue.issue_number}
            weeklyFrom={weeklyFrom}
          />
        ))
      )}

      <Space style={{ marginTop: 8 }}>
        <Button onClick={handleShare}>分享本期链接</Button>
        <Link href="/archive">
          <Button>查看归档</Button>
        </Link>
      </Space>
    </Flex>
  );
}
