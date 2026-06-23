import { NextResponse } from 'next/server';
import { getIssueById } from '@/lib/store';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const issue = getIssueById(id);
  if (!issue) {
    return NextResponse.json({ error: '周刊不存在' }, { status: 404 });
  }
  return NextResponse.json({ data: issue });
}
