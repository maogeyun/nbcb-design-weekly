import type { Article, Skill } from '@/types';
import { filterSkillsByKeyword } from '@/lib/skill-utils';
import { isStaticExportMode } from '@/lib/public-data-client';

export interface SearchHit {
  article: Article;
  issue_number: number;
  issue_id: string;
}

export interface SearchResults {
  articles: SearchHit[];
  skills: Skill[];
}

interface SearchIndex {
  articles: SearchHit[];
  skills: Skill[];
}

let cachedIndex: SearchIndex | null = null;

function searchPublishedArticles(index: SearchIndex, query: string): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return index.articles.filter(({ article }) => {
    const haystack =
      `${article.title} ${article.introduction} ${article.source_name}`.toLowerCase();
    return haystack.includes(q);
  });
}

async function loadSearchIndex(): Promise<SearchIndex> {
  if (cachedIndex) return cachedIndex;

  if (isStaticExportMode()) {
    const res = await fetch('/static-data/search-index.json');
    if (!res.ok) {
      throw new Error('Failed to load search index');
    }
    cachedIndex = (await res.json()) as SearchIndex;
    return cachedIndex;
  }

  const res = await fetch('/api/search?q=');
  if (!res.ok) {
    throw new Error('Failed to load search index');
  }
  const json = await res.json();
  cachedIndex = (json.data ?? { articles: [], skills: [] }) as SearchIndex;
  return cachedIndex;
}

export async function searchPublicContent(query: string): Promise<SearchResults> {
  if (!isStaticExportMode()) {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) {
      throw new Error('Search failed');
    }
    const json = await res.json();
    return (json.data ?? { articles: [], skills: [] }) as SearchResults;
  }

  const index = await loadSearchIndex();
  return {
    articles: searchPublishedArticles(index, query),
    skills: filterSkillsByKeyword(index.skills, query),
  };
}
