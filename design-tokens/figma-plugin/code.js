/**
 * NBCB Design Tokens — Figma Plugin (run in Figma Desktop)
 * Plugins → Development → Import plugin from manifest… → select manifest.json
 */
async function runMoyuCompleteOnly() {
  const NS = 'dsb';
  const RUN_ID = 'nbcb-ds-2026-001';

  function tag(node, key, phase) {
    node.setSharedPluginData(NS, 'run_id', RUN_ID);
    node.setSharedPluginData(NS, 'key', key);
    if (phase) node.setSharedPluginData(NS, 'phase', phase);
  }

  function bindSolidFill(node, variable) {
    const base = { type: 'SOLID', color: { r: 0, g: 0, b: 0 } };
    node.fills = [figma.variables.setBoundVariableForPaint(base, 'color', variable)];
  }

  function bindStroke(node, variable) {
    const base = { type: 'SOLID', color: { r: 0, g: 0, b: 0 } };
    node.strokes = [figma.variables.setBoundVariableForPaint(base, 'color', variable)];
    node.strokeWeight = 1;
  }

  function bindRadius(node, variable) {
    for (const key of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius']) {
      node.setBoundVariable(key, variable);
    }
  }

  async function sem(name) {
    const v = (await figma.variables.getLocalVariablesAsync()).find((x) => x.name === name);
    if (!v) throw new Error('Missing variable: ' + name);
    return v;
  }

  async function pickFontStyle(family, preferredStyles) {
    const fonts = await figma.listAvailableFontsAsync();
    for (const style of preferredStyles) {
      if (fonts.some((f) => f.fontName.family === family && f.fontName.style === style)) return style;
    }
    const fallback = fonts.find((f) => f.fontName.family === family);
    if (!fallback) throw new Error(`Font family not available: ${family}`);
    return fallback.fontName.style;
  }

  const semMap = {};
  for (const n of [
    'color/action/bg-primary', 'color/action/bg-primary-subtle', 'color/action/border-primary',
    'color/surface/page', 'color/surface/container',
    'color/text/primary', 'color/text/secondary', 'color/text/tertiary',
    'color/border/default', 'color/border/subtle',
    'color/feedback/success/bg', 'color/feedback/info/bg',
    'color/tag/ui-design/bg', 'color/tag/ui-design/text', 'color/tag/design-exp/bg', 'color/tag/design-exp/text',
    'color/tag/ai-frontier/bg', 'color/tag/ai-frontier/text', 'color/tag/skill-req/bg', 'color/tag/skill-req/text',
    'color/tag/skill-user/bg', 'color/tag/skill-user/text', 'color/tag/skill-solution/bg', 'color/tag/skill-solution/text',
    'color/tag/skill-acceptance/bg', 'color/tag/skill-acceptance/text', 'color/tag/skill-validation/bg', 'color/tag/skill-validation/text',
  ]) {
    semMap[n] = await sem(n);
  }

  const allFonts = await figma.listAvailableFontsAsync();
  const hasNoto = allFonts.some((f) => f.fontName.family === 'Noto Sans SC');
  const bodyFamily = hasNoto ? 'Noto Sans SC' : 'Inter';
  let textStylesCreated = 0;

  for (const [styleName, family, style, size, lh] of [
    ['Body/Medium', bodyFamily, 'Regular', 14, 21],
    ['Body/Small', bodyFamily, 'Regular', 13, 21],
    ['Heading/H2', bodyFamily, hasNoto ? 'Medium' : 'Semi Bold', 20, 27],
    ['Label/Mobile', bodyFamily, 'Regular', 11, 16],
  ]) {
    const styleKey = `text-style/${styleName}`;
    const existing = (await figma.getLocalTextStylesAsync()).find((s) => s.getSharedPluginData(NS, 'key') === styleKey);
    if (!existing) {
      await figma.loadFontAsync({ family, style });
      const ts = figma.createTextStyle();
      ts.name = styleName;
      ts.fontName = { family, style };
      ts.fontSize = size;
      ts.lineHeight = { value: lh, unit: 'PIXELS' };
      tag(ts, styleKey, 'phase1');
      textStylesCreated++;
    }
  }

  const coverFontFamily = hasNoto ? 'Noto Sans SC' : 'Inter';
  const coverTitleStyle = await pickFontStyle(coverFontFamily, ['Bold', 'Medium', 'Regular']);

  let coverPage = figma.root.children.find((p) => p.getSharedPluginData(NS, 'key') === 'page/Cover');
  if (!coverPage) {
    coverPage = figma.createPage();
    coverPage.name = 'Cover';
    tag(coverPage, 'page/Cover', 'phase2');
  }
  await figma.setCurrentPageAsync(coverPage);
  await figma.loadFontAsync({ family: coverFontFamily, style: coverTitleStyle });
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });

  if (!coverPage.findOne((n) => n.getSharedPluginData(NS, 'key') === 'frame/cover-root')) {
    const coverRoot = figma.createFrame();
    coverRoot.name = 'Cover';
    coverRoot.resize(1440, 900);
    coverRoot.layoutMode = 'VERTICAL';
    coverRoot.primaryAxisAlignItems = 'CENTER';
    coverRoot.counterAxisAlignItems = 'CENTER';
    coverRoot.itemSpacing = 24;
    coverRoot.paddingTop = 120;
    coverRoot.paddingBottom = 120;
    coverRoot.paddingLeft = 80;
    coverRoot.paddingRight = 80;
    tag(coverRoot, 'frame/cover-root', 'phase2');
    bindSolidFill(coverRoot, semMap['color/surface/page']);
    coverPage.appendChild(coverRoot);
    const title = figma.createText();
    title.fontName = { family: coverFontFamily, style: coverTitleStyle };
    title.characters = '摸鱼周刊 · Design Tokens';
    title.fontSize = 48;
    bindSolidFill(title, semMap['color/text/primary']);
    coverRoot.appendChild(title);
    const sub = figma.createText();
    sub.fontName = { family: 'Inter', style: 'Regular' };
    sub.characters = 'v1.0 · Light mode · Source: web/src/lib/tokens.ts\nGenerated 2026-06-23';
    sub.fontSize = 16;
    bindSolidFill(sub, semMap['color/text/secondary']);
    coverRoot.appendChild(sub);
  }

  let foundationsPage = figma.root.children.find((p) => p.getSharedPluginData(NS, 'key') === 'page/Foundations');
  if (!foundationsPage) {
    foundationsPage = figma.createPage();
    foundationsPage.name = 'Foundations';
    tag(foundationsPage, 'page/Foundations', 'phase2');
  }
  await figma.setCurrentPageAsync(foundationsPage);

  if (!foundationsPage.findOne((n) => n.getSharedPluginData(NS, 'key') === 'frame/foundations-root')) {
    await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
    await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });

    const foundRoot = figma.createFrame();
    foundRoot.name = 'Foundations';
    foundRoot.resize(1440, 1);
    foundRoot.layoutMode = 'VERTICAL';
    foundRoot.itemSpacing = 64;
    foundRoot.paddingTop = 80;
    foundRoot.paddingBottom = 120;
    foundRoot.paddingLeft = 80;
    foundRoot.paddingRight = 80;
    tag(foundRoot, 'frame/foundations-root', 'phase2');
    bindSolidFill(foundRoot, semMap['color/surface/container']);
    foundationsPage.appendChild(foundRoot);

    const pageTitle = figma.createText();
    pageTitle.fontName = { family: 'Inter', style: 'Bold' };
    pageTitle.characters = 'Foundations';
    pageTitle.fontSize = 40;
    bindSolidFill(pageTitle, semMap['color/text/primary']);
    foundRoot.appendChild(pageTitle);

    function section(title, key) {
      const sec = figma.createFrame();
      sec.name = title;
      sec.layoutMode = 'VERTICAL';
      sec.itemSpacing = 24;
      sec.fills = [];
      tag(sec, key, 'phase2');
      foundRoot.appendChild(sec);
      sec.layoutSizingHorizontal = 'FILL';
      const h = figma.createText();
      h.fontName = { family: 'Inter', style: 'Bold' };
      h.characters = title;
      h.fontSize = 24;
      bindSolidFill(h, semMap['color/text/primary']);
      sec.appendChild(h);
      return sec;
    }

    const colorSec = section('Color', 'section/color');
    for (const [label, key] of [
      ['Action Primary', 'color/action/bg-primary'], ['Surface Page', 'color/surface/page'],
      ['Surface Container', 'color/surface/container'], ['Text Primary', 'color/text/primary'],
      ['Text Secondary', 'color/text/secondary'], ['Border Default', 'color/border/default'],
      ['Success BG', 'color/feedback/success/bg'], ['Info BG', 'color/feedback/info/bg'],
    ]) {
      const row = figma.createFrame();
      row.layoutMode = 'HORIZONTAL';
      row.itemSpacing = 16;
      row.counterAxisAlignItems = 'CENTER';
      row.fills = [];
      colorSec.appendChild(row);
      row.layoutSizingHorizontal = 'FILL';
      const box = figma.createFrame();
      box.resize(120, 64);
      box.cornerRadius = 8;
      bindSolidFill(box, semMap[key]);
      row.appendChild(box);
      const lbl = figma.createText();
      lbl.fontName = { family: 'Inter', style: 'Regular' };
      lbl.characters = label;
      lbl.fontSize = 13;
      bindSolidFill(lbl, semMap['color/text/secondary']);
      row.appendChild(lbl);
    }

    const tagSec = section('Category Tags', 'section/tags');
    for (const [label, bgKey, fgKey] of [
      ['UI设计', 'color/tag/ui-design/bg', 'color/tag/ui-design/text'],
      ['设计经验', 'color/tag/design-exp/bg', 'color/tag/design-exp/text'],
      ['AI前沿', 'color/tag/ai-frontier/bg', 'color/tag/ai-frontier/text'],
      ['需求分析', 'color/tag/skill-req/bg', 'color/tag/skill-req/text'],
      ['用户分析', 'color/tag/skill-user/bg', 'color/tag/skill-user/text'],
      ['方案设计', 'color/tag/skill-solution/bg', 'color/tag/skill-solution/text'],
      ['设计验收', 'color/tag/skill-acceptance/bg', 'color/tag/skill-acceptance/text'],
      ['效果验证', 'color/tag/skill-validation/bg', 'color/tag/skill-validation/text'],
    ]) {
      const pill = figma.createFrame();
      pill.layoutMode = 'HORIZONTAL';
      pill.paddingLeft = 12;
      pill.paddingRight = 12;
      pill.paddingTop = 4;
      pill.paddingBottom = 4;
      pill.cornerRadius = 4;
      bindSolidFill(pill, semMap[bgKey]);
      const t = figma.createText();
      t.fontName = { family: 'Inter', style: 'Medium' };
      t.characters = label;
      t.fontSize = 12;
      bindSolidFill(t, semMap[fgKey]);
      pill.appendChild(t);
      tagSec.appendChild(pill);
    }

    const spaceSec = section('Spacing & Radius', 'section/spacing');
    const spaceVars = await figma.variables.getLocalVariablesAsync();
    for (const [label, varName] of [
      ['spacing/md = 16', 'spacing/md'], ['spacing/lg = 24', 'spacing/lg'],
      ['radius/md = 8', 'radius/md'], ['radius/lg = 12', 'radius/lg'],
    ]) {
      const v = spaceVars.find((x) => x.name === varName);
      const bar = figma.createFrame();
      bar.resize(varName.startsWith('spacing') ? 160 : 80, varName.startsWith('spacing') ? 24 : 80);
      bar.cornerRadius = varName.startsWith('radius') ? 8 : 4;
      bindSolidFill(bar, semMap['color/action/bg-primary-subtle']);
      if (varName.startsWith('radius')) bindStroke(bar, semMap['color/border/subtle']);
      if (v && varName.startsWith('spacing')) bar.setBoundVariable('width', v);
      if (v && varName.startsWith('radius')) bindRadius(bar, v);
      const lbl = figma.createText();
      lbl.fontName = { family: 'Inter', style: 'Regular' };
      lbl.characters = label;
      lbl.fontSize = 12;
      bindSolidFill(lbl, semMap['color/text/secondary']);
      spaceSec.appendChild(bar);
      spaceSec.appendChild(lbl);
    }

    const typoSec = section('Typography', 'section/typography');
    for (const ts of await figma.getLocalTextStylesAsync()) {
      if (!ts.getSharedPluginData(NS, 'key')?.startsWith('text-style/')) continue;
      await figma.loadFontAsync(ts.fontName);
      const sample = figma.createText();
      sample.textStyleId = ts.id;
      sample.characters = ts.name + ' — 设计资讯正文样例 Aa 123';
      bindSolidFill(sample, semMap['color/text/primary']);
      typoSec.appendChild(sample);
    }
  }

  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const vars = await figma.variables.getLocalVariablesAsync();
  return {
    totalVariables: vars.length,
    textStylesCreated,
    textStyles: (await figma.getLocalTextStylesAsync()).length,
    pages: figma.root.children.map((p) => p.name),
    collections: collections.map((c) => ({ name: c.name, count: vars.filter((v) => v.variableCollectionId === c.id).length })),
  };
}

