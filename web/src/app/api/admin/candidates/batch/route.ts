import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { batchUpdateCandidates, deleteCandidates } from '@/lib/store';
import type { ArticleCategory } from '@/types';

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  const body = await request.json();
  const ids = Array.isArray(body.ids) ? (body.ids as string[]) : [];
  if (ids.length === 0) {
    return NextResponse.json({ error: '请选择至少一篇文章' }, { status: 400 });
  }

  if (body.action === 'delete') {
    const count = deleteCandidates(ids);
    return NextResponse.json({ ok: true, count });
  }

  if (body.action === 'update') {
    const patch: Partial<{ category: ArticleCategory; intro_reviewed: boolean }> =
      {};
    if (body.category !== undefined) patch.category = body.category;
    if (body.intro_reviewed !== undefined) {
      patch.intro_reviewed = Boolean(body.intro_reviewed);
    }
    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: '缺少更新字段' }, { status: 400 });
    }
    const count = batchUpdateCandidates(ids, patch);
    return NextResponse.json({ ok: true, count });
  }

  return NextResponse.json({ error: '未知操作' }, { status: 400 });
}
