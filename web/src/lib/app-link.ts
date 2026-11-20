export type BreadcrumbFrom = 'home' | 'archive' | 'search' | 'weekly';

export type WeeklyFrom = 'home' | 'archive';

export interface AppLinkContext {
  from?: BreadcrumbFrom;
  issueId?: string;
  issueNumber?: number;
  weeklyFrom?: WeeklyFrom;
}

const VALID_FROM = new Set<BreadcrumbFrom>(['home', 'archive', 'search', 'weekly']);
const VALID_WEEKLY_FROM = new Set<WeeklyFrom>(['home', 'archive']);

/** Strip trailing slash for matching; keep root as `/`. */
export function normalizePathname(pathname: string): string {
  if (!pathname || pathname === '/') return '/';
  return pathname.replace(/\/+$/, '') || '/';
}

/** Ensure non-root pathnames end with `/` (static export trailingSlash). */
export function withTrailingSlash(pathname: string): string {
  const normalized = normalizePathname(pathname);
  if (normalized === '/') return '/';
  return `${normalized}/`;
}

function formatHref(pathname: string, searchParams: URLSearchParams): string {
  const path = withTrailingSlash(pathname);
  const query = searchParams.toString();
  return query ? `${path}?${query}` : path;
}

function appendContextParams(url: URL, context?: AppLinkContext) {
  if (!context) return;

  if (context.from) {
    url.searchParams.set('from', context.from);
  }
  if (context.issueId) {
    url.searchParams.set('issueId', context.issueId);
  }
  if (context.issueNumber != null) {
    url.searchParams.set('issueNumber', String(context.issueNumber));
  }
  if (context.weeklyFrom) {
    url.searchParams.set('weeklyFrom', context.weeklyFrom);
  }
}

/** Build internal href with breadcrumb navigation context. */
export function buildAppHref(path: string, context?: AppLinkContext): string {
  const [pathname, existingQuery = ''] = path.split('?');
  const url = new URL(pathname, 'http://local');
  if (existingQuery) {
    const existing = new URLSearchParams(existingQuery);
    existing.forEach((value, key) => url.searchParams.set(key, value));
  }
  appendContextParams(url, context);
  return formatHref(url.pathname, url.searchParams);
}

const MOBILE_PREFIX = '/m';

function withMobilePrefix(pathname: string): string {
  const normalized = normalizePathname(pathname);
  if (normalized === '/') return MOBILE_PREFIX;
  if (normalized === MOBILE_PREFIX || normalized.startsWith(`${MOBILE_PREFIX}/`)) {
    return normalized;
  }
  return `${MOBILE_PREFIX}${normalized}`;
}

function stripMobilePrefix(pathname: string): string {
  const normalized = normalizePathname(pathname);
  if (!normalized.startsWith(MOBILE_PREFIX)) return normalized;
  const rest = normalized.slice(MOBILE_PREFIX.length);
  return rest === '' ? '/' : rest;
}

/** Build mobile (/m) href with optional breadcrumb context. */
export function buildMobileHref(path: string, context?: AppLinkContext): string {
  const [pathname, existingQuery = ''] = path.split('?');
  const mobilePath = withMobilePrefix(pathname);
  const url = new URL(mobilePath, 'http://local');
  if (existingQuery) {
    const existing = new URLSearchParams(existingQuery);
    existing.forEach((value, key) => url.searchParams.set(key, value));
  }
  appendContextParams(url, context);
  return formatHref(url.pathname, url.searchParams);
}

export function toMobileHref(desktopPath: string): string {
  const [pathname, query = ''] = desktopPath.split('?');
  const mobile = withTrailingSlash(withMobilePrefix(pathname));
  return query ? `${mobile}?${query}` : mobile;
}

export function toDesktopHref(mobilePath: string): string {
  const [pathname, query = ''] = mobilePath.split('?');
  const desktop = withTrailingSlash(stripMobilePrefix(pathname));
  return query ? `${desktop}?${query}` : desktop;
}

export const PREFER_DESKTOP_COOKIE = 'prefer-desktop';

export interface ParsedBreadcrumbContext {
  from?: BreadcrumbFrom;
  issueId?: string;
  issueNumber?: number;
  weeklyFrom?: WeeklyFrom;
}

export function parseBreadcrumbContext(
  searchParams: Pick<URLSearchParams, 'get'>,
): ParsedBreadcrumbContext {
  const fromRaw = searchParams.get('from');
  const weeklyFromRaw = searchParams.get('weeklyFrom');
  const issueNumberRaw = searchParams.get('issueNumber');

  const from = fromRaw && VALID_FROM.has(fromRaw as BreadcrumbFrom)
    ? (fromRaw as BreadcrumbFrom)
    : undefined;
  const weeklyFrom =
    weeklyFromRaw && VALID_WEEKLY_FROM.has(weeklyFromRaw as WeeklyFrom)
      ? (weeklyFromRaw as WeeklyFrom)
      : undefined;
  const issueNumber =
    issueNumberRaw != null && issueNumberRaw !== '' && !Number.isNaN(Number(issueNumberRaw))
      ? Number(issueNumberRaw)
      : undefined;

  return {
    from,
    issueId: searchParams.get('issueId') ?? undefined,
    issueNumber,
    weeklyFrom,
  };
}
