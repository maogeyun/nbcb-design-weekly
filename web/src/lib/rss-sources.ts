export type SourceTier = 'S' | 'A' | 'B';
export type SourceLanguage = 'zh' | 'en';
export type SourceChannel = 'website' | 'wechat';
/** rss：标准 RSS/Atom；archives：列表页 HTML 抓取（优设网等 RSS 失效时使用） */
export type SourceFetchStrategy = 'rss' | 'archives';

export interface RssSource {
  id: string;
  name: string;
  /** 网站 RSS 直连地址；公众号源由 resolveSourceFeedUrl 动态拼接 */
  feedUrl: string;
  /** 抓取策略，默认 rss */
  fetchStrategy?: SourceFetchStrategy;
  language: SourceLanguage;
  tier: SourceTier;
  channel: SourceChannel;
  /** Hostnames allowed for items from this feed */
  domains: string[];
  /** Design-dedicated feed — skip topic keyword filter */
  designFeed: boolean;
  enabled: boolean;
  /** 聚合源（如 Medium Tag）单次抓取上限，避免候选池被同一平台淹没 */
  maxItems?: number;
  /** WeWe RSS 等服务中的 feed id，如 MP_WXS_3012345678 */
  wechatFeedId?: string;
}

/** 近 N 天内的文章才入库，对齐 docs/来源白名单.md §5.2 */
export const RSS_CRAWL_DAYS = 14;

const WECHAT_RSS_BASE_URL = process.env.WECHAT_RSS_BASE_URL?.replace(/\/$/, '');

function parseWechatFeedOverrides(): Record<string, string> {
  const raw = process.env.WECHAT_RSS_FEEDS?.trim();
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, string>;
    }
  } catch {
    // ignore invalid env JSON
  }
  return {};
}

const WECHAT_FEED_OVERRIDES = parseWechatFeedOverrides();

/**
 * 白名单 RSS 源配置（对齐 docs/来源白名单.md）
 * manual 源不在此列表，由编辑手动导入。
 *
 * 微信公众号源需部署 WeWe RSS 等服务，并配置：
 * - WECHAT_RSS_BASE_URL=https://your-wewe-rss.example.com
 * - WECHAT_RSS_FEEDS={"wechat-ali-design":"MP_WXS_xxx",...}（可选，覆盖默认 feed id）
 */
