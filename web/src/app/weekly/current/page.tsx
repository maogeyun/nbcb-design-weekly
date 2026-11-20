import { redirect } from 'next/navigation';
import { getLatestPublishedIssue } from '@/lib/store';

export default function WeeklyCurrentPage() {
  const latest = getLatestPublishedIssue();
  if (!latest) {
    redirect('/');
  }
  redirect(`/weekly/${latest.id}/`);
}
