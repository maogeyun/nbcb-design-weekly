import { NextResponse } from 'next/server';
import { searchPublishedArticles } from '@/lib/store';
import { getSkills } from '@/lib/skills-store';
import { filterSkillsByKeyword } from '@/lib/skill-utils';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') ?? '';
  return NextResponse.json({
    query: q,
    data: {
      articles: searchPublishedArticles(q),
      skills: filterSkillsByKeyword(getSkills(), q),
    },
  });
}
