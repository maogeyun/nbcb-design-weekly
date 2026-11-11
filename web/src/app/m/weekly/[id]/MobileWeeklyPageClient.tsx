'use client';

import { useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { ArticleCategory, IssueDetail } from '@/types';
import { CATEGORY_LABELS } from '@/lib/constants';
import { buildMobileHref } from '@/lib/app-link';
import { filterArticlesByCategory, parseArticleCategory } from '@/lib/article-utils';
import { IOSNavBar } from '@/components/ios/IOSNavBar';
import { IOSSegmentedControl } from '@/components/ios/IOSSegmentedControl';
import { IOSGroupedList, IOSFeedRow, IOSListCell } from '@/components/ios/IOSGroupedList';
import { IOSToast, useIosToast } from '@/components/ios/IOSToast';

function buildWeeklyHref(
  issueId: string,
  from: string | null,
  category?: ArticleCategory,
): string {
  const base = buildMobileHref(`/weekly/${issueId}`, {
    from: from === 'archive' ? 'archive' : from === 'home' ? 'home' : undefined,
  });
  if (!category) return base;
  const separator = base.includes('?') ? '&' : '?';
  return `${base}${separator}category=${category}`;
}

export function MobileWeeklyPageClient({ issue }: { issue: IssueDetail }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCategory = searchParams.get('category');
  const from = searchParams.get('from');
  const category = parseArticleCategory(rawCategory);
  const { message, show: showToast } = useIosToast();

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
    { key: 'all' as const, label: '全部' },
    ...(['ui_design', 'design_experience', 'ai_frontier'] as ArticleCategory[]).map(
      (c) => ({ key: c, label: CATEGORY_LABELS[c] }),
    ),
  ];

  const activeKey = category ?? 'all';

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(
        window.location.origin + buildWeeklyHref(issue.id, from, category ?? undefined),
      );
      showToast('链接已复制');
    } catch {
      showToast('复制失败');
    }
  };

  return (
    <div>
      <IOSNavBar
        showBack
        title={`第 ${issue.issue_number} 期`}
        rightLabel="分享"
        onRightClick={handleShare}
      />

      <p className="ios-text-subhead ios-page-pad">
        {issue.publish_date} · 共 {issue.article_count} 篇
      </p>

      {issue.cover_summary && (
        <p className="ios-callout-cell">{issue.cover_summary}</p>
      )}

      <IOSSegmentedControl
        items={tabItems}
        activeKey={activeKey}
        onChange={(key) => {
          router.replace(
            buildWeeklyHref(issue.id, from, key === 'all' ? undefined : key),
          );
        }}
      />

      {filtered.length === 0 ? (
        <div className="ios-empty">
          本期暂无{category ? CATEGORY_LABELS[category] : ''}文章
        </div>
      ) : (
        <IOSGroupedList>
          {filtered.map((article) => (
            <IOSFeedRow
              key={article.id}
              title={article.title}
              body={article.introduction}
              category={article.category}
              href={buildMobileHref(`/article/${article.id}`, {
                from: 'weekly',
                issueId: issue.id,
                issueNumber: issue.issue_number,
                weeklyFrom: from === 'archive' ? 'archive' : 'home',
              })}
            />
          ))}
        </IOSGroupedList>
      )}

      <div className="ios-page-pad" style={{ paddingTop: 16, paddingBottom: 24 }}>
        <IOSGroupedList>
          <IOSListCell title="查看归档" href="/m/archive" />
        </IOSGroupedList>
      </div>

      <IOSToast message={message} />
    </div>
  );
}
