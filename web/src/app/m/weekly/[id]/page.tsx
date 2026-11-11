import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getIssueById } from '@/lib/store';
import { getStaticIssueParams } from '@/lib/static-params';
import { MobileWeeklyPageClient } from './MobileWeeklyPageClient';

export function generateStaticParams() {
  return getStaticIssueParams();
}

export default async function MobileWeeklyPage({
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
      <MobileWeeklyPageClient issue={issue} />
    </Suspense>
  );
}
