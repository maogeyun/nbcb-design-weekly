export interface BreadcrumbItem {
  label: string;
  href?: string;
  /** Full text for tooltip when label is truncated */
  title?: string;
}

export const HOME_CRUMB: BreadcrumbItem = { label: '首页', href: '/' };

export const ARCHIVE_CRUMB: BreadcrumbItem = { label: '归档', href: '/archive' };

export const SEARCH_CRUMB: BreadcrumbItem = { label: '搜索', href: '/search' };

const BREADCRUMB_LABEL_MAX = 30;

export function truncateBreadcrumbLabel(text: string, max = BREADCRUMB_LABEL_MAX): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}…`;
}

export const BREADCRUMB_LABEL_MAX_LENGTH = BREADCRUMB_LABEL_MAX;
