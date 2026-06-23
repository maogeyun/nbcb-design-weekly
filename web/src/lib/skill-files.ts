import 'server-only';
import fs from 'fs';
import path from 'path';
import type { Skill } from '@/types';

export const SKILLS_DIR = path.join(process.cwd(), 'public', 'skills');
export const MAX_SKILL_MD_BYTES = 512 * 1024;
export const SKILL_FILE_PATH_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*\.md$/;

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

export interface ParsedSkillMarkdown {
  body: string;
  name?: string;
  description?: string;
}

export function isValidSkillFilePath(filePath: string): boolean {
  return SKILL_FILE_PATH_RE.test(filePath);
}

export function resolveSkillFilePath(filePath: string): string {
  if (!isValidSkillFilePath(filePath)) {
    throw new Error('无效的文件路径');
  }
  const resolved = path.resolve(SKILLS_DIR, filePath);
  if (!resolved.startsWith(SKILLS_DIR + path.sep)) {
    throw new Error('无效的文件路径');
  }
  return resolved;
}

export function buildSkillFrontmatter(
  skill: Pick<Skill, 'id' | 'introduction'>,
): string {
  return `---
name: ${skill.id}
description: ${skill.introduction}
user-invokable: true
---`;
}

export function parseSkillMarkdown(raw: string): ParsedSkillMarkdown {
  const match = raw.match(FRONTMATTER_RE);
  if (!match) {
    return { body: raw };
  }
  const frontmatter = match[1];
  const name = frontmatter.match(/^name:\s*(.+)$/m)?.[1]?.trim();
  const description = frontmatter.match(/^description:\s*(.+)$/m)?.[1]?.trim();
  return {
    body: match[2],
    name,
    description,
  };
}

export function mergeSkillContent(
  skill: Pick<Skill, 'id' | 'introduction'>,
  body: string,
): string {
  const trimmedBody = body.replace(/^\n+/, '');
  const frontmatter = buildSkillFrontmatter(skill);
  if (!trimmedBody) {
    return `${frontmatter}\n`;
  }
  return `${frontmatter}\n\n${trimmedBody}`;
}

export function readSkillMarkdown(filePath: string): string {
  const diskPath = resolveSkillFilePath(filePath);
  if (!fs.existsSync(diskPath)) {
    return '';
  }
  const raw = fs.readFileSync(diskPath, 'utf-8');
  return parseSkillMarkdown(raw).body;
}

export function writeSkillMarkdown(filePath: string, content: string): void {
  const diskPath = resolveSkillFilePath(filePath);
  if (!fs.existsSync(SKILLS_DIR)) {
    fs.mkdirSync(SKILLS_DIR, { recursive: true });
  }
  fs.writeFileSync(diskPath, content, 'utf-8');
}

export function deleteSkillMarkdown(filePath: string): void {
  const diskPath = resolveSkillFilePath(filePath);
  if (fs.existsSync(diskPath)) {
    fs.unlinkSync(diskPath);
  }
}

export function skillMarkdownExists(filePath: string): boolean {
  try {
    const diskPath = resolveSkillFilePath(filePath);
    return fs.existsSync(diskPath);
  } catch {
    return false;
  }
}

export async function readSkillMarkdownFromFile(file: File): Promise<string> {
  const ext = path.extname(file.name).toLowerCase();
  if (ext !== '.md') {
    throw new Error('仅支持 .md 文件');
  }
  if (file.size <= 0) {
    throw new Error('文件不能为空');
  }
  if (file.size > MAX_SKILL_MD_BYTES) {
    throw new Error('文件不能超过 512KB');
  }
  const raw = await file.text();
  return parseSkillMarkdown(raw).body;
}
