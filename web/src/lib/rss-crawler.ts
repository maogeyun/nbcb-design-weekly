import 'server-only';
import Parser from 'rss-parser';
import {
  getEnabledRssSources,
  isUrlFromSource,
  RSS_CRAWL_DAYS,
  type RssSource,
} from './rss-sources';

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const FETCH_TIMEOUT_MS = 25_000;
const FETCH_RETRIES = 1;

const parser = new Parser({
  timeout: FETCH_TIMEOUT_MS,
  headers: { 'User-Agent': USER_AGENT },
  customFields: {
    item: ['content:encoded', 'summary'],
  },
});

export interface ParsedFeedItem {
  url: string;
  title: string;
  published_at: string;
  summary: string;
  source: RssSource;
}

export interface FeedFetchResult {
  source: RssSource;
  status: 'ok' | 'error';
  raw: number;
  fetched: number;
  items: ParsedFeedItem[];
  error?: string;
}

const REJECT_PATTERN =
  /招聘|内推|课程(?:促销|优惠)?|限时(?:免费|优惠)|扫码关注|点击阅读原文领取|hiring|job\s+opening|we're hiring|apply now|webinar|coupon|black friday|cyber monday|subscribe to my newsletter/i;

const DESIGN_PATTERN =
  /design|ui|ux|figma|sketch|prototype|wireframe|usability|accessibility|a11y|component|typography|visual|interface|interaction|design system|user experience|product design|motion design|design token|design ops|designops|brand identity|icon|illustration|figjam|sketch|principle|framer|sketch|设计|界面|交互|可用性|无障碍|组件|视觉|原型|体验|设计系统|设计规范|用户体验|产品设计|动效|图标|插画|品牌|配色|排版|aigc|llm|copilot|生成式|智能体|agent/i;

export function normalizeArticleUrl(url: string): string {
  try {
    const parsed = new URL(url.trim());
    parsed.hash = '';
    parsed.hostname = parsed.hostname.replace(/^www\./, '').toLowerCase();
    // 去掉微信追踪参数，便于去重
    if (parsed.hostname === 'mp.weixin.qq.com') {
      for (const key of ['scene', 'clicktime', 'enterid', 'ascene', 'devicetype']) {
        parsed.searchParams.delete(key);
      }
    }
    let normalized = parsed.toString();
    if (normalized.endsWith('/')) {
      normalized = normalized.slice(0, -1);
    }
    return normalized;
  } catch {
    return url.trim();
  }
}

function parseItemDate(raw?: string): Date | null {
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function isWithinCrawlWindow(date: Date, days = RSS_CRAWL_DAYS): boolean {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  cutoff.setHours(0, 0, 0, 0);
  return date >= cutoff;
}

export function shouldRejectItem(title: string, summary: string): boolean {
  return REJECT_PATTERN.test(`${title} ${summary}`);
}

export function isDesignRelated(
  title: string,
  summary: string,
  source: RssSource,
): boolean {
  if (source.designFeed) return true;
  return DESIGN_PATTERN.test(`${title} ${summary}`);
}

function resolveItemUrl(item: Parser.Item, source: RssSource): string | null {
  const itemId = (item as Parser.Item & { id?: string }).id;
  const candidates = [item.link, item.guid, itemId].filter(Boolean) as string[];
  for (const raw of candidates) {
    const url = normalizeArticleUrl(raw);
    if (isUrlFromSource(url, source)) return url;
  }
  if (source.channel === 'wechat') {
    const wechatLink = candidates.find((raw) =>
      raw.includes('mp.weixin.qq.com'),
    );
    if (wechatLink) return normalizeArticleUrl(wechatLink);
  }
  return candidates[0] ? normalizeArticleUrl(candidates[0]) : null;
}

type FeedItem = Parser.Item & {
  'content:encoded'?: string;
  summary?: string;
};

function itemSummary(item: Parser.Item): string {
  const feedItem = item as FeedItem;
  const encoded = feedItem['content:encoded'];
  return (
    item.contentSnippet ??
    item.content ??
    encoded?.replace(/<[^>]+>/g, ' ').trim() ??
    feedItem.summary ??
    ''
  );
}

function toPublishedDate(item: Parser.Item): string {
  const date =
    parseItemDate(item.isoDate) ??
    parseItemDate(item.pubDate) ??
    new Date();
  return date.toISOString().slice(0, 10);
}

/** 修复部分中文源 RSS 中未转义的 & 字符 */
function sanitizeFeedXml(xml: string): string {
  return xml.replace(/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[\da-fA-F]+;)/g, '&amp;');
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.text();
}

