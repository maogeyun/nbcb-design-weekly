import 'server-only';
import fs from 'fs';
import path from 'path';
import type { Skill, SkillCategory, SkillsData } from '@/types';
import {
  deleteSkillMarkdown,
  mergeSkillContent,
  readSkillMarkdown,
  skillMarkdownExists,
  writeSkillMarkdown,
} from '@/lib/skill-files';
import {
  deleteSkillPackage,
  skillPackageExists,
} from '@/lib/skill-packages';

const SKILLS_JSON_PATH = path.join(process.cwd(), 'data', 'skills.json');
const SKILL_ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const SKILL_CATEGORIES: SkillCategory[] = [
  'requirements_analysis',
  'user_analysis',
  'solution_design',
  'design_acceptance',
  'effect_validation',
];

export interface CreateSkillInput {
  id: string;
  name: string;
  introduction: string;
  category: SkillCategory;
  file_path?: string;
  download_url?: string;
  content?: string;
}

export interface UpdateSkillInput {
  name?: string;
  introduction?: string;
  category?: SkillCategory;
  download_url?: string;
  content?: string;
}

export function loadSkillsData(): SkillsData {
  try {
    if (fs.existsSync(SKILLS_JSON_PATH)) {
      const raw = fs.readFileSync(SKILLS_JSON_PATH, 'utf-8');
      return JSON.parse(raw) as SkillsData;
    }
  } catch {
    // fall through
  }
  return { skills: [] };
}

export function saveSkillsData(data: SkillsData): void {
  const dataDir = path.dirname(SKILLS_JSON_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(SKILLS_JSON_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export function getSkills(): Skill[] {
  return loadSkillsData().skills ?? [];
}

export function getSkillById(id: string): Skill | undefined {
  return getSkills().find((s) => s.id === id);
}

export function getSkillWithContent(id: string): {
  skill: Skill;
  content: string;
  has_package: boolean;
} | null {
  const skill = getSkillById(id);
  if (!skill) return null;
  const content = skill.file_path ? readSkillMarkdown(skill.file_path) : '';
  const has_package =
    skill.package_path ? skillPackageExists(skill.package_path) : false;
  return { skill, content, has_package };
}

function validateSkillId(id: string): string | null {
  if (!id || !SKILL_ID_RE.test(id)) {
    return 'ID 须为小写字母、数字与连字符组成的 slug';
  }
  return null;
}

function validateCategory(category: SkillCategory): string | null {
  if (!SKILL_CATEGORIES.includes(category)) {
    return '无效的分类';
  }
  return null;
}

function normalizeDownloadUrl(url: string | undefined): string | undefined {
  if (!url?.trim()) return undefined;
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return undefined;
    }
    return trimmed;
  } catch {
    return undefined;
  }
}

function writeSkillFile(skill: Skill, content: string): void {
  if (!skill.file_path) return;
  const merged = mergeSkillContent(skill, content);
  writeSkillMarkdown(skill.file_path, merged);
}

export function createSkill(input: CreateSkillInput): Skill | { error: string } {
  const idError = validateSkillId(input.id);
  if (idError) return { error: idError };

  const categoryError = validateCategory(input.category);
  if (categoryError) return { error: categoryError };

  if (!input.name?.trim()) {
    return { error: '名称不能为空' };
  }
  if (!input.introduction?.trim()) {
    return { error: '简介不能为空' };
  }

  const data = loadSkillsData();
  if (data.skills.some((s) => s.id === input.id)) {
    return { error: '该 ID 已存在' };
  }

  const file_path = input.file_path?.trim() || `${input.id}.md`;
  const download_url = normalizeDownloadUrl(input.download_url);

  const skill: Skill = {
    id: input.id,
    name: input.name.trim(),
    introduction: input.introduction.trim(),
    category: input.category,
    file_path: download_url ? undefined : file_path,
    download_url,
  };

  if (skill.file_path) {
    writeSkillFile(skill, input.content ?? '');
  }

  data.skills.push(skill);
  saveSkillsData(data);
  return skill;
}

export function updateSkill(
  id: string,
  patch: UpdateSkillInput,
): Skill | { error: string } | null {
  const data = loadSkillsData();
  const index = data.skills.findIndex((s) => s.id === id);
  if (index === -1) return null;

  const current = data.skills[index];

  if (patch.category !== undefined) {
    const categoryError = validateCategory(patch.category);
    if (categoryError) return { error: categoryError };
  }

  if (patch.name !== undefined && !patch.name.trim()) {
    return { error: '名称不能为空' };
  }
  if (patch.introduction !== undefined && !patch.introduction.trim()) {
    return { error: '简介不能为空' };
  }

  const download_url =
    patch.download_url !== undefined
      ? normalizeDownloadUrl(patch.download_url)
      : current.download_url;

  const updated: Skill = {
    ...current,
    name: patch.name !== undefined ? patch.name.trim() : current.name,
    introduction:
      patch.introduction !== undefined
        ? patch.introduction.trim()
        : current.introduction,
    category: patch.category ?? current.category,
    download_url,
    file_path: download_url ? undefined : current.file_path ?? `${id}.md`,
  };

  if (updated.file_path) {
    const content =
      patch.content !== undefined
        ? patch.content
        : readSkillMarkdown(updated.file_path);
    writeSkillFile(updated, content);
  }

  data.skills[index] = updated;
  saveSkillsData(data);
  return updated;
}

export function updateSkillContent(
  id: string,
  content: string,
): Skill | null {
  const data = loadSkillsData();
  const index = data.skills.findIndex((s) => s.id === id);
  if (index === -1) return null;

  const skill = data.skills[index];
  if (!skill.file_path) {
    skill.file_path = `${id}.md`;
    skill.download_url = undefined;
    data.skills[index] = skill;
    saveSkillsData(data);
  }

  const current = data.skills[index];
  writeSkillFile(current, content);
  return current;
}

export function deleteSkill(id: string): boolean {
  const data = loadSkillsData();
  const index = data.skills.findIndex((s) => s.id === id);
  if (index === -1) return false;

  const skill = data.skills[index];
  if (skill.file_path) {
    deleteSkillMarkdown(skill.file_path);
  }
  if (skill.package_path) {
    deleteSkillPackage(skill.package_path);
  }

  data.skills.splice(index, 1);
  saveSkillsData(data);
  return true;
}

export function updateSkillPackagePath(
  id: string,
  packagePath: string,
): Skill | null {
  const data = loadSkillsData();
  const index = data.skills.findIndex((s) => s.id === id);
  if (index === -1) return null;

  const skill = data.skills[index];
  if (skill.package_path && skill.package_path !== packagePath) {
    deleteSkillPackage(skill.package_path);
  }

  skill.package_path = packagePath;
  data.skills[index] = skill;
  saveSkillsData(data);
  return skill;
}

export function removeSkillPackage(id: string): Skill | null {
  const data = loadSkillsData();
  const index = data.skills.findIndex((s) => s.id === id);
  if (index === -1) return null;

  const skill = data.skills[index];
  if (skill.package_path) {
    deleteSkillPackage(skill.package_path);
    skill.package_path = undefined;
    data.skills[index] = skill;
    saveSkillsData(data);
  }
  return skill;
}

export function getSkillFileStatus(skill: Skill): 'file' | 'package' | 'url' | 'none' {
  if (skill.download_url) return 'url';
  if (skill.package_path && skillPackageExists(skill.package_path)) return 'package';
  if (skill.file_path && skillMarkdownExists(skill.file_path)) return 'file';
  if (skill.file_path || skill.package_path) return 'none';
  return 'none';
}
