import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import {
  addArticleToIssue,
  addArticlesToIssue,
  getIssueForAdmin,
  publishIssue,
  removeArticleFromIssue,
  reorderIssueArticles,
  updateIssue,
  validateIssuePublish,
} from '@/lib/store';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }
  const { id } = await params;
  const issue = getIssueForAdmin(id);
  if (!issue) {
    return NextResponse.json({ error: '周刊不存在' }, { status: 404 });
  }
  return NextResponse.json({ data: issue });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json();
  const issue = updateIssue(id, body);
  if (!issue) {
    return NextResponse.json({ error: '周刊不存在' }, { status: 404 });
  }
  return NextResponse.json({ data: issue });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json();

  if (body.action === 'add_article') {
    const result = addArticleToIssue(id, body.articleId);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ data: getIssueForAdmin(id) });
  }

  if (body.action === 'add_articles') {
    const articleIds = Array.isArray(body.articleIds)
      ? (body.articleIds as string[])
      : [];
    if (articleIds.length === 0) {
      return NextResponse.json({ error: '请选择至少一篇文章' }, { status: 400 });
    }
    const result = addArticlesToIssue(id, articleIds);
    if (result.added.length === 0) {
      const summary =
        result.failed.length === 1
          ? result.failed[0].error
          : result.failed.map((f) => f.error).join('；');
      return NextResponse.json({ error: summary, result }, { status: 400 });
    }
    return NextResponse.json({
      data: getIssueForAdmin(id),
      result,
    });
  }

  if (body.action === 'remove_article') {
    removeArticleFromIssue(id, body.articleId);
    return NextResponse.json({ data: getIssueForAdmin(id) });
  }

  if (body.action === 'reorder') {
    reorderIssueArticles(id, body.articleIds);
    return NextResponse.json({ data: getIssueForAdmin(id) });
  }

  if (body.action === 'validate') {
    return NextResponse.json(validateIssuePublish(id));
  }

  return NextResponse.json({ error: '未知操作' }, { status: 400 });
}