interface ArchivesListItem {
  url: string;
  title: string;
  publishedAt: Date;
}

/** 解析优设 archives 列表中的相对/绝对时间 */
export function parseUisdcRelativeTime(raw: string, now = new Date()): Date | null {
  const text = raw.trim();
  const relativeMatch = text.match(/^(\d+)\s*(分钟|小时|天)前$/);
  if (relativeMatch) {
    const amount = Number(relativeMatch[1]);
    const unit = relativeMatch[2];
    const date = new Date(now);
    if (unit === '分钟') date.setMinutes(date.getMinutes() - amount);
    else if (unit === '小时') date.setHours(date.getHours() - amount);
    else date.setDate(date.getDate() - amount);
    return date;
  }
  const absoluteMatch = text.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (absoluteMatch) {
    const date = new Date(
      Number(absoluteMatch[1]),
      Number(absoluteMatch[2]) - 1,
      Number(absoluteMatch[3]),
    );
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
}

function isUisdcArticleUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.replace(/^www\./, '') !== 'uisdc.com') return false;
    const slug = parsed.pathname.replace(/^\/|\/$/g, '');
    return Boolean(slug) && !slug.includes('/');
  } catch {
    return false;
  }
}

/** 从优设 archives 列表页 HTML 提取文章条目 */
export function parseUisdcArchivesHtml(html: string, now = new Date()): ArchivesListItem[] {
  const pattern =
    /list-item-post[\s\S]*?<a title="([^"]+)" href="(https:\/\/www\.uisdc\.com\/[^"]+)"[\s\S]*?meta-time">\s*([^<]+?)\s*<\/i>/g;
  const items: ArchivesListItem[] = [];
  const seen = new Set<string>();

  for (const match of html.matchAll(pattern)) {
    const title = match[1].trim();
    const url = normalizeArticleUrl(match[2]);
    const publishedAt = parseUisdcRelativeTime(match[3], now);
    if (!title || !isUisdcArticleUrl(url) || !publishedAt) continue;
    if (seen.has(url)) continue;
    seen.add(url);
    items.push({ url, title, publishedAt });
  }
  return items;
}

async function fetchArchivesSource(source: RssSource): Promise<FeedFetchResult> {
  const baseUrl = source.feedUrl.replace(/\/$/, '');
  const maxPages = 3;
  const allItems: ArchivesListItem[] = [];
  const seenUrls = new Set<string>();

  for (let page = 1; page <= maxPages; page += 1) {
    const pageUrl = page === 1 ? baseUrl : `${baseUrl}/page/${page}`;
    const html = await fetchHtml(pageUrl);
    const pageItems = parseUisdcArchivesHtml(html);
    if (pageItems.length === 0) break;

    let reachedCutoff = false;
    for (const item of pageItems) {
      if (seenUrls.has(item.url)) continue;
      seenUrls.add(item.url);
      allItems.push(item);
      if (!isWithinCrawlWindow(item.publishedAt)) {
        reachedCutoff = true;
      }
    }

    const oldestOnPage = pageItems[pageItems.length - 1]?.publishedAt;
    if (reachedCutoff || (oldestOnPage && !isWithinCrawlWindow(oldestOnPage))) {
      break;
    }
  }

  const parsedItems: ParsedFeedItem[] = [];
  for (const item of allItems) {
    if (!isWithinCrawlWindow(item.publishedAt)) continue;
    if (shouldRejectItem(item.title, '')) continue;
    if (!isDesignRelated(item.title, '', source)) continue;

    parsedItems.push({
      url: item.url,
      title: item.title,
      published_at: item.publishedAt.toISOString().slice(0, 10),
      summary: '',
      source,
    });
  }

  return {
    source,
    status: 'ok',
    raw: allItems.length,
    fetched: parsedItems.length,
    items: parsedItems,
  };
}

async function fetchFeedXml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.text();
}

