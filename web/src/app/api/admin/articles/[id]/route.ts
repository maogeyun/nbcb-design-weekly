import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { deleteCandidate, getArticleById, updateArticle } from '@/lib/store';
import { generateIntroductionDraft } from '@/lib/intro-generator';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json();
  const exists = getArticleById(id);
  if (!exists) {
    return NextResponse.json({ error: '文章不存在' }, { status: 404 });
  }
  const updated = updateArticle(id, body);
  if (!updated) {
    return NextResponse.json(
      { error: body.original_url !== undefined ? '该链接已存在' : '更新失败' },
      { status: 400 },
    );
  }
  return NextResponse.json({ data: updated });
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }
  const { id } = await params;
  const article = getArticleById(id);
  if (!article) {
    return NextResponse.json({ error: '文章不存在' }, { status: 404 });
  }
  const intro = generateIntroductionDraft(article);
  const updated = updateArticle(id, {
    introduction: intro,
    intro_reviewed: false,
  });
  return NextResponse.json({ data: updated });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }
  const { id } = await params;
  const ok = deleteCandidate(id);
  if (!ok) {
    return NextResponse.json({ error: '文章不存在或无法删除' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
