import { getPublishedArticleIds, getPublishedIssueIds } from '@/lib/store';

export function getStaticIssueParams() {
  return getPublishedIssueIds();
}

export function getStaticArticleParams() {
  return getPublishedArticleIds();
}
