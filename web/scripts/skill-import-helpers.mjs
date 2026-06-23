import fs from 'fs';
import path from 'path';

export const SKILL_ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const CAIDAZI_PREFIX = 'caidazi-';
export const MAX_PACKAGE_BYTES = 5 * 1024 * 1024;

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

export const SKILL_CATEGORIES = [
  'requirements_analysis',
  'user_analysis',
  'solution_design',
  'design_acceptance',
  'effect_validation',
];

/** 常见框架展示名（id → name） */
export const NAME_MAP = {
  aarrr: 'AARRR 增长漏斗',
  'ab-testing': 'A/B 测试',
  'affinity-diagram': '亲和图',
  'ai-interaction-mode-selection': 'AI 交互模式选择',
  'analogical-thinking': '类比思维',
  'ansoff-matrix': 'Ansoff 增长矩阵',
  'antifragile-design': '反脆弱设计',
  'ant-design': 'Ant Design',
  antd: 'Ant Design 组件',
  'assumption-validation-board': '假设验证板',
  audit: '技术质量审计',
  'blue-ocean-errc': '蓝海 ERRC 策略',
  'business-model-canvas': '商业模式画布',
  'carbon-builder': 'Carbon Design System',
  circles: 'CIRCLES 问题推演',
  clarify: 'UX 文案优化',
  'competitive-analysis': '竞品分析',
  'competitive-positioning-map': '竞争定位地图',
  'component-spec-with-rationale': '组件规范（含原理）',
  'contextual-inquiry': '情境调研',
  'crazy-eights': 'Crazy 8s',
  cynefin: 'Cynefin 决策框架',
  daci: 'DACI 决策框架',
  'design-fidelity-audit': '设计还原度验收',
  'design-md-to-figma': 'design.md 转 Figma',
  'design-thinking': '设计思维',
  'diary-study': '日记研究',
  'double-diamond': '双钻模型',
  'ds-from-design-link': '从设计链接提取 DS',
  'ds-manifest-sync': 'DS Manifest 同步',
  'empathy-map': '同理心地图',
  'elevator-pitch': '电梯演讲',
  'empathy-driven-roadmap': '同理心驱动路线图',
  'event-storming': '事件风暴',
  'figma-ds-compose': 'Figma DS 组件搭建',
  'figma-make-kit-guidelines': 'Figma Make Kit 指南',
  'find-skills': '发现 Agent Skills',
  'first-principles': '第一性原理',
  'five-why': '五个为什么',
  'fogg-behavior-model': 'Fogg 行为模型',
  'four-actions-framework': '四行动框架',
  'frontend-design': '前端界面设计',
  'google-design-sprint': 'Google Design Sprint',
  'growth-flywheel': '增长飞轮',
  gtm: 'Go-to-Market',
  harden: '生产就绪加固',
  heart: 'HEART 指标',
  hmw: 'How Might We',
  'hook-model': 'Hook 上瘾模型',
  'how-now-wow': 'How/Now/Wow 矩阵',
  ice: 'ICE 优先级',
  'iceberg-model': '冰山模型',
  'impact-effort-matrix': '影响力×工作量矩阵',
  impeccable: '高品质前端实现',
  'innovation-diffusion-curve': '创新扩散曲线',
  'issue-tree': '问题树',
  'jobs-portfolio': 'Jobs Portfolio',
  'jobs-scoping': 'Jobs 边界界定',
  jtbd: 'Jobs to be Done',
  'jtbd-growth-matrix': 'JTBD 增长矩阵',
  kano: 'Kano 模型',
  'lean-canvas': 'Lean Canvas',
  'lean-startup-mvp': '精益创业 MVP',
  'lean-ux-canvas': 'Lean UX Canvas',
  'ltv-cac': 'LTV:CAC',
  'medium-design-digest': 'Medium 设计资讯摘要',
  'mental-models': '心智模型',
  'morphological-chart': '形态学矩阵',
  moscow: 'MoSCoW 优先级',
  'musk-five-steps': 'Musk 五步简化法',
  'network-effects': '网络效应',
  'north-star-metric': '北极星指标',
  'now-next-later': 'NOW/NEXT/LATER',
  ogsm: 'OGSM 战略',
  onboard: 'Onboarding 设计',
  'opportunity-solution-tree': '机会方案树',
  'pain-solution-matrix': '痛苦-解决方案矩阵',
  persona: '用户画像',
  pestle: 'PESTLE 分析',
  'platform-ecosystem-canvas': '平台生态画布',
  pmf: 'Product-Market Fit',
  'porter-five-forces': '波特五力',
  'pov-statement': 'POV 问题陈述',
  'priority-quadrant': '优先级四象限',
  'problem-solution-fit': '问题-方案契合',
  'product-lifecycle': '产品生命周期',
  pure: 'PURE 体验走查',
  rca: '根本原因分析',
  'req-to-design': '需求到设计',
  'reverse-brainstorming': '逆向头脑风暴',
  rice: 'RICE 优先级',
  scamper: 'SCAMPER',
  'semantic-token-naming': '语义化 Token 命名',
  'service-blueprint': '服务蓝图',
  'shape-up': 'Shape Up',
  'six-thinking-hats': '六顶思考帽',
  snap: 'SNAP 快速决策',
  sprint: 'Scrum Sprint',
  'story-spine': 'Story Spine',
  storybrand: 'StoryBrand',
  stp: 'STP 营销',
  swot: 'SWOT 分析',
  'systems-archetypes': '系统基模',
  'systems-thinking': '系统思维',
  'task-completion-rate': '任务完成率',
  'theory-of-constraints': '约束理论',
  'three-horizons': '三视野规划',
  'threshold-of-viable-ideas': '创意可行性门槛',
  triz: 'TRIZ 发明原理',
  'usability-testing-five-users': '五用户可用性测试',
  'user-feedback-loop': '用户反馈闭环',
  'user-interview-five-questions': '用户访谈五问法',
  'user-journey-map': '用户旅程地图',
  'user-story-map': '用户故事地图',
  'ux-designer': 'UX 设计师',
  'validated-learning-loop': '验证学习循环',
  'value-chain-analysis': '价值链分析',
  'value-proposition-canvas': '价值主张画布',
  'visual-acceptance-check': '视觉验收',
  'wardley-mapping': 'Wardley Map',
  'wizard-of-oz': '绿野仙踪法',
  'working-backwards': '反向工作法',
  'ckm-banner-design': 'CKM Banner 设计',
  'ckm-brand': 'CKM 品牌',
  'ckm-design': 'CKM 综合设计',
  'ckm-design-system': 'CKM 设计系统',
  'ckm-slides': 'CKM 演示文稿',
  'ckm-ui-styling': 'CKM UI 样式',
  'coffer-design': 'Coffer 设计系统',
  coss: 'COSS UI',
  'coss-particles': 'COSS Particles',
  extract: '设计系统提取',
  hue: '设计语言生成',
  'ui-ux-pro-max': 'UI/UX Pro Max',
  adapt: '响应式适配',
  animate: '动画与微交互',
  bolder: '视觉冲击力增强',
  colorize: '策略性配色',
  critique: 'UX 设计评审',
  delight: '愉悦感设计',
  distill: '设计简化',
  layout: '布局优化',
  optimize: 'UI 性能优化',
  overdrive: '高野心视觉实现',
  polish: '上线前打磨',
  quieter: '视觉降噪',
  shape: 'UX/UI 规划',
  typeset: '排版优化',
};

