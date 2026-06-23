import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { publishIssue } from '@/lib/store';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }
  const { id } = await params;
  const result = publishIssue(id);
  if (!result.ok) {
    return NextResponse.json({ error: '发布失败', ...result }, { status: 400 });
  }
  return NextResponse.json(result);
}
