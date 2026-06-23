import { NextResponse } from 'next/server';
import { getSkillWithContent } from '@/lib/skills-store';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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
