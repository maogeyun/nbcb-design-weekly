import 'server-only';
import type { Skill } from '@/types';
import { getSkills } from '@/lib/skills-store';

export function loadSkills(): Skill[] {
  return getSkills();
}
