import { NextResponse } from 'next/server';
import { getLatestPublishedIssueHomePreview } from '@/lib/store';

export async function GET() {
  const issue = getLatestPublishedIssueHomePreview();
  if (!issue) {
    return NextResponse.json({ data: null });
  }
  return NextResponse.json({ data: issue });
}
