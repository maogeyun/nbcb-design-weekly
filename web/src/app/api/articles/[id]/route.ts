import { NextResponse } from 'next/server';
import { getPublishedArticleById } from '@/lib/store';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const article = getPublishedArticleById(id);
  if (!article) {
    return NextResponse.json({ error: '文章不存在' }, { status: 404 });
  }
  return NextResponse.json({ data: article });
}
