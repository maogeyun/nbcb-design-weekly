import type { Article, ArticleCategory } from '@/types';
import { introStatusTagStyles } from '@/lib/tokens';

export type IntroStatus = keyof typeof introStatusTagStyles;

export type IntroFilter = 'all' | 'reviewed' | 'pending' | 'empty';
export type CandidateSortKey =
  | 'published_at_desc'
  | 'published_at_asc'
  | 'title_asc'
  | 'title_desc'
  | 'source_asc';

export interface CandidateFilterState {
  keyword: string;
  categoryFilter: ArticleCategory | 'all';
  sourceFilter: string;
  introFilter: IntroFilter;
  sortKey: CandidateSortKey;
}

export const DEFAULT_CANDIDATE_FILTERS: CandidateFilterState = {
  keyword: '',
  categoryFilter: 'all',
  sourceFilter: 'all',
  introFilter: 'all',
  sortKey: 'published_at_desc',
};

export function getIntroStatus(article: Article): IntroStatus {
  if (article.intro_reviewed) return 'reviewed';
  if (article.introduction) return 'pending';
  return 'empty';
}

export function introStatusLabel(article: Article): string {
  return introStatusTagStyles[getIntroStatus(article)].label;
}

export function getCandidateSources(candidates: Article[]): string[] {
  return [...new Set(candidates.map((item) => item.source_name))].sort();
}

export function filterAndSortCandidates(
  candidates: Article[],
  filters: CandidateFilterState,
): Article[] {
  let rows = [...candidates];
  const kw = filters.keyword.trim().toLowerCase();

  if (kw) {
    rows = rows.filter(
      (item) =>
        item.title.toLowerCase().includes(kw) ||
        item.source_name.toLowerCase().includes(kw),
    );
  }
  if (filters.categoryFilter !== 'all') {
    rows = rows.filter((item) => item.category === filters.categoryFilter);
  }
  if (filters.sourceFilter !== 'all') {
    rows = rows.filter((item) => item.source_name === filters.sourceFilter);
  }
  if (filters.introFilter === 'reviewed') {
    rows = rows.filter((item) => item.intro_reviewed);
  } else if (filters.introFilter === 'pending') {
    rows = rows.filter((item) => !item.intro_reviewed && item.introduction);
  } else if (filters.introFilter === 'empty') {
    rows = rows.filter((item) => !item.introduction);
  }

  rows.sort((a, b) => {
    switch (filters.sortKey) {
      case 'published_at_asc':
        return a.published_at.localeCompare(b.published_at);
      case 'title_asc':
        return a.title.localeCompare(b.title, 'zh-CN');
      case 'title_desc':
        return b.title.localeCompare(a.title, 'zh-CN');
      case 'source_asc':
        return a.source_name.localeCompare(b.source_name, 'zh-CN');
      default:
        return b.published_at.localeCompare(a.published_at);
    }
  });

  return rows;
}
