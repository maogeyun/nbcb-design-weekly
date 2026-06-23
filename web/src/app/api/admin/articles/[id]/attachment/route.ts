import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import {
  removeArticleAttachmentFiles,
  saveArticleAttachmentFile,
} from '@/lib/article-attachments';
import { getArticleById, setArticleAttachment } from '@/lib/store';

export async function POST(
  request: Request,
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

  const formData = await request.formData();
  const file = formData.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: '请选择文件' }, { status: 400 });
  }

  try {
    const attachment = await saveArticleAttachmentFile(id, file);
    const updated = setArticleAttachment(id, attachment);
    return NextResponse.json({ data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : '上传失败';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
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

  removeArticleAttachmentFiles(id);
  const updated = setArticleAttachment(id, null);
  return NextResponse.json({ data: updated });
}
