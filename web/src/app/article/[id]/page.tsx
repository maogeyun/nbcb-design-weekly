import { notFound } from 'next/navigation';
import { getIssueById, getPublishedArticleById } from '@/lib/store';
import { BreadcrumbPageData } from '@/components/layout/BreadcrumbProvider';
import { ArticlePageClient } from './ArticlePageClient';

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
    <>
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
    </>
  );
}
