import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import {
  deleteSkill,
  getSkillById,
  getSkillWithContent,
  updateSkill,
} from '@/lib/skills-store';
import type { SkillCategory } from '@/types';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  const { id } = await params;
  const result = getSkillWithContent(id);
  if (!result) {
    return NextResponse.json({ error: '技能不存在' }, { status: 404 });
  }

  return NextResponse.json({
    data: {
      ...result.skill,
      content: result.content,
      has_package: result.has_package,
    },
  });
}

export async function PATCH(
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

  const body = await request.json();
  const result = updateSkill(id, {
    name: body.name,
    introduction: body.introduction,
    category: body.category as SkillCategory | undefined,
    download_url: body.download_url,
    content: body.content,
  });

  if (!result) {
    return NextResponse.json({ error: '技能不存在' }, { status: 404 });
  }
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ data: result });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  const { id } = await params;
  const ok = deleteSkill(id);
  if (!ok) {
    return NextResponse.json({ error: '技能不存在' }, { status: 404 });
  }

  return NextResponse.json({ data: { id } });
}
