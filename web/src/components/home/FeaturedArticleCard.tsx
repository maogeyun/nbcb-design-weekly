'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Flex, Typography } from 'antd';
import type { Article } from '@/types';
import { buildAppHref } from '@/lib/app-link';
import { brandTokens } from '@/lib/tokens';
import { ReadOriginalButton } from '@/components/ReadOriginalButton';
import { ArticleAttachmentDownload } from '@/components/ArticleAttachmentDownload';

const { Paragraph } = Typography;

const cardShadow =
  '0 6px 16px rgba(0,0,0,0.08), 0 3px 6px -4px rgba(0,0,0,0.12), 0 9px 28px 8px rgba(0,0,0,0.05)';

/** 与 Figma article-grid Card 节点一致 */
export const FEATURED_ARTICLE_CARD_HEIGHT = 342;
const FEATURED_ARTICLE_TITLE_SECTION_HEIGHT = 108;
const FEATURED_ARTICLE_BODY_SECTION_HEIGHT = 234;

interface FeaturedArticleCardProps {
  article: Article;
  issueId: string;
  issueNumber: number;
}

export function FeaturedArticleCard({
  article,
  issueId,
  issueNumber,
}: FeaturedArticleCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <article
      className="featured-article-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        height: FEATURED_ARTICLE_CARD_HEIGHT,
        borderRadius: brandTokens.borderRadiusXL,
        border: `1px solid ${hovered ? brandTokens.colorPrimary : brandTokens.colorBorderSecondary}`,
        background: brandTokens.colorBgContainer,
        boxShadow: cardShadow,
        overflow: 'hidden',
        transition: 'border-color 0.2s ease',
      }}
    >
      <Link
        href={buildAppHref(`/article/${article.id}`, {
          from: 'home',
          issueId,
          issueNumber,
        })}
        style={{
          textDecoration: 'none',
          color: 'inherit',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        <Flex
          vertical
          style={{
            height: FEATURED_ARTICLE_TITLE_SECTION_HEIGHT,
            padding: 24,
            flexShrink: 0,
            overflow: 'hidden',
          }}
        >
          <Paragraph
            strong
            ellipsis={{ rows: 2, tooltip: article.title }}
            style={{
              marginBottom: 0,
              height: 60,
              fontSize: 20,
              lineHeight: 1.5,
              fontWeight: 500,
              color: brandTokens.colorText,
              wordBreak: 'break-word',
            }}
          >
            {article.title}
          </Paragraph>
        </Flex>

        <div
          style={{
            height: FEATURED_ARTICLE_BODY_SECTION_HEIGHT,
            padding: '0 24px 24px',
            flexShrink: 0,
            overflow: 'hidden',
          }}
        >
          <Paragraph
            ellipsis={{ rows: 10, tooltip: article.introduction }}
            style={{
              marginBottom: 0,
              fontSize: 14,
              lineHeight: 1.5,
              color: brandTokens.colorText,
              wordBreak: 'break-word',
            }}
          >
            {article.introduction}
          </Paragraph>
        </div>
      </Link>

      <div
        className="featured-article-card__hover"
        aria-hidden={!hovered}
        style={{
          position: 'absolute',
          left: -1,
          right: -1,
          bottom: -1,
          height: 106,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.92) 40%, #fff 100%)',
          backdropFilter: 'blur(2px)',
          opacity: hovered ? 1 : 0,
          pointerEvents: hovered ? 'auto' : 'none',
          transition: 'opacity 0.2s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Flex gap={12} align="center">
          <div onClick={(e) => e.stopPropagation()}>
            <ReadOriginalButton
              url={article.original_url}
              linkStatus={article.link_status}
              articleId={article.id}
              size="middle"
              label="查看原文"
              showIcon={false}
            />
          </div>
          {article.attachment && (
            <div onClick={(e) => e.stopPropagation()}>
              <ArticleAttachmentDownload
                attachment={article.attachment}
                size="middle"
              />
            </div>
          )}
        </Flex>
      </div>
    </article>
  );
}
