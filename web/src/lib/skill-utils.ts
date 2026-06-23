import type { Skill, SkillCategory } from '@/types';
import { SKILL_CATEGORY_LABELS, SKILL_CATEGORY_ORDER } from '@/lib/constants';

const SKILL_CATEGORY_SET = new Set<string>(SKILL_CATEGORY_ORDER);

export function parseSkillCategory(raw: string | null): SkillCategory | undefined {
  if (!raw || !SKILL_CATEGORY_SET.has(raw)) {
    return undefined;
  }
  return raw as SkillCategory;
}

export function filterSkillsByCategory(
  skills: Skill[],
  category?: SkillCategory,
): Skill[] {
  if (!category) {
    return skills;
  }
  return skills.filter((skill) => skill.category === category);
}

export function filterSkillsByKeyword(skills: Skill[], keyword: string): Skill[] {
  const q = keyword.trim().toLowerCase();
  if (!q) return [];

  return skills.filter((skill) => {
    const haystack =
      `${skill.name} ${skill.id} ${skill.introduction} ${SKILL_CATEGORY_LABELS[skill.category]}`.toLowerCase();
    return haystack.includes(q);
  });
}

export interface SkillDownload {
  href: string;
  filename?: string;
  external?: boolean;
}

/** 解析技能下载目标：有文件包时优先下载文件包，否则回退到 Markdown 或外链。 */
export function getSkillDownload(skill: Skill): SkillDownload | null {
  if (skill.package_path) {
    return {
      href: `/skills/${skill.package_path}`,
      filename: skill.package_path.split('/').pop(),
    };
  }
  if (skill.file_path) {
    return {
      href: `/skills/${skill.file_path}`,
      filename: skill.file_path.split('/').pop() ?? skill.file_path,
    };
  }
  if (skill.download_url) {
    return {
      href: skill.download_url,
      external: true,
    };
  }
  return null;
}