async function main() {
const preCount = (await figma.variables.getLocalVariablesAsync()).length;
if (preCount >= 90) {
  const result = await runMoyuCompleteOnly();
  figma.closePlugin(
    `摸鱼周刊 tokens 补全: ${result.totalVariables} variables, ${result.textStyles} text styles, pages: ${result.pages.join(', ')}`,
  );
  return;
}

const RUN_ID = 'nbcb-ds-2026-001';
const NS = 'dsb';

function hexToRgb(hex) {
  const c = hex.replace('#', '');
  return {
    r: parseInt(c.slice(0, 2), 16) / 255,
    g: parseInt(c.slice(2, 4), 16) / 255,
    b: parseInt(c.slice(4, 6), 16) / 255,
  };
}

function tag(node, key, phase) {
  node.setSharedPluginData(NS, 'run_id', RUN_ID);
  node.setSharedPluginData(NS, 'key', key);
  if (phase) node.setSharedPluginData(NS, 'phase', phase);
}

async function getOrCreateCollection(name, modeNames, key) {
  const existing = (await figma.variables.getLocalVariableCollectionsAsync()).find(
    (c) => c.getSharedPluginData(NS, 'key') === key,
  );
  if (existing) {
    const modeIds = {};
    for (const m of existing.modes) modeIds[m.name] = m.modeId;
    return { collection: existing, modeIds, status: 'exists' };
  }
  const collection = figma.variables.createVariableCollection(name);
  collection.renameMode(collection.modes[0].modeId, modeNames[0]);
  const modeIds = { [modeNames[0]]: collection.modes[0].modeId };
  for (let i = 1; i < modeNames.length; i++) {
    modeIds[modeNames[i]] = collection.addMode(modeNames[i]);
  }
  tag(collection, key, 'phase1');
  return { collection, modeIds, status: 'created' };
}

async function getOrCreateVar(name, collection, type, key) {
  const all = await figma.variables.getLocalVariablesAsync();
  const found = all.find(
    (v) => v.getSharedPluginData(NS, 'key') === key && v.variableCollectionId === collection.id,
  );
  if (found) return { variable: found, status: 'exists' };
  const variable = figma.variables.createVariable(name, collection, type);
  tag(variable, key, 'phase1');
  return { variable, status: 'created' };
}

function bindSolidFill(node, variable) {
  const base = Array.isArray(node.fills) && node.fills.length ? { ...node.fills[0] } : { type: 'SOLID', color: { r: 0, g: 0, b: 0 } };
  base.type = 'SOLID';
  const paint = figma.variables.setBoundVariableForPaint(base, 'color', variable);
  node.fills = [paint];
}

function bindStroke(node, variable) {
  const base = { type: 'SOLID', color: { r: 0, g: 0, b: 0 } };
  const paint = figma.variables.setBoundVariableForPaint(base, 'color', variable);
  node.strokes = [paint];
  node.strokeWeight = 1;
}

function bindRadius(node, variable) {
  for (const key of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius']) {
    node.setBoundVariable(key, variable);
  }
}

async function pickFontStyle(family, preferredStyles) {
  const fonts = await figma.listAvailableFontsAsync();
  for (const style of preferredStyles) {
    if (fonts.some((f) => f.fontName.family === family && f.fontName.style === style)) {
      return style;
    }
  }
  const fallback = fonts.find((f) => f.fontName.family === family);
  if (!fallback) throw new Error(`Font family not available: ${family}`);
  return fallback.fontName.style;
}

// --- PRIMITIVE COLORS ---
const primitiveColors = [
  ['orange/500', '#FFA62F'],
  ['orange/600', '#E5952A'],
  ['orange/50', '#FFF6EA'],
  ['orange/200', '#FFD397'],
  ['neutral/50', '#F7F7F9'],
  ['neutral/100', '#F5F5F5'],
  ['neutral/200', '#F0F0F0'],
  ['neutral/300', '#E9E9E9'],
  ['neutral/500', '#888888'],
  ['neutral/600', '#999999'],
  ['neutral/700', '#555555'],
  ['neutral/900', '#222222'],
  ['white/1000', '#FFFFFF'],
  ['green/900', '#14532D'],
  ['green/50', '#F0FDF4'],
  ['blue/500', '#1890FF'],
  ['blue/50', '#EFF6FF'],
  ['tag/ui-design/fg', '#CC8524'],
  ['tag/ui-design/bg', '#FFF6EA'],
  ['tag/design-exp/fg', '#14532D'],
  ['tag/design-exp/bg', '#F0FDF4'],
  ['tag/ai-frontier/fg', '#1890FF'],
  ['tag/ai-frontier/bg', '#EFF6FF'],
  ['tag/skill-req/fg', '#B45309'],
  ['tag/skill-req/bg', '#FFF6EA'],
  ['tag/skill-user/fg', '#7C3AED'],
  ['tag/skill-user/bg', '#F3E8FF'],
  ['tag/skill-solution/fg', '#0891B2'],
  ['tag/skill-solution/bg', '#ECFEFF'],
  ['tag/skill-acceptance/fg', '#14532D'],
  ['tag/skill-acceptance/bg', '#F0FDF4'],
  ['tag/skill-validation/fg', '#BE185D'],
  ['tag/skill-validation/bg', '#FDF2F8'],
];

const semanticColors = [
  ['color/action/bg-primary', 'orange/500', ['FRAME_FILL', 'SHAPE_FILL'], 'var(--color-primary)'],
  ['color/action/bg-primary-hover', 'orange/600', ['FRAME_FILL', 'SHAPE_FILL'], 'var(--color-primary-hover)'],
  ['color/action/bg-primary-subtle', 'orange/50', ['FRAME_FILL', 'SHAPE_FILL'], 'var(--color-primary-bg)'],
  ['color/action/border-primary', 'orange/200', ['STROKE_COLOR'], 'var(--color-primary-border)'],
  ['color/surface/page', 'neutral/50', ['FRAME_FILL', 'SHAPE_FILL'], 'var(--color-bg)'],
  ['color/surface/container', 'white/1000', ['FRAME_FILL', 'SHAPE_FILL'], 'var(--color-bg-container)'],
  ['color/surface/hero', 'neutral/100', ['FRAME_FILL', 'SHAPE_FILL'], 'var(--color-hero-bg)'],
  ['color/border/default', 'neutral/300', ['STROKE_COLOR'], 'var(--color-border)'],
  ['color/border/subtle', 'neutral/200', ['STROKE_COLOR'], 'var(--color-border-secondary)'],
  ['color/text/primary', 'neutral/900', ['TEXT_FILL'], 'var(--color-text)'],
  ['color/text/secondary', 'neutral/700', ['TEXT_FILL'], 'var(--color-text-secondary)'],
  ['color/text/tertiary', 'neutral/600', ['TEXT_FILL'], 'var(--color-text-tertiary)'],
  ['color/text/muted', 'neutral/500', ['TEXT_FILL'], 'var(--color-text-muted)'],
  ['color/feedback/success/bg', 'green/50', ['FRAME_FILL', 'SHAPE_FILL'], 'var(--color-success-bg)'],
  ['color/feedback/success/text', 'green/900', ['TEXT_FILL'], 'var(--color-success)'],
  ['color/feedback/info/bg', 'blue/50', ['FRAME_FILL', 'SHAPE_FILL'], 'var(--color-info-bg)'],
  ['color/feedback/info/text', 'blue/500', ['TEXT_FILL'], 'var(--color-info)'],
  ['color/tag/ui-design/bg', 'tag/ui-design/bg', ['FRAME_FILL', 'SHAPE_FILL'], null],
  ['color/tag/ui-design/text', 'tag/ui-design/fg', ['TEXT_FILL'], null],
  ['color/tag/design-exp/bg', 'tag/design-exp/bg', ['FRAME_FILL', 'SHAPE_FILL'], null],
  ['color/tag/design-exp/text', 'tag/design-exp/fg', ['TEXT_FILL'], null],
  ['color/tag/ai-frontier/bg', 'tag/ai-frontier/bg', ['FRAME_FILL', 'SHAPE_FILL'], null],
  ['color/tag/ai-frontier/text', 'tag/ai-frontier/fg', ['TEXT_FILL'], null],
  ['color/tag/skill-req/bg', 'tag/skill-req/bg', ['FRAME_FILL', 'SHAPE_FILL'], null],
  ['color/tag/skill-req/text', 'tag/skill-req/fg', ['TEXT_FILL'], null],
  ['color/tag/skill-user/bg', 'tag/skill-user/bg', ['FRAME_FILL', 'SHAPE_FILL'], null],
  ['color/tag/skill-user/text', 'tag/skill-user/fg', ['TEXT_FILL'], null],
  ['color/tag/skill-solution/bg', 'tag/skill-solution/bg', ['FRAME_FILL', 'SHAPE_FILL'], null],
  ['color/tag/skill-solution/text', 'tag/skill-solution/fg', ['TEXT_FILL'], null],
  ['color/tag/skill-acceptance/bg', 'tag/skill-acceptance/bg', ['FRAME_FILL', 'SHAPE_FILL'], null],
  ['color/tag/skill-acceptance/text', 'tag/skill-acceptance/fg', ['TEXT_FILL'], null],
  ['color/tag/skill-validation/bg', 'tag/skill-validation/bg', ['FRAME_FILL', 'SHAPE_FILL'], null],
  ['color/tag/skill-validation/text', 'tag/skill-validation/fg', ['TEXT_FILL'], null],
];

const floatTokens = [
  ['spacing/2xs', 4, 'GAP', 'var(--spacing-2xs)'],
  ['spacing/xs', 8, 'GAP', 'var(--spacing-xs)'],
  ['spacing/sm', 12, 'GAP', 'var(--spacing-sm)'],
  ['spacing/md', 16, 'GAP', 'var(--spacing-md)'],
  ['spacing/lg', 24, 'GAP', 'var(--spacing-lg)'],
  ['spacing/xl', 32, 'GAP', 'var(--spacing-xl)'],
  ['spacing/2xl', 48, 'GAP', 'var(--spacing-2xl)'],
  ['spacing/3xl', 64, 'GAP', 'var(--spacing-3xl)'],
  ['radius/sm', 4, 'CORNER_RADIUS', 'var(--radius-sm)'],
  ['radius/md', 8, 'CORNER_RADIUS', 'var(--radius-md)'],
  ['radius/lg', 12, 'CORNER_RADIUS', 'var(--radius-lg)'],
  ['radius/xl', 16, 'CORNER_RADIUS', 'var(--radius-xl)'],
  ['layout/header-height', 64, 'WIDTH_HEIGHT', 'var(--app-header-height)'],
  ['layout/content-max-width', 900, 'WIDTH_HEIGHT', 'var(--content-max-width)'],
  ['layout/page-max-width', 1280, 'WIDTH_HEIGHT', 'var(--layout-max-width)'],
  ['layout/control-height', 36, 'WIDTH_HEIGHT', 'var(--control-height)'],
];

const stringTokens = [
  ['font/family/sans', 'Noto Sans SC', 'FONT_FAMILY', 'var(--font-family-sans)'],
  ['font/family/fallback', 'PingFang SC', 'FONT_FAMILY', null],
  ['weight/regular', 'Regular', 'FONT_STYLE', null],
  ['weight/medium', 'Medium', 'FONT_STYLE', null],
  ['weight/semibold', 'Semi Bold', 'FONT_STYLE', null],
];

const floatTypo = [
  ['type/body/sm', 13, 'FONT_SIZE', 'var(--font-size-body-sm)'],
  ['type/body/md', 14, 'FONT_SIZE', 'var(--font-size-body-md)'],
  ['type/body/lg', 16, 'FONT_SIZE', 'var(--font-size-body-lg)'],
  ['type/heading/h2', 20, 'FONT_SIZE', 'var(--font-size-heading-h2)'],
  ['type/label/sm', 11, 'FONT_SIZE', 'var(--font-size-label-sm)'],
  ['type/label/md', 12, 'FONT_SIZE', 'var(--font-size-label-md)'],
];

// --- CREATE COLLECTIONS ---
const primColl = await getOrCreateCollection('Primitives', ['Value'], 'collection/primitives');
const colorColl = await getOrCreateCollection('Color', ['Light'], 'collection/color');
const spaceColl = await getOrCreateCollection('Spacing & Shape', ['Value'], 'collection/spacing-shape');
const typoColl = await getOrCreateCollection('Typography', ['Value'], 'collection/typography');

const primMode = primColl.modeIds.Value;
const lightMode = colorColl.modeIds.Light;
const spaceMode = spaceColl.modeIds.Value;
const typoMode = typoColl.modeIds.Value;

const primMap = {};
const semMap = {};
const stats = { primitives: 0, semantic: 0, float: 0, string: 0, textStyles: 0, pages: [] };

for (const [name, hex] of primitiveColors) {
  const key = `primitive/${name}`;
  const { variable } = await getOrCreateVar(name, primColl.collection, 'COLOR', key);
  variable.setValueForMode(primMode, hexToRgb(hex));
  variable.scopes = [];
  primMap[name] = variable;
  stats.primitives++;
}

for (const [name, primName, scopes, css] of semanticColors) {
  const key = `semantic/${name}`;
  const { variable } = await getOrCreateVar(name, colorColl.collection, 'COLOR', key);
  const prim = primMap[primName];
  if (!prim) throw new Error(`Missing primitive: ${primName}`);
  variable.setValueForMode(lightMode, figma.variables.createVariableAlias(prim));
  variable.scopes = scopes;
  if (css) variable.setVariableCodeSyntax('WEB', css);
  semMap[name] = variable;
  stats.semantic++;
}

for (const [name, value, scope, css] of floatTokens) {
  const key = `float/${name}`;
  const { variable } = await getOrCreateVar(name, spaceColl.collection, 'FLOAT', key);
  variable.setValueForMode(spaceMode, value);
  variable.scopes = [scope];
  if (css) variable.setVariableCodeSyntax('WEB', css);
  stats.float++;
}

for (const [name, value, scope, css] of stringTokens) {
  const key = `string/${name}`;
  const { variable } = await getOrCreateVar(name, typoColl.collection, 'STRING', key);
  variable.setValueForMode(typoMode, value);
  variable.scopes = [scope];
  if (css) variable.setVariableCodeSyntax('WEB', css);
  stats.string++;
}

for (const [name, value, scope, css] of floatTypo) {
  const key = `float/${name}`;
  const { variable } = await getOrCreateVar(name, typoColl.collection, 'FLOAT', key);
  variable.setValueForMode(typoMode, value);
  variable.scopes = [scope];
  if (css) variable.setVariableCodeSyntax('WEB', css);
  stats.float++;
}

// --- TEXT STYLES ---
const allFonts = await figma.listAvailableFontsAsync();
const hasNoto = allFonts.some((f) => f.fontName.family === 'Noto Sans SC');
const bodyFamily = hasNoto ? 'Noto Sans SC' : 'Inter';
const textStyleDefs = [
  ['Body/Medium', bodyFamily, 'Regular', 14, 21],
  ['Body/Small', bodyFamily, 'Regular', 13, 21],
  ['Heading/H2', bodyFamily, hasNoto ? 'Medium' : 'Semi Bold', 20, 27],
  ['Label/Mobile', bodyFamily, 'Regular', 11, 16],
];

for (const [styleName, family, style, size, lh] of textStyleDefs) {
  const styleKey = `text-style/${styleName}`;
  const existing = (await figma.getLocalTextStylesAsync()).find((s) => s.getSharedPluginData(NS, 'key') === styleKey);
  if (!existing) {
    await figma.loadFontAsync({ family, style });
    const ts = figma.createTextStyle();
    ts.name = styleName;
    ts.fontName = { family, style };
    ts.fontSize = size;
    ts.lineHeight = { value: lh, unit: 'PIXELS' };
    tag(ts, styleKey, 'phase1');
    stats.textStyles++;
  }
}

// --- COVER PAGE ---
let coverPage = figma.root.children.find((p) => p.getSharedPluginData(NS, 'key') === 'page/Cover');
if (!coverPage) {
  coverPage = figma.createPage();
  coverPage.name = 'Cover';
  tag(coverPage, 'page/Cover', 'phase2');
}
await figma.setCurrentPageAsync(coverPage);

const coverFontFamily = hasNoto ? 'Noto Sans SC' : 'Inter';
const coverTitleStyle = await pickFontStyle(coverFontFamily, ['Bold', 'Medium', 'Regular']);
await figma.loadFontAsync({ family: coverFontFamily, style: coverTitleStyle });
await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });

