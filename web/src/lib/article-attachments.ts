import 'server-only';
import fs from 'fs';
import path from 'path';
import type { ArticleAttachment } from '@/types';

const UPLOADS_ROOT = path.join(process.cwd(), 'public', 'uploads', 'articles');
const MAX_BYTES = 20 * 1024 * 1024;

const ALLOWED_EXT = new Set([
  '.pdf',
  '.zip',
  '.doc',
  '.docx',
  '.ppt',
  '.pptx',
  '.xls',
  '.xlsx',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.gif',
  '.txt',
  '.md',
]);

export function getArticleUploadDir(articleId: string): string {
  return path.join(UPLOADS_ROOT, articleId);
}

export function removeArticleAttachmentFiles(articleId: string): void {
  const dir = getArticleUploadDir(articleId);
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

export async function saveArticleAttachmentFile(
  articleId: string,
  file: File,
): Promise<ArticleAttachment> {
  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXT.has(ext)) {
    throw new Error('不支持的文件类型');
  }
  if (file.size <= 0) {
    throw new Error('文件不能为空');
  }
  if (file.size > MAX_BYTES) {
    throw new Error('文件不能超过 20MB');
  }

  removeArticleAttachmentFiles(articleId);
  const dir = getArticleUploadDir(articleId);
  fs.mkdirSync(dir, { recursive: true });

  const storedName = `${Date.now()}${ext}`;
  const diskPath = path.join(dir, storedName);
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(diskPath, buffer);

  return {
    original_name: file.name,
    stored_name: storedName,
    url: `/uploads/articles/${articleId}/${storedName}`,
    size: file.size,
    mime_type: file.type || 'application/octet-stream',
    uploaded_at: new Date().toISOString(),
  };
}
