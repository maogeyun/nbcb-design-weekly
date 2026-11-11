import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getIssueById, getPublishedArticleById } from '@/lib/store';
import { getStaticArticleParams } from '@/lib/static-params';
import { MobileArticlePageClient } from './MobileArticlePageClient';

export function generateStaticParams() {
  return getStaticArticleParams();
}

export default async function MobileArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = getPublishedArticleById(id);
  if (!article || !article.issue_id) {
    notFound();
  }

  const issue = getIssueById(article.issue_id);
  if (!issue || issue.status !== 'published') {
    notFound();
  }

  return (
    <Suspense>
      <MobileArticlePageClient
        article={article}
        issueId={article.issue_id}
        issueNumber={issue.issue_number}
      />
    </Suspense>
  );
}