let coverRoot = coverPage.findOne((n) => n.getSharedPluginData(NS, 'key') === 'frame/cover-root');
if (!coverRoot) {
  coverRoot = figma.createFrame();
  coverRoot.name = 'Cover';
  coverRoot.resize(1440, 900);
  coverRoot.layoutMode = 'VERTICAL';
  coverRoot.primaryAxisAlignItems = 'CENTER';
  coverRoot.counterAxisAlignItems = 'CENTER';
  coverRoot.itemSpacing = 24;
  coverRoot.paddingTop = 120;
  coverRoot.paddingBottom = 120;
  coverRoot.paddingLeft = 80;
  coverRoot.paddingRight = 80;
  tag(coverRoot, 'frame/cover-root', 'phase2');
  bindSolidFill(coverRoot, semMap['color/surface/page']);
  coverPage.appendChild(coverRoot);

  const title = figma.createText();
  title.fontName = { family: coverFontFamily, style: coverTitleStyle };
  title.characters = 'NBCB 设计资讯 · Design Tokens';
  title.fontSize = 48;
  bindSolidFill(title, semMap['color/text/primary']);
  coverRoot.appendChild(title);

  const sub = figma.createText();
  sub.fontName = { family: 'Inter', style: 'Regular' };
  sub.characters = 'v1.0 · Light mode · Source: web/src/lib/tokens.ts\nGenerated 2026-06-23';
  sub.fontSize = 16;
  bindSolidFill(sub, semMap['color/text/secondary']);
  coverRoot.appendChild(sub);

  if (!hasNoto) {
    const note = figma.createText();
    note.fontName = { family: 'Inter', style: 'Regular' };
    note.characters = 'Note: Noto Sans SC not installed — using Inter for text styles.';
    note.fontSize = 13;
    bindSolidFill(note, semMap['color/text/tertiary']);
    coverRoot.appendChild(note);
  }
}
stats.pages.push('Cover');

