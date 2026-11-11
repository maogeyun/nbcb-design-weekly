import 'server-only';
import {
  getStoreMtime,
  loadStore,
  saveStore,
  type StoreData,
} from './persistence';
import { generateIntroductionDraft } from './intro-generator';
import {
  INTRO_MAX,
  INTRO_MIN,
  ISSUE_MAX_ARTICLES,
  ISSUE_MIN_ARTICLES,
} from './constants';
import { fetchAllRssFeeds, normalizeArticleUrl } from './rss-crawler';
import { removeArticleAttachmentFiles } from './article-attachments';
import type { FeedFetchResult } from './rss-crawler';
import type {
  Article,
  ArticleAttachment,
  ArticleCategory,
  CategoryCounts,
  IssueDetail,
  IssueHomePreview,
  IssueSummary,
  WeeklyIssue,
} from '@/types';

const HOME_PREVIEW_ARTICLE_COUNT = 3;

let _data: StoreData = loadStore();
let _dataMtime = getStoreMtime();

function touchStore(): void {
  const mtime = getStoreMtime();
  if (mtime !== _dataMtime) {
    _data = loadStore();
    _dataMtime = mtime;
  }
}

/** 跨 RSC / API 模块实例共享 store.json，读前自动同步磁盘 */
const data: StoreData = new Proxy({} as StoreData, {
  get(_target, prop) {
    touchStore();
    return (_data as unknown as Record<string | symbol, unknown>)[prop];
  },
});

function persist(): void {
  saveStore(_data);
  _dataMtime = getStoreMtime();
}

function countByCategory(articles: Article[]): CategoryCounts {
  return {
    ui_design: articles.filter((a) => a.category === 'ui_design').length,
    design_experience: articles.filter((a) => a.category === 'design_experience')
      .length,
    ai_frontier: articles.filter((a) => a.category === 'ai_frontier').length,
  };
}

