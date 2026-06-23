import type { Article, ArticleCategory } from '@/types';
import { CATEGORY_ORDER } from '@/lib/constants';

export function parseArticleCategory(value: string | null): ArticleCategory | null {
  if (!value) return null;
  return CATEGORY_ORDER.includes(value as ArticleCategory)
    ? (value as ArticleCategory)
    : null;
}

export function truncateIntro(text: string, max = 100): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}…`;
}

export function filterArticlesByCategory(
  articles: Article[],
  category?: ArticleCategory | null,
): Article[] {
  if (!category) return articles;
  return articles.filter((a) => a.category === category);
}
