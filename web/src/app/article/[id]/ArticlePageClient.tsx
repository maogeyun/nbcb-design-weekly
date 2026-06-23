'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { App, Button, Card, Flex, Space, Typography } from 'antd';
import type { Article } from '@/types';
import { buildAppHref, parseBreadcrumbContext } from '@/lib/app-link';
import { CategoryTag } from '@/components/CategoryTag';
import { ReadOriginalButton } from '@/components/ReadOriginalButton';
import { ArticleAttachmentDownload } from '@/components/ArticleAttachmentDownload';
import { brandTokens } from '@/lib/tokens';

const { Title, Paragraph, Text } = Typography;

export function ArticlePageClient({
  article,
  issueId,
  issueNumber,
}: {
  article: Article;
  issueId: string;
  issueNumber: number;
}) {
  const { message } = App.useApp();
  const searchParams = useSearchParams();
  const ctx = parseBreadcrumbContext(searchParams);
  const weeklyFrom =
    ctx.from === 'weekly' && ctx.weeklyFrom === 'archive'
      ? 'archive'
      : ctx.from === 'archive'
        ? 'archive'
        : 'home';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      message.success('链接已复制');
    } catch {
      message.error('复制失败');
    }
  };

  return (
    <Flex vertical gap={16}>
      <CategoryTag category={article.category} />
      <Title level={2} style={{ margin: 0 }}>
        {article.title}
      </Title>
      <Text type="secondary">
        {article.source_name} · {article.published_at} ·{' '}
        {article.language === 'zh' ? '中文' : '英文'}
      </Text>

      <Card
        variant="borderless"
        style={{
          borderRadius: brandTokens.borderRadiusLG,
          background: brandTokens.colorBgContainer,
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        }}
      >
        <Paragraph style={{ marginBottom: 0, fontSize: 16, lineHeight: 1.8 }}>
          {article.introduction}
        </Paragraph>
      </Card>

      <ReadOriginalButton
        url={article.original_url}
        linkStatus={article.link_status}
        articleId={article.id}
        size="large"
        block
      />

      {article.attachment && (
        <ArticleAttachmentDownload
          attachment={article.attachment}
          size="large"
          block
        />
      )}

      {article.link_status === 'link_broken' && (
        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
          原文链接暂时无法访问，您可复制链接后手动打开：
          <br />
          <Text copyable>{article.original_url}</Text>
        </Paragraph>
      )}

      <Space>
        <Link
          href={buildAppHref(`/weekly/${issueId}`, {
            from: weeklyFrom === 'archive' ? 'archive' : 'home',
          })}
        >
          <Button>返回第 {issueNumber} 期</Button>
        </Link>
        <Button onClick={handleCopy}>复制链接</Button>
      </Space>

      <Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 0 }}>
        本文由 AI 辅助摘要，请访问原文获取完整内容
      </Paragraph>
    </Flex>
  );
}
