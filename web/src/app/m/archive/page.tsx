'use client';

import { useEffect, useState } from 'react';
import type { IssueSummary } from '@/types';
import { CATEGORY_LABELS } from '@/lib/constants';
import { buildMobileHref } from '@/lib/app-link';
import { fetchPublishedIssues } from '@/lib/public-data-client';
import { IOSNavBar } from '@/components/ios/IOSNavBar';
import { IOSGroupedList, IOSListCell } from '@/components/ios/IOSGroupedList';

export default function MobileArchivePage() {
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

  return (
    <div>
      <IOSNavBar largeTitle="周刊归档" />
      <p className="ios-text-subhead ios-page-pad">按发布时间倒序</p>

      {loading && (
        <>
          <div className="ios-skeleton" />
          <div className="ios-skeleton" />
        </>
      )}

      {!loading && issues.length === 0 && (
        <div className="ios-empty">暂无已发布周刊</div>
      )}

      {!loading && issues.length > 0 && (
        <IOSGroupedList>
          {issues.map((issue) => {
            const { category_counts: c } = issue;
            const isPublished = issue.status === 'published';
            const subtitle = [
              issue.publish_date,
              `${issue.article_count} 篇`,
              issue.cover_summary?.trim(),
              `${CATEGORY_LABELS.ui_design} ${c.ui_design} · ${CATEGORY_LABELS.design_experience} ${c.design_experience} · ${CATEGORY_LABELS.ai_frontier} ${c.ai_frontier}`,
            ]
              .filter(Boolean)
              .join(' · ');

            return (
              <IOSListCell
                key={issue.id}
                title={`第 ${issue.issue_number} 期${!isPublished ? '（已下线）' : ''}`}
                subtitle={subtitle}
                href={
                  isPublished
                    ? buildMobileHref(`/weekly/${issue.id}`, { from: 'archive' })
                    : undefined
                }
                showChevron={isPublished}
              />
            );
          })}
        </IOSGroupedList>
      )}
    </div>
  );
}
