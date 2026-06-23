import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import AdmZip from 'adm-zip';
import {
  CAIDAZI_PREFIX,
  estimateDirZipSize,
  hasExtraFiles,
  inferSkillMeta,
  listDirFiles,
  MAX_PACKAGE_BYTES,
  parseSkillMarkdown,
  scanSkillSources,
  SKILL_CATEGORIES,
  SKILL_ID_RE,
} from './skill-import-helpers.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(__dirname, '..');
const SKILLS_JSON_PATH = path.join(WEB_ROOT, 'data', 'skills.json');
const META_PATH = path.join(WEB_ROOT, 'data', 'skill-import-meta.json');
const PUBLIC_SKILLS_DIR = path.join(WEB_ROOT, 'public', 'skills');
const PACKAGES_DIR = path.join(PUBLIC_SKILLS_DIR, 'packages');

const DEFAULT_SOURCES = [
  path.join(process.env.HOME ?? '', '.cursor', 'skills'),
  path.join(process.env.HOME ?? '', '.agents', 'skills'),
];

const dryRun = process.argv.includes('--dry-run');

function loadJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return fallback;
  }
}

function loadOverrides() {
  const data = loadJson(META_PATH, { overrides: {} });
  return data.overrides ?? {};
}

function loadExistingSkills() {
  const data = loadJson(SKILLS_JSON_PATH, { skills: [] });
  return data.skills ?? [];
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function zipSkillDirectory(skillDir, zipPath) {
  const zip = new AdmZip();
  const files = listDirFiles(skillDir);
  for (const file of files) {
    zip.addLocalFile(file.abs, path.dirname(file.rel) === '.' ? '' : path.dirname(file.rel));
  }
  zip.writeZip(zipPath);
  return fs.statSync(zipPath).size;
}

function copySkillMarkdown(src, dest) {
  fs.copyFileSync(src, dest);
}

function buildSkillEntry(id, meta, fileType) {
  const entry = {
    id,
    name: meta.name,
    introduction: meta.introduction,
    category: meta.category,
  };
  if (fileType === 'zip') {
    entry.package_path = `packages/${id}.zip`;
  } else {
    entry.file_path = `${id}.md`;
  }
  return entry;
}

function main() {
  const sourceDirs = DEFAULT_SOURCES;
  const scanned = scanSkillSources(sourceDirs);
  const existing = loadExistingSkills();
  const existingIds = new Set(existing.map((s) => s.id));
  const overrides = loadOverrides();

  const excludedCaidazi = [];
  const invalidIds = [];
  const skippedExisting = [];
  const toImport = [];

  for (const [id, info] of scanned) {
    if (id.startsWith(CAIDAZI_PREFIX)) {
      excludedCaidazi.push(id);
      continue;
    }
    if (!SKILL_ID_RE.test(id)) {
      invalidIds.push(id);
      continue;
    }
    if (existingIds.has(id)) {
      skippedExisting.push(id);
      continue;
    }
    toImport.push(info);
  }

  const warnings = [];
  const planned = [];

  for (const info of toImport) {
    const raw = fs.readFileSync(info.skillFile, 'utf-8');
    const parsed = parseSkillMarkdown(raw);
    const meta = inferSkillMeta(info.id, parsed, overrides);

    if (!SKILL_CATEGORIES.includes(meta.category)) {
      meta.category = 'solution_design';
    }

    let fileType = 'md';
    const extra = hasExtraFiles(info.dir);
    if (extra) {
      const estSize = estimateDirZipSize(info.dir);
      if (estSize <= MAX_PACKAGE_BYTES) {
        fileType = 'zip';
      } else {
        fileType = 'md';
        warnings.push(
          `${info.id}: 目录约 ${(estSize / 1024 / 1024).toFixed(2)}MB，超过 5MB，仅复制 SKILL.md`,
        );
      }
    }

    planned.push({
      ...info,
      meta,
      fileType,
      raw,
    });
  }

  console.log('=== Cursor Skills 导入 ===');
  console.log(`扫描源: ${sourceDirs.join(', ')}`);
  console.log(`模式: ${dryRun ? 'dry-run（不写文件）' : '写入'}`);
  console.log('');
  console.log(`扫描到唯一 ID: ${scanned.size}`);
  console.log(`排除财搭子 (caidazi-*): ${excludedCaidazi.length}`);
  console.log(`跳过已有: ${skippedExisting.length}`);
  console.log(`非法 ID 跳过: ${invalidIds.length}`);
  console.log(`待新增: ${planned.length}`);
  console.log('');

  if (excludedCaidazi.length) {
    console.log('排除财搭子:', excludedCaidazi.join(', '));
    console.log('');
  }

  if (invalidIds.length) {
    console.log('非法 ID:', invalidIds.join(', '));
    console.log('');
  }

  if (dryRun) {
    console.log('--- 待导入列表 ---');
    for (const item of planned) {
      console.log(
        `[${item.fileType}] ${item.id} | ${item.meta.name} | ${item.meta.category}`,
      );
    }
    if (warnings.length) {
      console.log('');
      console.log('--- 警告 ---');
      warnings.forEach((w) => console.log(w));
    }
    return;
  }

  ensureDir(PUBLIC_SKILLS_DIR);
  ensureDir(PACKAGES_DIR);

  const newEntries = [];

  for (const item of planned) {
    if (item.fileType === 'zip') {
      const zipPath = path.join(PACKAGES_DIR, `${item.id}.zip`);
      const size = zipSkillDirectory(item.dir, zipPath);
      if (size > MAX_PACKAGE_BYTES) {
        fs.unlinkSync(zipPath);
        warnings.push(`${item.id}: 打包后 ${(size / 1024 / 1024).toFixed(2)}MB，回退为 md`);
        const mdDest = path.join(PUBLIC_SKILLS_DIR, `${item.id}.md`);
        copySkillMarkdown(item.skillFile, mdDest);
        newEntries.push(buildSkillEntry(item.id, item.meta, 'md'));
      } else {
        newEntries.push(buildSkillEntry(item.id, item.meta, 'zip'));
      }
    } else {
      const mdDest = path.join(PUBLIC_SKILLS_DIR, `${item.id}.md`);
      copySkillMarkdown(item.skillFile, mdDest);
      newEntries.push(buildSkillEntry(item.id, item.meta, 'md'));
    }
  }

  const merged = {
    skills: [...existing, ...newEntries],
  };
  fs.writeFileSync(SKILLS_JSON_PATH, JSON.stringify(merged, null, 2) + '\n', 'utf-8');

  console.log(`已写入 ${newEntries.length} 条到 skills.json`);
  console.log(`skills.json 总计: ${merged.skills.length} 条`);
  if (warnings.length) {
    console.log('');
    console.log('--- 警告 ---');
    warnings.forEach((w) => console.log(w));
  }
}

main();
