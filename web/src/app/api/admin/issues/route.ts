import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { createIssue, getAllIssues } from '@/lib/store';

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }
  return NextResponse.json({ data: getAllIssues() });
}

export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }
  const issue = createIssue();
  return NextResponse.json({ data: issue });
}
