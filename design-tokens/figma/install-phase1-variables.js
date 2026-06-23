const RUN_ID = 'nbcb-ds-2026-001';
const NS = 'dsb';

function hexToRgb(hex) {
  const c = hex.replace('#', '');
  return { r: parseInt(c.slice(0, 2), 16) / 255, g: parseInt(c.slice(2, 4), 16) / 255, b: parseInt(c.slice(4, 6), 16) / 255 };
}

function tag(node, key, phase) {
  node.setSharedPluginData(NS, 'run_id', RUN_ID);
  node.setSharedPluginData(NS, 'key', key);
  if (phase) node.setSharedPluginData(NS, 'phase', phase);
}

async function getOrCreateCollection(name, modeNames, key) {
  const existing = (await figma.variables.getLocalVariableCollectionsAsync()).find((c) => c.getSharedPluginData(NS, 'key') === key);
  if (existing) {
    const modeIds = {};
    for (const m of existing.modes) modeIds[m.name] = m.modeId;
    return { collection: existing, modeIds };
  }
  const collection = figma.variables.createVariableCollection(name);
  collection.renameMode(collection.modes[0].modeId, modeNames[0]);
  const modeIds = { [modeNames[0]]: collection.modes[0].modeId };
  for (let i = 1; i < modeNames.length; i++) modeIds[modeNames[i]] = collection.addMode(modeNames[i]);
  tag(collection, key, 'phase1');
  return { collection, modeIds };
}

async function getOrCreateVar(name, collection, type, key) {
  const all = await figma.variables.getLocalVariablesAsync();
  const found = all.find((v) => v.getSharedPluginData(NS, 'key') === key && v.variableCollectionId === collection.id);
  if (found) return found;
  const variable = figma.variables.createVariable(name, collection, type);
  tag(variable, key, 'phase1');
  return variable;
}

const primitiveColors = [
  ['orange/500', '#FFA62F'], ['orange/600', '#E5952A'], ['orange/50', '#FFF6EA'], ['orange/200', '#FFD397'],
  ['neutral/50', '#F7F7F9'], ['neutral/100', '#F5F5F5'], ['neutral/200', '#F0F0F0'], ['neutral/300', '#E9E9E9'],
  ['neutral/500', '#888888'], ['neutral/600', '#999999'], ['neutral/700', '#555555'], ['neutral/900', '#222222'],
  ['white/1000', '#FFFFFF'], ['green/900', '#14532D'], ['green/50', '#F0FDF4'], ['blue/500', '#1890FF'], ['blue/50', '#EFF6FF'],
  ['tag/ui-design/fg', '#CC8524'], ['tag/ui-design/bg', '#FFF6EA'], ['tag/design-exp/fg', '#14532D'], ['tag/design-exp/bg', '#F0FDF4'],
  ['tag/ai-frontier/fg', '#1890FF'], ['tag/ai-frontier/bg', '#EFF6FF'], ['tag/skill-req/fg', '#B45309'], ['tag/skill-req/bg', '#FFF6EA'],
  ['tag/skill-user/fg', '#7C3AED'], ['tag/skill-user/bg', '#F3E8FF'], ['tag/skill-solution/fg', '#0891B2'], ['tag/skill-solution/bg', '#ECFEFF'],
  ['tag/skill-acceptance/fg', '#14532D'], ['tag/skill-acceptance/bg', '#F0FDF4'], ['tag/skill-validation/fg', '#BE185D'], ['tag/skill-validation/bg', '#FDF2F8'],
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
  ['spacing/2xs', 4, 'GAP', 'var(--spacing-2xs)'], ['spacing/xs', 8, 'GAP', 'var(--spacing-xs)'],
  ['spacing/sm', 12, 'GAP', 'var(--spacing-sm)'], ['spacing/md', 16, 'GAP', 'var(--spacing-md)'],
  ['spacing/lg', 24, 'GAP', 'var(--spacing-lg)'], ['spacing/xl', 32, 'GAP', 'var(--spacing-xl)'],
  ['spacing/2xl', 48, 'GAP', 'var(--spacing-2xl)'], ['spacing/3xl', 64, 'GAP', 'var(--spacing-3xl)'],
  ['radius/sm', 4, 'CORNER_RADIUS', 'var(--radius-sm)'], ['radius/md', 8, 'CORNER_RADIUS', 'var(--radius-md)'],
  ['radius/lg', 12, 'CORNER_RADIUS', 'var(--radius-lg)'], ['radius/xl', 16, 'CORNER_RADIUS', 'var(--radius-xl)'],
  ['layout/header-height', 64, 'WIDTH_HEIGHT', 'var(--app-header-height)'],
  ['layout/content-max-width', 900, 'WIDTH_HEIGHT', 'var(--content-max-width)'],
  ['layout/page-max-width', 1280, 'WIDTH_HEIGHT', 'var(--layout-max-width)'],
  ['layout/control-height', 36, 'WIDTH_HEIGHT', 'var(--control-height)'],
];

const primColl = await getOrCreateCollection('Primitives', ['Value'], 'collection/primitives');
const colorColl = await getOrCreateCollection('Color', ['Light'], 'collection/color');
const spaceColl = await getOrCreateCollection('Spacing & Shape', ['Value'], 'collection/spacing-shape');
const typoColl = await getOrCreateCollection('Typography', ['Value'], 'collection/typography');

const primMode = primColl.modeIds.Value;
const lightMode = colorColl.modeIds.Light;
const spaceMode = spaceColl.modeIds.Value;
const typoMode = typoColl.modeIds.Value;
const primMap = {};

for (const [name, hex] of primitiveColors) {
  const v = await getOrCreateVar(name, primColl.collection, 'COLOR', `primitive/${name}`);
  v.setValueForMode(primMode, hexToRgb(hex));
  v.scopes = [];
  primMap[name] = v;
}

for (const [name, primName, scopes, css] of semanticColors) {
  const v = await getOrCreateVar(name, colorColl.collection, 'COLOR', `semantic/${name}`);
  v.setValueForMode(lightMode, figma.variables.createVariableAlias(primMap[primName]));
  v.scopes = scopes;
  if (css) v.setVariableCodeSyntax('WEB', css);
}

for (const [name, value, scope, css] of floatTokens) {
  const v = await getOrCreateVar(name, spaceColl.collection, 'FLOAT', `float/${name}`);
  v.setValueForMode(spaceMode, value);
  v.scopes = [scope];
  if (css) v.setVariableCodeSyntax('WEB', css);
}

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

for (const [name, value, scope, css] of stringTokens) {
  const v = await getOrCreateVar(name, typoColl.collection, 'STRING', `string/${name}`);
  v.setValueForMode(typoMode, value);
  v.scopes = [scope];
  if (css) v.setVariableCodeSyntax('WEB', css);
}
for (const [name, value, scope, css] of floatTypo) {
  const v = await getOrCreateVar(name, typoColl.collection, 'FLOAT', `float/${name}`);
  v.setValueForMode(typoMode, value);
  v.scopes = [scope];
  if (css) v.setVariableCodeSyntax('WEB', css);
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

const allVars = await figma.variables.getLocalVariablesAsync();
return { phase: 1, totalVariables: allVars.length, textStyles: (await figma.getLocalTextStylesAsync()).length, textStylesCreated, hasNoto };
