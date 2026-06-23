import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { createSkill, getSkills } from '@/lib/skills-store';
import type { SkillCategory } from '@/types';

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }
  return NextResponse.json({ data: getSkills() });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  const body = await request.json();
  const result = createSkill({
    id: body.id,
    name: body.name,
    introduction: body.introduction,
    category: body.category as SkillCategory,
    file_path: body.file_path,
    download_url: body.download_url,
    content: body.content,
  });

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ data: result });
}