export const RSS_SOURCES: RssSource[] = [
  // ── S 级：国际权威 ──────────────────────────────────────────
  {
    id: 'figma',
    name: 'Figma Blog',
    feedUrl: 'https://www.figma.com/blog/feed/atom.xml',
    language: 'en',
    tier: 'S',
    channel: 'website',
    domains: ['figma.com'],
    designFeed: true,
    enabled: true,
  },
  {
    id: 'smashing',
    name: 'Smashing Magazine',
    feedUrl: 'https://www.smashingmagazine.com/feed/',
    language: 'en',
    tier: 'S',
    channel: 'website',
    domains: ['smashingmagazine.com'],
    designFeed: true,
    enabled: true,
  },
  {
    id: 'nng',
    name: 'Nielsen Norman Group',
    feedUrl: 'https://www.nngroup.com/feed/rss/',
    language: 'en',
    tier: 'S',
    channel: 'website',
    domains: ['nngroup.com'],
    designFeed: true,
    enabled: true,
  },
  {
    id: 'google-design',
    name: 'Google Design',
    feedUrl: 'https://medium.com/feed/google-design',
    language: 'en',
    tier: 'S',
    channel: 'website',
    domains: ['medium.com', 'design.google'],
    designFeed: true,
    enabled: true,
  },
  {
    id: 'ux-collective',
    name: 'UX Collective',
    feedUrl: 'https://uxdesign.cc/feed',
    language: 'en',
    tier: 'S',
    channel: 'website',
    domains: ['uxdesign.cc', 'medium.com'],
    designFeed: true,
    enabled: true,
  },
  {
    id: 'sidebar',
    name: 'Sidebar',
    feedUrl: 'https://sidebar.io/feed.xml',
    language: 'en',
    tier: 'S',
    channel: 'website',
    domains: ['sidebar.io', 'bit.ly'],
    designFeed: true,
    enabled: true,
  },

  // ── A 级：知名社区与中文优质源 ───────────────────────────────
  {
    id: 'uisdc',
    name: '优设网',
    // /feed 已被 slug 冲突重定向至文章页，RSS 已下线，改抓 archives 列表
    feedUrl: 'https://www.uisdc.com/archives',
    fetchStrategy: 'archives',
    language: 'zh',
    tier: 'A',
    channel: 'website',
    domains: ['uisdc.com'],
    designFeed: true,
    enabled: true,
  },
  {
    id: 'sspai',
    name: '少数派',
    feedUrl: 'https://sspai.com/feed',
    language: 'zh',
    tier: 'A',
    channel: 'website',
    domains: ['sspai.com'],
    designFeed: false,
    enabled: true,
  },
  {
    id: 'eux',
    name: '体验进阶（EUX）',
    feedUrl: 'https://eux.baidu.com/feed',
    language: 'zh',
    tier: 'A',
    channel: 'website',
    domains: ['eux.baidu.com', 'baidu.com'],
    designFeed: true,
    enabled: true,
  },
  {
    id: 'material',
    name: 'Material Design Blog',
    feedUrl: 'https://material.io/blog/feed',
    language: 'en',
    tier: 'A',
    channel: 'website',
    domains: ['material.io', 'm3.material.io'],
    designFeed: true,
    enabled: true,
  },
  {
    id: 'alistapart',
    name: 'A List Apart',
    feedUrl: 'https://alistapart.com/main/feed/',
    language: 'en',
    tier: 'A',
    channel: 'website',
    domains: ['alistapart.com'],
    designFeed: true,
    enabled: true,
  },
  {
    id: 'arco',
    name: 'Arco Design（字节）',
    feedUrl: 'https://arco.design/blog/rss.xml',
    language: 'zh',
    tier: 'A',
    channel: 'website',
    domains: ['arco.design'],
    designFeed: true,
    enabled: true,
  },
  {
    id: 'codrops',
    name: 'Codrops',
    feedUrl: 'https://tympanus.net/codrops/feed/',
    language: 'en',
    tier: 'A',
    channel: 'website',
    domains: ['tympanus.net', 'codrops.com'],
    designFeed: true,
    enabled: true,
  },
  {
    id: 'ux-planet',
    name: 'UX Planet',
    feedUrl: 'https://uxplanet.org/feed',
    language: 'en',
    tier: 'A',
    channel: 'website',
    domains: ['uxplanet.org', 'medium.com'],
    designFeed: true,
    enabled: true,
  },
  {
    id: 'prototypr',
    name: 'Prototypr',
    feedUrl: 'https://blog.prototypr.io/feed',
    language: 'en',
    tier: 'A',
    channel: 'website',
    domains: ['prototypr.io', 'medium.com'],
    designFeed: true,
    enabled: true,
  },
  {
    id: 'ixdf',
    name: 'Interaction Design Foundation',
    feedUrl: 'https://www.interaction-design.org/rss/site_news.xml',
    language: 'en',
    tier: 'A',
    channel: 'website',
    domains: ['interaction-design.org'],
    designFeed: true,
    enabled: true,
  },

  // ── B 级：设计分享站与个人博客 ───────────────────────────────
  {
    id: 'maggie',
    name: 'Maggie Appleton',
    feedUrl: 'https://maggieappleton.com/rss.xml',
    language: 'en',
    tier: 'B',
    channel: 'website',
    domains: ['maggieappleton.com'],
    designFeed: true,
    enabled: true,
  },
  {
    id: 'webdesigner-depot',
    name: 'Webdesigner Depot',
    feedUrl: 'https://webdesignerdepot.com/feed/',
    language: 'en',
    tier: 'B',
    channel: 'website',
    domains: ['webdesignerdepot.com'],
    designFeed: true,
    enabled: true,
  },
  {
    id: 'designer-daily',
    name: 'Designer Daily',
    feedUrl: 'https://www.designer-daily.com/feed/',
    language: 'en',
    tier: 'B',
    channel: 'website',
    domains: ['designer-daily.com'],
    designFeed: true,
    enabled: true,
  },
  {
    id: 'designmodo',
    name: 'Designmodo',
    feedUrl: 'https://designmodo.com/feed/',
    language: 'en',
    tier: 'B',
    channel: 'website',
    domains: ['designmodo.com'],
    designFeed: true,
    enabled: true,
  },

  // ── Medium Tag 聚合（需关键词过滤）────────────────────────────
  {
    id: 'medium-ui-design',
    name: 'Medium · UI Design',
    feedUrl: 'https://medium.com/feed/tag/ui-design',
    language: 'en',
    tier: 'A',
    channel: 'website',
    domains: ['medium.com'],
    designFeed: false,
    maxItems: 12,
    enabled: true,
  },
  {
    id: 'medium-product-design',
    name: 'Medium · Product Design',
    feedUrl: 'https://medium.com/feed/tag/product-design',
    language: 'en',
    tier: 'A',
    channel: 'website',
    domains: ['medium.com'],
    designFeed: false,
    maxItems: 12,
    enabled: true,
  },
  {
    id: 'medium-design-systems',
    name: 'Medium · Design Systems',
    feedUrl: 'https://medium.com/feed/tag/design-systems',
    language: 'en',
    tier: 'A',
    channel: 'website',
    domains: ['medium.com'],
    designFeed: false,
    maxItems: 12,
    enabled: true,
  },
  {
    id: 'medium-ai-design',
    name: 'Medium · AI Design',
    feedUrl: 'https://medium.com/feed/tag/ai-design',
    language: 'en',
    tier: 'A',
    channel: 'website',
    domains: ['medium.com'],
    designFeed: false,
    maxItems: 12,
    enabled: true,
  },

  // ── 微信公众号（需 WeWe RSS + 环境变量）──────────────────────
  {
    id: 'wechat-uisdc',
    name: '优设网（公众号）',
    feedUrl: '',
    language: 'zh',
    tier: 'A',
    channel: 'wechat',
    domains: ['mp.weixin.qq.com'],
    designFeed: true,
    enabled: true,
  },
  {
    id: 'wechat-ali-design',
    name: '阿里巴巴设计',
    feedUrl: '',
    language: 'zh',
    tier: 'A',
    channel: 'wechat',
    domains: ['mp.weixin.qq.com'],
    designFeed: true,
    enabled: true,
  },
  {
    id: 'wechat-tencent-cdc',
    name: '腾讯 CDC',
    feedUrl: '',
    language: 'zh',
    tier: 'A',
    channel: 'wechat',
    domains: ['mp.weixin.qq.com'],
    designFeed: true,
    enabled: true,
  },
  {
    id: 'wechat-bytedance-design',
    name: '字节跳动设计',
    feedUrl: '',
    language: 'zh',
    tier: 'A',
    channel: 'wechat',
    domains: ['mp.weixin.qq.com'],
    designFeed: true,
    enabled: true,
  },
  {
    id: 'wechat-jdc',
    name: '京东设计 JDC',
    feedUrl: '',
    language: 'zh',
    tier: 'A',
    channel: 'wechat',
    domains: ['mp.weixin.qq.com'],
    designFeed: true,
    enabled: true,
  },
  {
    id: 'wechat-meituan-design',
    name: '美团设计 Med',
    feedUrl: '',
    language: 'zh',
    tier: 'A',
    channel: 'wechat',
    domains: ['mp.weixin.qq.com'],
    designFeed: true,
    enabled: true,
  },
  {
    id: 'wechat-arco',
    name: 'Arco Design（公众号）',
    feedUrl: '',
    language: 'zh',
    tier: 'B',
    channel: 'wechat',
    domains: ['mp.weixin.qq.com'],
    designFeed: true,
    enabled: true,
  },
  {
    id: 'wechat-eux',
    name: '百度体验设计',
    feedUrl: '',
    language: 'zh',
    tier: 'A',
    channel: 'wechat',
    domains: ['mp.weixin.qq.com'],
    designFeed: true,
    enabled: true,
  },
];

