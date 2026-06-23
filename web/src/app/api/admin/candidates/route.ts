import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { createBlankCandidate, getCandidates } from '@/lib/store';

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }
  return NextResponse.json({ data: getCandidates() });
}

export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }
  const article = createBlankCandidate();
  return NextResponse.json({ data: article });
}
