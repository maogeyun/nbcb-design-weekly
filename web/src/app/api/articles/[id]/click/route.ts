import { NextResponse } from 'next/server';
import { incrementArticleClick } from '@/lib/store';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  incrementArticleClick(id);
  return NextResponse.json({ ok: true });
}