export function resolveWechatFeedId(source: RssSource): string | null {
  const override = WECHAT_FEED_OVERRIDES[source.id]?.trim();
  if (override) return override;
  const preset = source.wechatFeedId?.trim();
  return preset || null;
}

export function resolveSourceFeedUrl(source: RssSource): string | null {
  if (source.channel === 'website') {
    return source.feedUrl.trim() || null;
  }
  if (!WECHAT_RSS_BASE_URL) return null;
  const feedId = resolveWechatFeedId(source);
  if (!feedId) return null;
  return `${WECHAT_RSS_BASE_URL}/feeds/${feedId}.rss`;
}

export function getEnabledRssSources(): RssSource[] {
  return RSS_SOURCES.filter((source) => {
    if (!source.enabled) return false;
    return resolveSourceFeedUrl(source) !== null;
  }).map((source) => ({
    ...source,
    feedUrl: resolveSourceFeedUrl(source)!,
  }));
}

export function getWechatSourceStatus(): {
  configured: boolean;
  baseUrl: string | null;
  total: number;
  active: number;
} {
  const wechatSources = RSS_SOURCES.filter(
    (s) => s.channel === 'wechat' && s.enabled,
  );
  const active = wechatSources.filter(
    (s) => resolveSourceFeedUrl(s) !== null,
  ).length;
  return {
    configured: Boolean(WECHAT_RSS_BASE_URL),
    baseUrl: WECHAT_RSS_BASE_URL ?? null,
    total: wechatSources.length,
    active,
  };
}

export function isUrlFromSource(url: string, source: RssSource): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    if (source.channel === 'wechat') {
      return host === 'mp.weixin.qq.com';
    }
    return source.domains.some(
      (d) => host === d || host.endsWith(`.${d}`),
    );
  } catch {
    return false;
  }
}
