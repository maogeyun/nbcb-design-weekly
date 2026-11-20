import type { ParsedBreadcrumbContext } from '@/lib/app-link';
import { buildAppHref, normalizePathname, parseBreadcrumbContext } from '@/lib/app-link';
import {
  ARCHIVE_CRUMB,
  HOME_CRUMB,
  SEARCH_CRUMB,
  truncateBreadcrumbLabel,
  BREADCRUMB_LABEL_MAX_LENGTH,
  type BreadcrumbItem,
} from '@/lib/breadcrumbs';

export interface BreadcrumbPageData {
  issueNumber?: number;
  issueId?: string;
  title?: string;
}

export interface ResolveBreadcrumbsInput {
  pathname: string;
  searchParams: Pick<URLSearchParams, 'get'>;
  pageData?: BreadcrumbPageData | null;
}

function resolveWeeklyBreadcrumbs(
  from: ParsedBreadcrumbContext['from'],
  issueNumber: number,
): BreadcrumbItem[] {
  const issueCrumb: BreadcrumbItem = { label: `第 ${issueNumber} 期` };
  if (from === 'archive') {
    return [HOME_CRUMB, ARCHIVE_CRUMB, issueCrumb];
  }
  return [HOME_CRUMB, issueCrumb];
}

function resolveArticleBreadcrumbs(
  ctx: ParsedBreadcrumbContext,
  issueNumber: number,
  issueId: string,
  title: string,
): BreadcrumbItem[] {
  const titleCrumb: BreadcrumbItem = {
    label: truncateBreadcrumbLabel(title),
    title: title.length > BREADCRUMB_LABEL_MAX_LENGTH ? title : undefined,
  };

  if (ctx.from === 'search') {
    return [HOME_CRUMB, SEARCH_CRUMB, titleCrumb];
  }

  const weeklyFrom = ctx.weeklyFrom ?? (ctx.from === 'archive' ? 'archive' : 'home');
  const issueCrumb: BreadcrumbItem = {
    label: `第 ${issueNumber} 期`,
    href: buildAppHref(`/weekly/${issueId}`, {
      from: weeklyFrom === 'archive' ? 'archive' : 'home',
    }),
  };

  if (ctx.from === 'weekly' && ctx.weeklyFrom === 'archive') {
    return [HOME_CRUMB, ARCHIVE_CRUMB, issueCrumb, titleCrumb];
  }

  return [HOME_CRUMB, issueCrumb, titleCrumb];
}

/** Resolve breadcrumb trail from pathname, query context, and optional page data. */
export function resolveBreadcrumbs({
  pathname,
  searchParams,
  pageData,
}: ResolveBreadcrumbsInput): BreadcrumbItem[] | null {
  const path = normalizePathname(pathname);

  if (path === '/' || path.startsWith('/admin')) {
    return null;
  }

  if (path === '/archive') {
    return [HOME_CRUMB, { label: '归档' }];
  }
  if (path === '/search') {
    return [HOME_CRUMB, { label: '搜索' }];
  }
  if (path === '/skills') {
    return [HOME_CRUMB, { label: '设计技能库' }];
  }
  if (path === '/about') {
    return [HOME_CRUMB, { label: '关于设计周刊' }];
  }

  const ctx = parseBreadcrumbContext(searchParams);

  const weeklyMatch = path.match(/^\/weekly\/([^/]+)$/);
  if (weeklyMatch) {
    const issueNumber = pageData?.issueNumber;
    if (issueNumber == null) return null;
    return resolveWeeklyBreadcrumbs(ctx.from, issueNumber);
  }

  const articleMatch = path.match(/^\/article\/([^/]+)$/);
  if (articleMatch) {
    const issueNumber = pageData?.issueNumber ?? ctx.issueNumber;
    const issueId = pageData?.issueId ?? ctx.issueId;
    const title = pageData?.title;
    if (issueNumber == null || !issueId || !title) {
      return null;
    }
    return resolveArticleBreadcrumbs(ctx, issueNumber, issueId, title);
  }

  return null;
}
