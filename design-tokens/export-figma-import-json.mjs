#!/usr/bin/env node
/**
 * Export manifest.json → Figma native Variables import (DTCG 1.0).
 * One JSON per collection mode — drag into Variables modal or Import mode.
 *
 * Usage: node design-tokens/export-figma-import-json.mjs [outputDir]
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import { execSync } from 'node:child_process';

const __dir = dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(readFileSync(join(__dir, 'manifest.json'), 'utf8'));

const outDir =
  process.argv[2] ??
  join(homedir(), 'Desktop', 'NBCB-设计资讯-figma-variables');

function hexToSrgb(hex) {
  const c = hex.replace('#', '');
  const normalized = `#${c.toUpperCase()}`;
  return {
    colorSpace: 'srgb',
    components: [
      parseInt(c.slice(0, 2), 16) / 255,
      parseInt(c.slice(2, 4), 16) / 255,
      parseInt(c.slice(4, 6), 16) / 255,
    ],
    alpha: 1,
    hex: normalized,
  };
}

function nestToken(root, pathParts, leaf) {
  let cursor = root;
  for (let i = 0; i < pathParts.length - 1; i++) {
    const p = pathParts[i];
    cursor[p] = cursor[p] ?? {};
    cursor = cursor[p];
  }
  cursor[pathParts[pathParts.length - 1]] = leaf;
}

function aliasPath(name) {
  return name.split('/').join('.');
}

function figmaExtensions({ scopes, codeSyntax, aliasData }) {
  const ext = {};
  if (scopes?.length) ext.scopes = scopes;
  if (codeSyntax) ext.codeSyntax = { WEB: codeSyntax };
  if (aliasData) ext.aliasData = aliasData;
  return Object.keys(ext).length ? { 'com.figma': ext } : undefined;
}

function dtcgType(v) {
  if (v.type === 'COLOR') return 'color';
  if (v.type === 'FLOAT') {
    if (v.scopes?.includes('FONT_SIZE')) return 'dimension';
    return 'dimension';
  }
  if (v.scopes?.includes('FONT_FAMILY')) return 'fontFamily';
  return 'string';
}

function dtcgValue(v, primitiveLookup, collName) {
  if (v.type === 'COLOR') {
    if (v.alias) {
      const hex = primitiveLookup[v.alias];
      if (!hex) throw new Error(`Missing primitive for alias ${v.alias}`);
      return hexToSrgb(hex);
    }
    return hexToSrgb(v.value);
  }
  if (v.type === 'FLOAT') {
    return { value: v.value, unit: 'px' };
  }
  return v.value;
}

function buildCollectionModeFile(coll, primitiveLookup) {
  const doc = {
    $extensions: {
      'com.figma': {
        collectionName: coll.name,
        modeName: coll.mode,
        source: manifest.meta.name,
        version: manifest.meta.version,
      },
    },
  };

  for (const v of coll.variables) {
    const parts = v.name.split('/');
    const token = {
      $type: dtcgType(v),
      $value: dtcgValue(v, primitiveLookup, coll.name),
    };

    let aliasData;
    if (v.alias && coll.name !== 'Primitives') {
      aliasData = {
        targetVariableSetName: 'Primitives',
        targetVariableName: v.alias,
      };
    } else if (v.alias && coll.name === 'Primitives') {
      token.$value = `{${aliasPath(v.alias)}}`;
    }

    const extensions = figmaExtensions({
      scopes: v.scopes,
      codeSyntax: v.codeSyntax,
      aliasData,
    });
    if (extensions) token.$extensions = extensions;

    nestToken(doc, parts, token);
  }

  return doc;
}

function safeFileName(coll) {
  return `${coll.name.replace(/\s+&\s+/g, '-').replace(/\s+/g, '-')}-${coll.mode}.json`;
}

mkdirSync(outDir, { recursive: true });

const primitives = manifest.collections.find((c) => c.name === 'Primitives');
const primitiveLookup = Object.fromEntries(
  primitives.variables.filter((v) => v.value).map((v) => [v.name, v.value]),
);

const importOrder = [];
for (const coll of manifest.collections) {
  const fileName = safeFileName(coll);
  const filePath = join(outDir, fileName);
  const doc = buildCollectionModeFile(coll, primitiveLookup);
  writeFileSync(filePath, JSON.stringify(doc, null, 2), 'utf8');
  importOrder.push(fileName);
  console.log(`  ${fileName} (${coll.variables.length} variables)`);
}

const manifestPath = join(outDir, 'import-order.txt');
writeFileSync(
  manifestPath,
  [
    'NBCB 设计资讯 · Figma 变量导入包（原生 DTCG 格式）',
    '',
    '导入步骤：',
    '1. 打开 Figma → 右侧 Local variables → Open variables',
    '2. 按下列顺序，每个 JSON 对应一个 Collection：',
    '   a. 点击 + 新建 Collection（名称与文件名一致）',
    '   b. 右键该 Collection 的唯一 Mode → Import mode（或拖入 Variables 面板）',
    '   c. 选择对应 JSON 文件',
    '3. 必须先导入 Primitives，再导入 Color（Color 含跨 Collection 别名）',
    '',
    '导入顺序：',
    ...importOrder.map((f, i) => `${i + 1}. ${f}`),
    '',
    '格式说明：遵循 Figma 官方 DTCG 变量导入规范',
    'https://help.figma.com/hc/en-us/articles/15343816063383',
  ].join('\n'),
  'utf8',
);

const zipPath = join(homedir(), 'Desktop', 'NBCB-设计资讯-figma-variables.zip');
try {
  execSync(`cd "${outDir}" && zip -r "${zipPath}" .`, { stdio: 'pipe' });
  console.log(`\nZip → ${zipPath}`);
} catch {
  console.log('\n(zip 未生成，请手动压缩文件夹)');
}

const varCount = manifest.collections.reduce((n, c) => n + c.variables.length, 0);
console.log(`\nExported ${varCount} variables → ${outDir}`);
