'use client';

import { useEffect, useState } from 'react';
import type { IssueHomePreview } from '@/types';
import { SITE_NAME, SITE_TAGLINE } from '@/lib/constants';
import { buildHeroSubtitle, buildArchiveStatsText } from '@/lib/home-utils';
import { buildMobileHref } from '@/lib/app-link';
import { fetchLatestIssuePreview } from '@/lib/public-data-client';
import { IOSNavBar, IOSScrollSentinel } from '@/components/ios/IOSNavBar';
import { IOSGroupedList, IOSListCell, IOSSectionHeader, IOSFeedRow } from '@/components/ios/IOSGroupedList';
import { IOSButton } from '@/components/ios/IOSButton';
import { IOSToast, useIosToast } from '@/components/ios/IOSToast';

function HomeSkeleton() {
  return (
    <>
      <div className="ios-skeleton" />
      <div className="ios-skeleton" />
      <div className="ios-skeleton" />
    </>
  );
}

export default function MobileHomePage() {
  const [latest, setLatest] = useState<IssueHomePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { message, show: showToast } = useIosToast();

  useEffect(() => {
    fetchLatestIssuePreview()
      .then((data) => {
        setLatest(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  const handleShare = async () => {
    if (!latest) return;
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}${buildMobileHref(`/weekly/${latest.id}`)}`,
      );
      showToast('链接已复制');
    } catch {
      showToast('复制失败');
    }
  };

  return (
    <div id="ios-scroll-root">
      <IOSNavBar largeTitle={SITE_NAME} />
      <IOSScrollSentinel />

      <p className="ios-text-subhead" style={{ margin: '0 16px 16px' }}>
        {SITE_TAGLINE}
      </p>

      {loading && <HomeSkeleton />}
      {error && <div className="ios-empty">加载失败，请稍后刷新重试</div>}
      {!loading && !error && !latest && (
        <div className="ios-empty">首期周刊筹备中，敬请期待</div>
      )}

      {!loading && latest && (
        <>
          <section className="ios-hero">
            <span className="ios-hero-badge">最新一期</span>
            <h2 className="ios-text-title2">第 {latest.issue_number} 期</h2>
            <p className="ios-text-subhead" style={{ marginTop: 8 }}>
              {latest.publish_date} · {buildHeroSubtitle(latest)}
            </p>
            <div style={{ marginTop: 16 }}>
              <IOSButton variant="borderedProminent" onClick={handleShare}>
                分享本期
              </IOSButton>
            </div>
          </section>

          <IOSSectionHeader>精选文章</IOSSectionHeader>
          <IOSGroupedList>
            {latest.preview_articles.map((article) => (
              <IOSFeedRow
                key={article.id}
                title={article.title}
                body={article.introduction}
                category={article.category}
                meta={`${article.source_name} · ${article.published_at}`}
                href={buildMobileHref(`/article/${article.id}`, {
                  from: 'home',
                  issueId: latest.id,
                  issueNumber: latest.issue_number,
                })}
              />
            ))}
          </IOSGroupedList>

          <IOSSectionHeader>更多</IOSSectionHeader>
          <IOSGroupedList>
            <IOSListCell
              title="查看全部文章"
              subtitle={buildArchiveStatsText(latest.article_count, latest.category_counts)}
              href={buildMobileHref(`/weekly/${latest.id}`, { from: 'home' })}
            />
            <IOSListCell title="周刊归档" subtitle="浏览历史期刊" href="/m/archive" />
          </IOSGroupedList>
        </>
      )}

      <IOSToast message={message} />
    </div>
  );
}