async function parseFeed(source: RssSource) {
  let lastError: unknown;
  for (let attempt = 0; attempt <= FETCH_RETRIES; attempt += 1) {
    try {
      return await parser.parseURL(source.feedUrl);
    } catch (err) {
      lastError = err;
      try {
        const xml = sanitizeFeedXml(await fetchFeedXml(source.feedUrl));
        return await parser.parseString(xml);
      } catch (fallbackErr) {
        lastError = fallbackErr;
        if (attempt < FETCH_RETRIES) {
          await new Promise((resolve) => setTimeout(resolve, 800));
        }
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error('抓取失败');
}

function sortByPublishedDesc(items: Parser.Item[]): Parser.Item[] {
  return [...items].sort((a, b) => {
    const da =
      parseItemDate(a.isoDate ?? a.pubDate)?.getTime() ?? 0;
    const db =
      parseItemDate(b.isoDate ?? b.pubDate)?.getTime() ?? 0;
    return db - da;
  });
}

export async function fetchRssSource(source: RssSource): Promise<FeedFetchResult> {
  if (source.fetchStrategy === 'archives') {
    try {
      return await fetchArchivesSource(source);
    } catch (err) {
      const message = err instanceof Error ? err.message : '未知错误';
      return {
        source,
        status: 'error',
        raw: 0,
        fetched: 0,
        items: [],
        error: message,
      };
    }
  }

  try {
    const feed = await parseFeed(source);
    const rawItems = feed.items ?? [];
    const sortedItems = sortByPublishedDesc(rawItems);
    const limit = source.maxItems ?? sortedItems.length;
    const items: ParsedFeedItem[] = [];

    for (const item of sortedItems) {
      if (items.length >= limit) break;

      const url = resolveItemUrl(item, source);
      const title = (item.title ?? '').trim();
      if (!url || !title) continue;

      const summary = itemSummary(item);
      const publishedAt = toPublishedDate(item);
      const pubDate = parseItemDate(item.isoDate ?? item.pubDate) ?? new Date();

      if (!isWithinCrawlWindow(pubDate)) continue;
      if (shouldRejectItem(title, summary)) continue;
      if (!isDesignRelated(title, summary, source)) continue;

      items.push({
        url,
        title,
        published_at: publishedAt,
        summary,
        source,
      });
    }

    return {
      source,
      status: 'ok',
      raw: rawItems.length,
      fetched: items.length,
      items,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误';
    return {
      source,
      status: 'error',
      raw: 0,
      fetched: 0,
      items: [],
      error: message,
    };
  }
}

export async function fetchAllRssFeeds(): Promise<FeedFetchResult[]> {
  const sources = getEnabledRssSources();
  const batchSize = 5;
  const results: FeedFetchResult[] = [];
  const seenUrls = new Set<string>();

  for (let i = 0; i < sources.length; i += batchSize) {
    const batch = sources.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(fetchRssSource));

    for (const result of batchResults) {
      const dedupedItems: ParsedFeedItem[] = [];
      for (const item of result.items) {
        const key = normalizeArticleUrl(item.url);
        if (seenUrls.has(key)) continue;
        seenUrls.add(key);
        dedupedItems.push(item);
      }

      results.push({
        ...result,
        fetched: dedupedItems.length,
        items: dedupedItems,
      });
    }
  }

  return results;
}
