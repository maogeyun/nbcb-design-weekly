import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getStaticArticleParams } from '@/lib/static-params';
import { getIssueById, getPublishedArticleById } from '@/lib/store';
import { BreadcrumbPageData } from '@/components/layout/BreadcrumbProvider';
import { ArticlePageClient } from './ArticlePageClient';

export function generateStaticParams() {
  return getStaticArticleParams();
}

export default async function ArticlePage({
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
      <BreadcrumbPageData
        data={{
          issueNumber: issue.issue_number,
          issueId: article.issue_id,
          title: article.title,
        }}
      />
      <ArticlePageClient
        article={article}
        issueId={article.issue_id}
        issueNumber={issue.issue_number}
      />
    </Suspense>
  );
}
