---
name: shape-up
description: 用 Shape Up（Basecamp）以 6 周固定周期+2 周冷却替代 Scrum：先 Shaping 成型问题，再 Betting 押注，再 Building 构建，时间固定范围浮动。
user-invokable: true
args:
  - name: pitch_topic
    description: 要成型/押注的主题或问题（可选）
    required: false
---

Shape Up 用“时间固定、范围浮动”解决 backlog 永远清不完与范围蔓延：先决定 Appetite（愿意投入的时间预算），再找能在预算内完成的解法。

## 8 周大循环

- **Shaping（并行持续）**：把 {pitch_topic} 成型成 Pitch（不是 Spec）
- **Betting Table（周期前）**：管理层押注选择下周期要做的 Pitch（不选=不做）
- **Building（6 周）**：小团队全权交付，无每日站会、少外部干扰
- **Cool-down（2 周）**：修 bug/债务/探索，也是下一轮 shaping 的缓冲

## Pitch 应包含什么（不是任务清单）

- 问题与目标（用户价值）
- Appetite（2周/6周等时间预算）
- 粗略解法轮廓（留白给团队）
- 明确“不做什么”（边界）

## Appetite vs Estimate

- **Appetite**：这件事值多少时间？（先定预算）
- **Estimate**：做完要多久？（把控制权交给工作量，容易延期）

## 适用场景

- 10–50 人团队想降低 Scrum 仪式成本
- 想阻止范围蔓延、减少计划会议
- 希望增强团队自主权、摆脱 JIRA 票据驱动

## 常见坑

- 写 Spec 而不是 Pitch（越写越死，越像 Scrum）
- 跳过 Shaping 直接开干（6 周变无边界爬行）
- 保留 backlog（Betting 精髓被破坏）
- Building 阶段不信任团队（频繁 check-in 破坏自主）

