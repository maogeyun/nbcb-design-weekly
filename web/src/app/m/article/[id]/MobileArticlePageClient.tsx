'use client';

import { useSearchParams } from 'next/navigation';
import type { Article, LinkStatus } from '@/types';
import { buildMobileHref, parseBreadcrumbContext } from '@/lib/app-link';
import { isStaticExportMode } from '@/lib/public-data-client';
import { IOSNavBar, IOSScrollSentinel } from '@/components/ios/IOSNavBar';
import { IOSCategoryTag } from '@/components/ios/IOSGroupedList';
import { IOSButton } from '@/components/ios/IOSButton';
import { IOSToast, useIosToast } from '@/components/ios/IOSToast';

function IOSReadOriginalButton({
  url,
  linkStatus,
  articleId,
}: {
  url: string;
  linkStatus: LinkStatus;
  articleId: string;
}) {
  const broken = linkStatus === 'link_broken' || !url.trim();

  const handleClick = async () => {
    if (broken) return;
    if (!isStaticExportMode()) {
      try {
        await fetch(`/api/articles/${articleId}/click`, { method: 'POST' });
      } catch {
        // non-blocking
      }
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <IOSButton
      variant="borderedProminent"
      block
      disabled={broken}
      onClick={handleClick}
    >
      {broken ? '原文链接不可用' : '阅读原文'}
    </IOSButton>
  );
}

export function MobileArticlePageClient({
  article,
  issueId,
  issueNumber,
}: {
  article: Article;
  issueId: string;
  issueNumber: number;
}) {
  const searchParams = useSearchParams();
  const ctx = parseBreadcrumbContext(searchParams);
  const { message, show: showToast } = useIosToast();

  const weeklyFrom =
    ctx.from === 'weekly' && ctx.weeklyFrom === 'archive'
      ? 'archive'
      : ctx.from === 'archive'
        ? 'archive'
        : 'home';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('链接已复制');
    } catch {
      showToast('复制失败');
    }
  };

  return (
    <div id="ios-scroll-root" style={{ paddingBottom: 100 }}>
      <IOSNavBar showBack largeTitle={article.title} />
      <IOSScrollSentinel />

      <div className="ios-page-pad">
        <IOSCategoryTag category={article.category} />
        <p className="ios-text-subhead" style={{ marginTop: 12 }}>
          {article.source_name} · {article.published_at} ·{' '}
          {article.language === 'zh' ? '中文' : '英文'}
        </p>

        <p className="ios-text-body" style={{ marginTop: 16 }}>
          {article.introduction}
        </p>

        {article.link_status === 'link_broken' && (
          <p className="ios-text-footnote" style={{ marginTop: 12, wordBreak: 'break-all' }}>
            原文链接暂时无法访问：{article.original_url}
          </p>
        )}

        <p className="ios-text-footnote" style={{ marginTop: 16 }}>
          本文由 AI 辅助摘要，请访问原文获取完整内容
        </p>

        <div className="ios-actions-stack">
          <IOSButton
            variant="borderless"
            href={buildMobileHref(`/weekly/${issueId}`, {
              from: weeklyFrom === 'archive' ? 'archive' : 'home',
            })}
          >
            返回第 {issueNumber} 期
          </IOSButton>
          <IOSButton variant="borderless" onClick={handleCopy}>
            复制链接
          </IOSButton>
        </div>
      </div>

      <div className="ios-bottom-bar ios-bottom-bar--no-tab ios-glass-toolbar">
        <IOSReadOriginalButton
          url={article.original_url}
          linkStatus={article.link_status}
          articleId={article.id}
        />
        {article.attachment && (
          <a
            href={article.attachment.url}
            download={article.attachment.original_name}
            target="_blank"
            rel="noopener noreferrer"
            className="ios-button ios-button--tinted"
            style={{ flexShrink: 0 }}
          >
            附件
          </a>
        )}
      </div>

      <IOSToast message={message} />
    </div>
  );
}
