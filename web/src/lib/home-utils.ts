import type { CategoryCounts, IssueSummary } from '@/types';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '@/lib/constants';

export function buildHeroSubtitle(issue: IssueSummary): string {
  if (issue.cover_summary?.trim()) {
    return issue.cover_summary.trim();
  }
  const themes = CATEGORY_ORDER.filter(
    (c) => issue.category_counts[c] > 0,
  ).map((c) => CATEGORY_LABELS[c]);
  if (themes.length === 0) return '本周精选文章';
  return `本周精选：${themes.join(' · ')}`;
}

export function buildArchiveStatsText(
  articleCount: number,
  counts: CategoryCounts,
): string {
  const themes = CATEGORY_ORDER.filter((c) => counts[c] > 0).map(
    (c) => CATEGORY_LABELS[c],
  );
  const themePart =
    themes.length > 0 ? `，涵盖 ${themes.join('、')}` : '';
  return `共收录 ${articleCount} 篇精选文章${themePart}`;
}
