import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { saveSkillPackageFile } from '@/lib/skill-packages';
import {
  getSkillById,
  removeSkillPackage,
  updateSkillContent,
  updateSkillPackagePath,
} from '@/lib/skills-store';

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
    const { packagePath, parsed } = await saveSkillPackageFile(id, file);
    const skill = updateSkillPackagePath(id, packagePath);
    if (!skill) {
      return NextResponse.json({ error: '技能不存在' }, { status: 404 });
    }

    if (parsed.body) {
      updateSkillContent(id, parsed.body);
    }

    return NextResponse.json({
      data: {
        package_path: packagePath,
        content: parsed.body,
        hints: {
          name: parsed.name,
          description: parsed.description,
          markdown_entry: parsed.markdownEntry,
        },
      },
    });
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
  const skill = removeSkillPackage(id);
  if (!skill) {
    return NextResponse.json({ error: '技能不存在' }, { status: 404 });
  }

  return NextResponse.json({ data: skill });
}
