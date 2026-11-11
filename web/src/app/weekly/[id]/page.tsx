import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getStaticIssueParams } from '@/lib/static-params';
import { getIssueById } from '@/lib/store';
import { BreadcrumbPageData } from '@/components/layout/BreadcrumbProvider';
import { WeeklyPageClient } from './WeeklyPageClient';

export function generateStaticParams() {
  return getStaticIssueParams();
}

export default async function WeeklyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const issue = getIssueById(id);
  if (!issue || issue.status !== 'published') {
    notFound();
  }

  return (
    <Suspense>
      <BreadcrumbPageData
        data={{ issueNumber: issue.issue_number, issueId: issue.id }}
      />
      <WeeklyPageClient issue={issue} />
    </Suspense>
  );
}