// --- FOUNDATIONS PAGE ---
let foundationsPage = figma.root.children.find((p) => p.getSharedPluginData(NS, 'key') === 'page/Foundations');
if (!foundationsPage) {
  foundationsPage = figma.createPage();
  foundationsPage.name = 'Foundations';
  tag(foundationsPage, 'page/Foundations', 'phase2');
}
await figma.setCurrentPageAsync(foundationsPage);

let foundRoot = foundationsPage.findOne((n) => n.getSharedPluginData(NS, 'key') === 'frame/foundations-root');
if (!foundRoot) {
  foundRoot = figma.createFrame();
  foundRoot.name = 'Foundations';
  foundRoot.resize(1440, 1);
  foundRoot.layoutMode = 'VERTICAL';
  foundRoot.primaryAxisAlignItems = 'MIN';
  foundRoot.counterAxisAlignItems = 'MIN';
  foundRoot.itemSpacing = 64;
  foundRoot.paddingTop = 80;
  foundRoot.paddingBottom = 120;
  foundRoot.paddingLeft = 80;
  foundRoot.paddingRight = 80;
  tag(foundRoot, 'frame/foundations-root', 'phase2');
  bindSolidFill(foundRoot, semMap['color/surface/container']);
  foundationsPage.appendChild(foundRoot);

  await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });

  const pageTitle = figma.createText();
  pageTitle.fontName = { family: 'Inter', style: 'Bold' };
  pageTitle.characters = 'Foundations';
  pageTitle.fontSize = 40;
  bindSolidFill(pageTitle, semMap['color/text/primary']);
  foundRoot.appendChild(pageTitle);

  function section(title, key) {
    const sec = figma.createFrame();
    sec.name = title;
    sec.layoutMode = 'VERTICAL';
    sec.itemSpacing = 24;
    sec.fills = [];
    tag(sec, key, 'phase2');
    foundRoot.appendChild(sec);
    sec.layoutSizingHorizontal = 'FILL';
    const h = figma.createText();
    h.fontName = { family: 'Inter', style: 'Bold' };
    h.characters = title;
    h.fontSize = 24;
    bindSolidFill(h, semMap['color/text/primary']);
    sec.appendChild(h);
    return sec;
  }

  function swatchRow(sec, label, bgVar, textVar) {
    const row = figma.createFrame();
    row.layoutMode = 'HORIZONTAL';
    row.itemSpacing = 16;
    row.counterAxisAlignItems = 'CENTER';
    row.fills = [];
    sec.appendChild(row);
    row.layoutSizingHorizontal = 'FILL';
    const box = figma.createFrame();
    box.resize(120, 64);
    box.cornerRadius = 8;
    bindSolidFill(box, bgVar);
    if (textVar) {
      bindStroke(box, semMap['color/border/subtle']);
    }
    row.appendChild(box);
    const lbl = figma.createText();
    lbl.fontName = { family: 'Inter', style: 'Regular' };
    lbl.characters = label;
    lbl.fontSize = 13;
    bindSolidFill(lbl, semMap['color/text/secondary']);
    row.appendChild(lbl);
  }

  const colorSec = section('Color', 'section/color');
  const colorSwatches = [
    ['Action Primary', semMap['color/action/bg-primary']],
    ['Surface Page', semMap['color/surface/page']],
    ['Surface Container', semMap['color/surface/container']],
    ['Text Primary', semMap['color/text/primary']],
    ['Text Secondary', semMap['color/text/secondary']],
    ['Border Default', semMap['color/border/default']],
    ['Success BG', semMap['color/feedback/success/bg']],
    ['Info BG', semMap['color/feedback/info/bg']],
  ];
  for (const [label, v] of colorSwatches) swatchRow(colorSec, label, v);

  const tagSec = section('Category Tags', 'section/tags');
  const tags = [
    ['UI设计', semMap['color/tag/ui-design/bg'], semMap['color/tag/ui-design/text']],
    ['设计经验', semMap['color/tag/design-exp/bg'], semMap['color/tag/design-exp/text']],
    ['AI前沿', semMap['color/tag/ai-frontier/bg'], semMap['color/tag/ai-frontier/text']],
    ['需求分析', semMap['color/tag/skill-req/bg'], semMap['color/tag/skill-req/text']],
    ['用户分析', semMap['color/tag/skill-user/bg'], semMap['color/tag/skill-user/text']],
    ['方案设计', semMap['color/tag/skill-solution/bg'], semMap['color/tag/skill-solution/text']],
    ['设计验收', semMap['color/tag/skill-acceptance/bg'], semMap['color/tag/skill-acceptance/text']],
    ['效果验证', semMap['color/tag/skill-validation/bg'], semMap['color/tag/skill-validation/text']],
  ];
  for (const [label, bg, fg] of tags) {
    const pill = figma.createFrame();
    pill.layoutMode = 'HORIZONTAL';
    pill.paddingLeft = 12;
    pill.paddingRight = 12;
    pill.paddingTop = 4;
    pill.paddingBottom = 4;
    pill.cornerRadius = 4;
    bindSolidFill(pill, bg);
    const t = figma.createText();
    t.fontName = { family: 'Inter', style: 'Medium' };
    t.characters = label;
    t.fontSize = 12;
    bindSolidFill(t, fg);
    pill.appendChild(t);
    tagSec.appendChild(pill);
  }

  const spaceSec = section('Spacing & Radius', 'section/spacing');
  const spaceVars = await figma.variables.getLocalVariablesAsync();
  for (const [label, varName] of [
    ['spacing/md = 16', 'spacing/md'],
    ['spacing/lg = 24', 'spacing/lg'],
    ['radius/md = 8', 'radius/md'],
    ['radius/lg = 12', 'radius/lg'],
  ]) {
    const v = spaceVars.find((x) => x.name === varName);
    const bar = figma.createFrame();
    bar.resize(varName.startsWith('spacing') ? 160 : 80, varName.startsWith('spacing') ? 24 : 80);
    bar.cornerRadius = varName.startsWith('radius') ? 8 : 4;
    bindSolidFill(bar, semMap['color/action/bg-primary-subtle']);
    if (varName.startsWith('radius')) bindStroke(bar, semMap['color/action/border-primary']);
    if (v && varName.startsWith('spacing')) bar.setBoundVariable('width', v);
    if (v && varName.startsWith('radius')) bindRadius(bar, v);
    const lbl = figma.createText();
    lbl.fontName = { family: 'Inter', style: 'Regular' };
    lbl.characters = label;
    lbl.fontSize = 12;
    bindSolidFill(lbl, semMap['color/text/secondary']);
    spaceSec.appendChild(bar);
    spaceSec.appendChild(lbl);
  }

  const typoSec = section('Typography', 'section/typography');
  const styles = await figma.getLocalTextStylesAsync();
  for (const ts of styles) {
    if (!ts.getSharedPluginData(NS, 'key')?.startsWith('text-style/')) continue;
    await figma.loadFontAsync(ts.fontName);
    const sample = figma.createText();
    sample.textStyleId = ts.id;
    sample.characters = `${ts.name} — 设计资讯正文样例 Aa 123`;
    bindSolidFill(sample, semMap['color/text/primary']);
    typoSec.appendChild(sample);
  }
}
stats.pages.push('Foundations');

