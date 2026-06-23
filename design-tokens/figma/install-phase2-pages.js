const NS = 'dsb';
const RUN_ID = 'nbcb-ds-2026-001';

function tag(node, key, phase) {
  node.setSharedPluginData(NS, 'run_id', RUN_ID);
  node.setSharedPluginData(NS, 'key', key);
  if (phase) node.setSharedPluginData(NS, 'phase', phase);
}

function bindSolidFill(node, variable) {
  const base = { type: 'SOLID', color: { r: 0, g: 0, b: 0 } };
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

async function sem(name) {
  const all = await figma.variables.getLocalVariablesAsync();
  const v = all.find((x) => x.name === name);
  if (!v) throw new Error('Missing variable: ' + name);
  return v;
}

async function pickFontStyle(family, preferredStyles) {
  const fonts = await figma.listAvailableFontsAsync();
  for (const style of preferredStyles) {
    if (fonts.some((f) => f.fontName.family === family && f.fontName.style === style)) return style;
  }
  return fonts.find((f) => f.fontName.family === family).fontName.style;
}

const semMap = {};
for (const n of [
  'color/action/bg-primary', 'color/action/bg-primary-subtle', 'color/surface/page', 'color/surface/container',
  'color/text/primary', 'color/text/secondary', 'color/text/tertiary', 'color/border/default', 'color/border/subtle',
  'color/feedback/success/bg', 'color/feedback/info/bg',
  'color/tag/ui-design/bg', 'color/tag/ui-design/text', 'color/tag/design-exp/bg', 'color/tag/design-exp/text',
  'color/tag/ai-frontier/bg', 'color/tag/ai-frontier/text', 'color/tag/skill-req/bg', 'color/tag/skill-req/text',
  'color/tag/skill-user/bg', 'color/tag/skill-user/text', 'color/tag/skill-solution/bg', 'color/tag/skill-solution/text',
  'color/tag/skill-acceptance/bg', 'color/tag/skill-acceptance/text', 'color/tag/skill-validation/bg', 'color/tag/skill-validation/text',
]) semMap[n] = await sem(n);

const allFonts = await figma.listAvailableFontsAsync();
const hasNoto = allFonts.some((f) => f.fontName.family === 'Noto Sans SC');
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
  title.characters = 'NBCB 设计资讯 · Design Tokens';
  title.fontSize = 48;
  bindSolidFill(title, semMap['color/text/primary']);
  coverRoot.appendChild(title);
  const sub = figma.createText();
  sub.fontName = { family: 'Inter', style: 'Regular' };
  sub.characters = 'v1.0 · Light mode · Source: web/src/lib/tokens.ts\nGenerated via Figma MCP · 2026-06-23';
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
const allVars = await figma.variables.getLocalVariablesAsync();
return {
  phase: 2,
  fileUrl: 'https://www.figma.com/design/xegC1kLGJZMsSPEB55LuI8',
  pages: ['Cover', 'Foundations'],
  collections: collections.map((c) => ({ name: c.name, count: allVars.filter((v) => v.variableCollectionId === c.id).length })),
  totalVariables: allVars.length,
  textStyles: (await figma.getLocalTextStylesAsync()).length,
};
