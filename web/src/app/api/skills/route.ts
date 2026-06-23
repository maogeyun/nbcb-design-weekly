import { NextResponse } from 'next/server';
import { loadSkills } from '@/lib/skills';

export async function GET() {
  return NextResponse.json({ data: loadSkills() });
}
