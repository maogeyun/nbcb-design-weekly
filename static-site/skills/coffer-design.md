---
name: coffer-design
description: "This skill should be used when the user explicitly says 'Coffer style', 'Coffer design', '/coffer-design', or directly asks to use/apply the Coffer design system. NEVER trigger automatically for generic UI or design tasks."
user-invokable: true
---

# coffer-design

You are a senior product designer. When this skill is active, every UI decision follows this design language — derived from NBCB FIPS (宁波银行产业基金和项目管理系统).

**Before starting any design work, declare which fonts are required and how to load them** (see `references/platform-mapping.md`). Never assume fonts are already available.

---

## 1. DESIGN PHILOSOPHY

Warm orange discipline on an Ant Design enterprise skeleton. Coffer is a fund-and-project operations desk — tables first, charts second, decoration never. The `#FFA62F` accent appears only where money moves or a human must decide; everything else stays neutral gray on `#F7F7F9`. The tension: bank-grade restraint in layout density vs. a single warm brand color that signals action. Lineage: Ant Design Pro financial back-office, Chinese enterprise SaaS, NBCB digital wealth platforms.

---

## 2. CRAFT RULES — HOW TO COMPOSE

**Hierarchy layers**

| Layer | Treatment | Examples |
|-------|-----------|----------|
| Canvas | `#F7F7F9` page bg, no texture | Main content area |
| Surface | White cards, 1px `#E9E9E9` border, 8px radius | KPI tiles, chart panels |
| Control | 4px radius, border-defined | Buttons, inputs, selects |
| Signal | Orange accent OR semantic color only | Primary CTA, active tab, positive/negative delta |

**Typography discipline**

- One screen: max 2 weights (400 body, 600/700 headings). Tab active = 700.
- Display font for page titles only; body for everything else.
- Mono for fund codes, amounts, percentages, timestamps — never for prose.

**Spacing semantics**

- 8px grid. Card padding 16px. Section gaps 24px. Table cell padding 12px horizontal.
- Dense by default — this is operations software, not marketing.

**Color strategy**

- Max 2 chromatic hues per screen: orange + one semantic (green/red/amber).
- `#1890FF` reserved for informational links and chart series — never competes with orange CTAs.
- Status colors from tokens only: success `#52D393`, warning `#F7D519`, error `#F26D44`.

**Composition**

- Left sidebar (208px) + top breadcrumb + white content cards on gray canvas.
- Charts sit inside bordered cards, never floating on bare canvas.
- Squint test: orange dots should map 1:1 to interactive elements.

---

## 3. ANTI-PATTERNS — WHAT TO NEVER DO

- No drop shadows on cards — depth is border + background change only.
- No border-radius above 12px except login/marketing glass panels.
- No gradient backgrounds inside product UI (login hero is the exception).
- No purple/violet accent — orange is the sole brand chroma.
- No pill-shaped primary buttons — 4px radius rectangles only.
- No skeleton shimmer loaders — use Ant-style spinners or static empty states.
- No toast notifications stacking from bottom-right — use inline alerts or top banners.
- No more than one primary orange button per viewport section.
- No light-gray text below `#999` on white — fails WCAG for data labels.
- No decorative illustrations inside dashboard content areas.
- No mixing Element UI and Ant Design visual languages in the same screen.
- No lorem ipsum — use fund codes, project names, CNY amounts.

---

## 4. WORKFLOW

1. **Declare fonts** — Noto Sans SC + JetBrains Mono via Google Fonts
2. **Set tokens** — apply variables from `references/tokens.md`
3. **Build components** — use specs from `references/components.md`
4. **Check hierarchy** — squint test: orange = clickable, gray = read-only
5. **Verify both modes** — light is primary; dark must warm-tint neutrals, not cold-slate
6. **Test extremes** — empty table, 50-row table, ¥999,999,999.00 amounts
7. **Platform-adapt** — consult `references/platform-mapping.md`

---

## 5. REFERENCE FILES

| File | Contains |
|------|----------|
| `references/tokens.md` | Fonts, type scale, color system (light + dark), spacing, radii, elevation, motion, iconography |
| `references/components.md` | Buttons, cards, inputs, lists, navigation, tags, overlays, state patterns |
| `references/platform-mapping.md` | HTML/CSS, SwiftUI, React/Tailwind — platform-specific code and loading instructions |
