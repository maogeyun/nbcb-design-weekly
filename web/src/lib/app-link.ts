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
  const query = url.searchParams.toString();
  return query ? `${url.pathname}?${query}` : url.pathname;
}

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