const USER_ANALYSIS_KEYWORDS = [
  'empathy',
  'persona',
  'interview',
  'contextual',
  'diary',
  'user-journey',
  'user-story',
  'onboard',
];

const REQUIREMENTS_KEYWORDS = [
  'jtbd',
  'five-why',
  'systems-thinking',
  'cynefin',
  'pestle',
  'swot',
  'porter',
  'lean-canvas',
  'rice',
  'moscow',
  'kano',
  'pmf',
  'north-star',
  'value-proposition',
  'jobs-',
  'first-principles',
  'issue-tree',
  'working-backwards',
  'ogsm',
  'ansoff',
  'business-model',
  'mental-models',
  'problem-solution',
  'pestle',
  'circles',
  'iceberg',
  'rca',
  'porter-five',
  'ltv-cac',
  'product-lifecycle',
  'platform-ecosystem',
  'wardley',
  'pestle',
  'assumption-validation',
  'elevator-pitch',
  'storybrand',
  'stp',
  'competitive-analysis',
  'competitive-positioning',
  'blue-ocean',
  'four-actions',
  'ansoff',
  'innovation-diffusion',
  'network-effects',
  'three-horizons',
  'theory-of-constraints',
  'systems-archetypes',
  'event-storming',
  'morphological',
  'analogical',
  'first-principles',
  'musk-five',
  'threshold-of-viable',
  'triz',
  'reverse-brainstorm',
  'six-thinking',
  'snap',
  'cynefin',
  'daci',
];

