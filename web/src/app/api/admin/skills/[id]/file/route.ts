import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { readSkillMarkdownFromFile } from '@/lib/skill-files';
import { getSkillById, updateSkillContent } from '@/lib/skills-store';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  const { id } = await params;
  if (!getSkillById(id)) {
    return NextResponse.json({ error: '技能不存在' }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: '请选择文件' }, { status: 400 });
  }

  try {
    const content = await readSkillMarkdownFromFile(file);
    const updated = updateSkillContent(id, content);
    if (!updated) {
      return NextResponse.json({ error: '技能不存在' }, { status: 404 });
    }
    return NextResponse.json({ data: { content } });
  } catch (error) {
    const message = error instanceof Error ? error.message : '上传失败';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
