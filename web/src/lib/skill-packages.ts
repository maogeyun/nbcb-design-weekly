import 'server-only';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import {
  parseSkillMarkdown,
  SKILLS_DIR,
  type ParsedSkillMarkdown,
} from '@/lib/skill-files';

export const PACKAGES_SUBDIR = 'packages';
export const MAX_SKILL_PACKAGE_BYTES = 5 * 1024 * 1024;
export const SKILL_PACKAGE_PATH_RE = /^packages\/[a-z0-9]+(?:-[a-z0-9]+)*\.zip$/;

export interface ParsedSkillPackage extends ParsedSkillMarkdown {
  markdownEntry?: string;
}

function getPackagesDir(): string {
  return path.join(SKILLS_DIR, PACKAGES_SUBDIR);
}

export function buildSkillPackagePath(skillId: string): string {
  return `${PACKAGES_SUBDIR}/${skillId}.zip`;
}

export function resolveSkillPackagePath(packagePath: string): string {
  if (!SKILL_PACKAGE_PATH_RE.test(packagePath)) {
    throw new Error('无效的文件包路径');
  }
  const resolved = path.resolve(SKILLS_DIR, packagePath);
  const packagesDir = getPackagesDir();
  if (!resolved.startsWith(packagesDir + path.sep)) {
    throw new Error('无效的文件包路径');
  }
  return resolved;
}

export function skillPackageExists(packagePath: string): boolean {
  try {
    const diskPath = resolveSkillPackagePath(packagePath);
    return fs.existsSync(diskPath);
  } catch {
    return false;
  }
}

function findMarkdownEntry(
  entries: AdmZip.IZipEntry[],
  skillId: string,
): AdmZip.IZipEntry | undefined {
  const mdEntries = entries.filter(
    (entry) =>
      !entry.isDirectory &&
      entry.entryName.toLowerCase().endsWith('.md') &&
      !entry.entryName.includes('__MACOSX'),
  );

  const preferredNames = [
    'SKILL.md',
    'skill.md',
    `${skillId}.md`,
  ];

  for (const name of preferredNames) {
    const found = mdEntries.find(
      (entry) => entry.entryName.toLowerCase() === name.toLowerCase(),
    );
    if (found) return found;
  }

  const rootMd = mdEntries.find((entry) => !entry.entryName.includes('/'));
  if (rootMd) return rootMd;

  return mdEntries[0];
}

export function parseSkillPackageBuffer(
  buffer: Buffer,
  skillId: string,
): ParsedSkillPackage {
  const zip = new AdmZip(buffer);
  const entries = zip.getEntries();
  const markdownEntry = findMarkdownEntry(entries, skillId);

  if (!markdownEntry) {
    return { body: '' };
  }

  const raw = markdownEntry.getData().toString('utf-8');
  const parsed = parseSkillMarkdown(raw);
  return {
    ...parsed,
    markdownEntry: markdownEntry.entryName,
  };
}

export async function saveSkillPackageFile(
  skillId: string,
  file: File,
): Promise<{ packagePath: string; parsed: ParsedSkillPackage }> {
  const ext = path.extname(file.name).toLowerCase();
  if (ext !== '.zip') {
    throw new Error('仅支持 .zip 文件包');
  }
  if (file.size <= 0) {
    throw new Error('文件不能为空');
  }
  if (file.size > MAX_SKILL_PACKAGE_BYTES) {
    throw new Error('文件包不能超过 5MB');
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const parsed = parseSkillPackageBuffer(buffer, skillId);
  const packagePath = buildSkillPackagePath(skillId);
  const packagesDir = getPackagesDir();
  if (!fs.existsSync(packagesDir)) {
    fs.mkdirSync(packagesDir, { recursive: true });
  }

  const diskPath = resolveSkillPackagePath(packagePath);
  fs.writeFileSync(diskPath, buffer);

  return { packagePath, parsed };
}

export function deleteSkillPackage(packagePath: string): void {
  const diskPath = resolveSkillPackagePath(packagePath);
  if (fs.existsSync(diskPath)) {
    fs.unlinkSync(diskPath);
  }
}