const DESIGN_ACCEPTANCE_KEYWORDS = [
  'visual-acceptance',
  'design-fidelity',
  'fidelity-audit',
  'medium-design',
];

const EFFECT_VALIDATION_KEYWORDS = [
  'usability',
  'wizard-of-oz',
  'aarrr',
  'hook-model',
  'ab-testing',
  'validated-learning',
  'task-completion',
  'heart',
  'user-feedback',
];

export function parseSkillMarkdown(raw) {
  const match = raw.match(FRONTMATTER_RE);
  if (!match) {
    return { body: raw, description: undefined };
  }
  const frontmatter = match[1];
  const description = frontmatter.match(/^description:\s*(.+)$/m)?.[1]?.trim();
  return {
    body: match[2],
    description,
  };
}

export function humanizeId(id) {
  return id.replace(/-/g, ' ');
}

export function extractFirstHeading(body) {
  const match = body.match(/^#\s+(.+)$/m);
  if (!match) return undefined;
  const heading = match[1].trim();
  if (heading.length > 0 && heading.length <= 80) {
    return heading;
  }
  return undefined;
}

export function extractIntroduction(description, body) {
  if (description?.trim()) {
    return description.trim();
  }
  const paragraph = body
    .split(/\n\n+/)
    .map((p) => p.trim())
    .find((p) => p && !p.startsWith('#'));
  if (paragraph) {
    return paragraph.replace(/\s+/g, ' ').slice(0, 500);
  }
  return humanizeId('skill');
}

export function inferCategory(id) {
  const lower = id.toLowerCase();
  if (USER_ANALYSIS_KEYWORDS.some((k) => lower.includes(k))) {
    return 'user_analysis';
  }
  if (DESIGN_ACCEPTANCE_KEYWORDS.some((k) => lower.includes(k))) {
    return 'design_acceptance';
  }
  if (EFFECT_VALIDATION_KEYWORDS.some((k) => lower.includes(k))) {
    return 'effect_validation';
  }
  if (REQUIREMENTS_KEYWORDS.some((k) => lower.includes(k))) {
    return 'requirements_analysis';
  }
  return 'solution_design';
}

export function inferSkillMeta(id, parsed, overrides = {}) {
  const override = overrides[id] ?? {};
  const introduction = override.introduction ?? extractIntroduction(
    parsed.description,
    parsed.body,
  );
  let name =
    override.name ??
    NAME_MAP[id] ??
    extractFirstHeading(parsed.body) ??
    humanizeId(id);
  const category = override.category ?? inferCategory(id);
  return { name, introduction, category };
}

export function scanSkillSources(sourceDirs) {
  const map = new Map();
  for (const src of sourceDirs) {
    if (!fs.existsSync(src)) {
      continue;
    }
    for (const name of fs.readdirSync(src)) {
      const skillPath = path.join(src, name, 'SKILL.md');
      if (!fs.existsSync(skillPath)) continue;
      if (!map.has(name)) {
        map.set(name, {
          id: name,
          dir: path.join(src, name),
          skillFile: skillPath,
        });
      }
    }
  }
  return map;
}

export function listDirFiles(dir, base = dir) {
  const entries = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      entries.push(...listDirFiles(full, base));
    } else {
      entries.push({
        abs: full,
        rel: path.relative(base, full).split(path.sep).join('/'),
        size: stat.size,
      });
    }
  }
  return entries;
}

export function hasExtraFiles(skillDir) {
  const files = listDirFiles(skillDir);
  return files.some((f) => f.rel !== 'SKILL.md');
}

export function estimateDirZipSize(skillDir) {
  return listDirFiles(skillDir).reduce((sum, f) => sum + f.size, 0);
}