function getIssueArticles(issue: WeeklyIssue): Article[] {
  return issue.article_ids
    .map((id) => data.articles.find((a) => a.id === id))
    .filter((a): a is Article => Boolean(a))
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

function nextId(prefix: string): string {
  const nums = data.articles
    .filter((a) => a.id.startsWith(prefix))
    .map((a) => parseInt(a.id.replace(prefix, ''), 10))
    .filter((n) => !Number.isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return `${prefix}${max + 1}`;
}

export function getLatestPublishedIssue(): IssueSummary | null {
  const issue = [...data.issues]
    .filter((i) => i.status === 'published')
    .sort((a, b) => b.issue_number - a.issue_number)[0];
  if (!issue) return null;
  const articles = getIssueArticles(issue);
  return {
    ...issue,
    article_count: articles.length,
    category_counts: countByCategory(articles),
  };
}

export function getLatestPublishedIssueHomePreview(): IssueHomePreview | null {
  const issue = [...data.issues]
    .filter((i) => i.status === 'published')
    .sort((a, b) => b.issue_number - a.issue_number)[0];
  if (!issue) return null;
  const articles = getIssueArticles(issue).filter(
    (a) => a.status === 'published',
  );
  return {
    ...issue,
    article_count: articles.length,
    category_counts: countByCategory(articles),
    preview_articles: articles.slice(0, HOME_PREVIEW_ARTICLE_COUNT),
  };
}

export function getPublishedIssues(): IssueSummary[] {
  return [...data.issues]
    .filter((i) => i.status === 'published' || i.status === 'unpublished')
    .sort((a, b) => b.issue_number - a.issue_number)
    .map((issue) => {
      const articles = getIssueArticles(issue);
      return {
        ...issue,
        article_count: articles.length,
        category_counts: countByCategory(articles),
      };
    });
}

export function getPublishedIssueIds(): { id: string }[] {
  return data.issues
    .filter((i) => i.status === 'published')
    .map((i) => ({ id: i.id }));
}

export function getPublishedArticleIds(): { id: string }[] {
  const ids: string[] = [];
  for (const issue of data.issues.filter((i) => i.status === 'published')) {
    for (const article of getIssueArticles(issue)) {
      if (article.status === 'published') {
        ids.push(article.id);
      }
    }
  }
  return ids.map((id) => ({ id }));
}

export function getIssueById(id: string): IssueDetail | null {
  const issue = data.issues.find((i) => i.id === id);
  if (!issue) return null;
  if (issue.status === 'draft') return null;
  const articles = getIssueArticles(issue).filter(
    (a) => a.status === 'published',
  );
  return {
    ...issue,
    articles,
    article_count: articles.length,
    category_counts: countByCategory(articles),
  };
}

export function getArticleById(id: string): Article | null {
  return data.articles.find((a) => a.id === id) ?? null;
}

export function getPublishedArticleById(id: string): Article | null {
  const article = getArticleById(id);
  if (!article || article.status !== 'published') return null;
  return article;
}

export function incrementArticleClick(id: string): void {
  const article = data.articles.find((a) => a.id === id);
  if (article) {
    article.click_count = (article.click_count ?? 0) + 1;
    persist();
  }
}

export function getCandidates(): Article[] {
  return data.articles.filter((a) => a.status === 'candidate');
}

export function getAllIssues(): WeeklyIssue[] {
  return [...data.issues].sort((a, b) => b.issue_number - a.issue_number);
}

export function getIssueForAdmin(id: string): IssueDetail | null {
  const issue = data.issues.find((i) => i.id === id);
  if (!issue) return null;
  const articles = getIssueArticles(issue);
  return {
    ...issue,
    articles,
    article_count: articles.length,
    category_counts: countByCategory(articles),
  };
}

export function updateArticle(
  id: string,
  patch: Partial<
    Pick<
      Article,
      | 'title'
      | 'original_url'
      | 'source_name'
      | 'published_at'
      | 'language'
      | 'category'
      | 'introduction'
      | 'intro_reviewed'
      | 'status'
    >
  >,
): Article | null {
  const article = data.articles.find((a) => a.id === id);
  if (!article) return null;

  const next = { ...patch };
  if (next.original_url !== undefined) {
    const trimmed = next.original_url.trim();
    if (trimmed) {
      const normalized = normalizeArticleUrl(trimmed);
      const duplicate = data.articles.find(
        (a) =>
          a.id !== id &&
          a.original_url.trim() &&
          normalizeArticleUrl(a.original_url) === normalized,
      );
      if (duplicate) return null;
      next.original_url = normalized;
    } else {
      next.original_url = '';
    }
  }

  Object.assign(article, next);
  persist();
  return article;
}

export function setArticleAttachment(
  id: string,
  attachment: ArticleAttachment | null,
): Article | null {
  const article = data.articles.find((a) => a.id === id);
  if (!article) return null;
  if (attachment) {
    article.attachment = attachment;
  } else {
    delete article.attachment;
  }
  persist();
  return article;
}

export function createIssue(): WeeklyIssue {
  const maxNum = data.issues.reduce((m, i) => Math.max(m, i.issue_number), 0);
  const issue: WeeklyIssue = {
    id: `issue-${maxNum + 1}`,
    issue_number: maxNum + 1,
    title: `2026 年第 ${maxNum + 1} 期`,
    publish_date: new Date().toISOString().slice(0, 10),
    status: 'draft',
    cover_summary: '',
    article_ids: [],
  };
  data.issues.push(issue);
  persist();
  return issue;
}

export function updateIssue(
  id: string,
  patch: Partial<Pick<WeeklyIssue, 'title' | 'publish_date' | 'cover_summary'>>,
): WeeklyIssue | null {
  const issue = data.issues.find((i) => i.id === id);
  if (!issue) return null;
  Object.assign(issue, patch);
  persist();
  return issue;
}

export type AddArticlesResult = {
  added: string[];
  failed: { id: string; error: string }[];
};

function tryAddArticleToIssue(
  issue: WeeklyIssue,
  article: Article,
): { ok: true } | { ok: false; error: string } {
  if (issue.article_ids.includes(article.id)) {
    return { ok: false, error: '文章已在该周刊中' };
  }
  if (issue.article_ids.length >= ISSUE_MAX_ARTICLES) {
    return { ok: false, error: `每期至多 ${ISSUE_MAX_ARTICLES} 篇` };
  }
  const dup = data.articles.find(
    (a) => a.original_url === article.original_url && a.status === 'published',
  );
  if (dup) return { ok: false, error: '该 URL 已发布过' };

  issue.article_ids.push(article.id);
  article.status = 'selected';
  article.issue_id = issue.id;
  article.sort_order = issue.article_ids.length;
  return { ok: true };
}

export function addArticlesToIssue(
  issueId: string,
  articleIds: string[],
): AddArticlesResult {
  const issue = data.issues.find((i) => i.id === issueId);
  const result: AddArticlesResult = { added: [], failed: [] };
  if (!issue) {
    for (const id of articleIds) {
      result.failed.push({ id, error: '周刊不存在' });
    }
    return result;
  }

  let changed = false;
  for (const id of articleIds) {
    const article = data.articles.find((a) => a.id === id);
    if (!article) {
      result.failed.push({ id, error: '文章不存在' });
      continue;
    }

    const attempt = tryAddArticleToIssue(issue, article);
    if (attempt.ok) {
      result.added.push(id);
      changed = true;
      continue;
    }

    result.failed.push({ id, error: attempt.error });
    if (attempt.error === `每期至多 ${ISSUE_MAX_ARTICLES} 篇`) {
      break;
    }
  }

  if (changed) persist();
  return result;
}

export function addArticleToIssue(
  issueId: string,
  articleId: string,
): { ok: boolean; error?: string } {
  const result = addArticlesToIssue(issueId, [articleId]);
  if (result.added.length > 0) return { ok: true };
  return { ok: false, error: result.failed[0]?.error ?? '添加失败' };
}

export function removeArticleFromIssue(
  issueId: string,
  articleId: string,
): boolean {
  const issue = data.issues.find((i) => i.id === issueId);
  const article = data.articles.find((a) => a.id === articleId);
  if (!issue || !article) return false;
  issue.article_ids = issue.article_ids.filter((id) => id !== articleId);
  if (article.status === 'selected') {
    article.status = 'candidate';
    delete article.issue_id;
    delete article.sort_order;
  }
  issue.article_ids.forEach((id, idx) => {
    const a = data.articles.find((x) => x.id === id);
    if (a) a.sort_order = idx + 1;
  });
  persist();
  return true;
}

export function reorderIssueArticles(
  issueId: string,
  articleIds: string[],
): boolean {
  const issue = data.issues.find((i) => i.id === issueId);
  if (!issue) return false;
  if (articleIds.length !== issue.article_ids.length) return false;
  issue.article_ids = articleIds;
  articleIds.forEach((id, idx) => {
    const a = data.articles.find((x) => x.id === id);
    if (a) a.sort_order = idx + 1;
  });
  persist();
  return true;
}

export function deleteIssue(
  id: string,
): { ok: true } | { ok: false; error: string } {
  const issueIndex = data.issues.findIndex((i) => i.id === id);
  if (issueIndex === -1) {
    return { ok: false, error: '周刊不存在' };
  }

  const issue = data.issues[issueIndex];
  if (issue.status === 'published') {
    return { ok: false, error: '已发布的周刊不能删除' };
  }

  for (const articleId of issue.article_ids) {
    const article = data.articles.find((a) => a.id === articleId);
    if (!article || article.status !== 'selected') continue;
    article.status = 'candidate';
    delete article.issue_id;
    delete article.sort_order;
  }

  data.issues.splice(issueIndex, 1);
  persist();
  return { ok: true };
}

export function rejectCandidate(articleId: string): boolean {
  const article = data.articles.find((a) => a.id === articleId);
  if (!article || article.status !== 'candidate') return false;
  article.status = 'rejected';
  persist();
  return true;
}

export function deleteCandidate(articleId: string): boolean {
  const index = data.articles.findIndex((a) => a.id === articleId);
  if (index === -1) return false;
  const article = data.articles[index];
  if (article.status !== 'candidate') return false;
  removeArticleAttachmentFiles(articleId);
  data.articles.splice(index, 1);
  persist();
  return true;
}

export function deleteCandidates(ids: string[]): number {
  let count = 0;
  for (const id of ids) {
    if (deleteCandidate(id)) count++;
  }
  return count;
}

export function batchUpdateCandidates(
  ids: string[],
  patch: Partial<Pick<Article, 'category' | 'intro_reviewed'>>,
): number {
  let count = 0;
  for (const id of ids) {
    const article = data.articles.find((a) => a.id === id);
    if (!article || article.status !== 'candidate') continue;
    Object.assign(article, patch);
    count++;
  }
  if (count > 0) persist();
  return count;
}

function guessCategory(title: string, source: string): ArticleCategory {
  const text = `${title} ${source}`.toLowerCase();
  if (/ai|aigc|llm|agent|copilot|生成/.test(text)) return 'ai_frontier';
  if (/ux|流程|协作|复盘|研究|经验|method/.test(text)) return 'design_experience';
  return 'ui_design';
}

function guessLanguage(title: string, source: string): 'zh' | 'en' {
  if (
    /[\u4e00-\u9fff]/.test(title) ||
    /优设|站酷|少数派|阿里|字节|腾讯|京东|美团|百度|Arco|公众号/.test(source)
  ) {
    return 'zh';
  }
  return 'en';
}

function urlExists(url: string): boolean {
  const normalized = normalizeArticleUrl(url);
  return data.articles.some(
    (a) => normalizeArticleUrl(a.original_url) === normalized,
  );
}

export function importArticleFromUrl(
  url: string,
  meta?: {
    title?: string;
    source_name?: string;
    published_at?: string;
    language?: 'zh' | 'en';
  },
): { ok: boolean; article?: Article; error?: string } {
  const normalizedUrl = normalizeArticleUrl(url);
  if (urlExists(normalizedUrl)) {
    return { ok: false, error: '该 URL 已存在' };
  }
  let hostname = '未知来源';
  try {
    hostname = new URL(normalizedUrl).hostname.replace('www.', '');
  } catch {
    return { ok: false, error: 'URL 格式无效' };
  }

  const sourceName = meta?.source_name ?? hostname;
  const title = meta?.title ?? `来自 ${sourceName} 的文章`;
  const category = guessCategory(title, sourceName);
  const id = nextId('art-c');

  const article: Article = {
    id,
    title,
    original_url: normalizedUrl,
    source_name: sourceName,
    published_at: meta?.published_at ?? new Date().toISOString().slice(0, 10),
    category,
    introduction: '',
    language: meta?.language ?? guessLanguage(title, sourceName),
    link_status: 'link_unknown',
    status: 'candidate',
    intro_reviewed: false,
    click_count: 0,
  };

  article.introduction = generateIntroductionDraft(article);
  data.articles.push(article);
  persist();
  return { ok: true, article };
}

export function createBlankCandidate(): Article {
  const id = nextId('art-c');
  const article: Article = {
    id,
    title: '',
    original_url: '',
    source_name: '',
    published_at: new Date().toISOString().slice(0, 10),
    category: 'ui_design',
    introduction: '',
    language: 'zh',
    link_status: 'link_unknown',
    status: 'candidate',
    intro_reviewed: false,
    click_count: 0,
  };
  data.articles.push(article);
  persist();
  return article;
}

export interface FeedCrawlSummary {
  source_name: string;
  source_id: string;
  status: 'ok' | 'error';
  raw: number;
  fetched: number;
  error?: string;
}

export interface CrawlResult {
  imported: number;
  skipped: number;
  filtered: number;
  articles: Article[];
  feeds: FeedCrawlSummary[];
}

export async function crawlRssFeeds(): Promise<CrawlResult> {
  const feedResults = await fetchAllRssFeeds();
  let imported = 0;
  let skipped = 0;
  let filtered = 0;
  const articles: Article[] = [];

  for (const result of feedResults) {
    if (result.status === 'ok') {
      filtered += Math.max(0, result.raw - result.fetched);
    }
    for (const item of result.items) {
      const importResult = importArticleFromUrl(item.url, {
        title: item.title,
        source_name: item.source.name,
        published_at: item.published_at,
        language: item.source.language,
      });
      if (importResult.ok && importResult.article) {
        imported++;
        articles.push(importResult.article);
      } else {
        skipped++;
      }
    }
  }

  return {
    imported,
    skipped,
    filtered,
    articles,
    feeds: feedResults.map(toFeedSummary),
  };
}

function toFeedSummary(result: FeedFetchResult): FeedCrawlSummary {
  return {
    source_name: result.source.name,
    source_id: result.source.id,
    status: result.status,
    raw: result.raw,
    fetched: result.fetched,
    error: result.error,
  };
}

export interface SearchResult {
  article: Article;
  issue_number: number;
  issue_id: string;
}

export function searchPublishedArticles(query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: SearchResult[] = [];
  for (const issue of data.issues.filter((i) => i.status === 'published')) {
    for (const article of getIssueArticles(issue)) {
      if (article.status !== 'published') continue;
      const haystack =
        `${article.title} ${article.introduction} ${article.source_name}`.toLowerCase();
      if (haystack.includes(q)) {
        results.push({
          article,
          issue_number: issue.issue_number,
          issue_id: issue.id,
        });
      }
    }
  }
  return results;
}

export interface PublishValidation {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

export function validateIssuePublish(issueId: string): PublishValidation {
  const issue = data.issues.find((i) => i.id === issueId);
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!issue) return { ok: false, errors: ['周刊不存在'], warnings: [] };

  const articles = getIssueArticles(issue);
  if (articles.length <= ISSUE_MIN_ARTICLES) {
    errors.push(`需超过 ${ISSUE_MIN_ARTICLES} 篇文章（当前 ${articles.length} 篇）`);
  }
  if (articles.length > ISSUE_MAX_ARTICLES) {
    errors.push(`至多 ${ISSUE_MAX_ARTICLES} 篇文章（当前 ${articles.length} 篇）`);
  }

  const unreviewed = articles.filter((a) => !a.intro_reviewed);
  if (unreviewed.length > 0) {
    errors.push(`${unreviewed.length} 篇引言未审核`);
  }

  for (const a of articles) {
    const len = a.introduction.length;
    if (len < INTRO_MIN || len > INTRO_MAX) {
      warnings.push(`「${a.title}」引言字数 ${len}（建议 ${INTRO_MIN}-${INTRO_MAX}）`);
    }
  }

  return { ok: errors.length === 0, errors, warnings };
}

export function publishIssue(issueId: string): PublishValidation {
  const validation = validateIssuePublish(issueId);
  if (!validation.ok) return validation;

  const issue = data.issues.find((i) => i.id === issueId);
  if (!issue) return { ok: false, errors: ['周刊不存在'], warnings: [] };

  issue.status = 'published';
  const articles = getIssueArticles(issue);
  for (const a of articles) {
    a.status = 'published';
    a.issue_id = issueId;
  }
  persist();
  return validation;
}
