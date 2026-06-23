import type { Article } from '@/types';

export function generateIntroductionDraft(article: Article): string {
  const categoryHint =
    article.category === 'ui_design'
      ? '界面与视觉层面'
      : article.category === 'design_experience'
        ? '设计流程与协作'
        : 'AI 与设计结合';

  return (
    `【AI 草稿】本文来自 ${article.source_name}，围绕${categoryHint}展开讨论。` +
    `核心观点包括行业最新实践与可落地的设计策略，对宁波银行 UED 团队跟进趋势、` +
    `项目参考具有借鉴意义。建议阅读原文获取完整论述与案例细节。` +
    `（此为 Mock 生成，正式发布前需编辑审核确认。）`
  );
}