// --- VALIDATE ---
const collections = await figma.variables.getLocalVariableCollectionsAsync();
const allVars = await figma.variables.getLocalVariablesAsync();
const missingSyntax = allVars.filter((v) => !v.remote && v.resolvedType !== 'BOOLEAN' && !v.codeSyntax.WEB && v.scopes.length > 0 && !v.name.startsWith('color/tag/'));
const brokenAliases = [];
for (const v of allVars) {
  for (const val of Object.values(v.valuesByMode)) {
    if (val && typeof val === 'object' && val.type === 'VARIABLE_ALIAS') {
      if (!allVars.find((t) => t.id === val.id)) brokenAliases.push(v.name);
    }
  }
}

const result = {
  runId: RUN_ID,
  stats,
  collections: collections.map((c) => ({ name: c.name, count: allVars.filter((v) => v.variableCollectionId === c.id).length })),
  totalVariables: allVars.length,
  textStyles: (await figma.getLocalTextStylesAsync()).length,
  validation: {
    missingCodeSyntax: missingSyntax.length,
    brokenAliases: brokenAliases.length,
    ok: brokenAliases.length === 0,
  },
};

figma.closePlugin(
  `NBCB tokens installed: ${result.totalVariables} variables, ${result.textStyles} text styles, pages: ${stats.pages.join(', ')}`,
);
}

main().catch((err) => figma.closePlugin(`Error: ${err.message}`));
