import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { importArticleFromUrl } from '@/lib/store';

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }
  const body = await request.json();
  if (!body.url) {
    return NextResponse.json({ error: '请提供 URL' }, { status: 400 });
  }
  const result = importArticleFromUrl(body.url, {
    title: body.title,
    source_name: body.source_name,
  });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ data: result.article });
}
