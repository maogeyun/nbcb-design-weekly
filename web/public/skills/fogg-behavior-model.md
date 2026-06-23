---
name: fogg-behavior-model
description: 用 Fogg 行为模型 B=MAP（动机×能力×触发）诊断转化/留存卡点，优先通过降低摩擦（提升能力）与精准触发推动目标行为发生。
user-invokable: true
args:
  - name: target_behavior
    description: 你希望用户完成的可观察具体行为（可选）
    required: false
---

Fogg 的反直觉结论：用户“不做”常不是动机不足，而是能力（太难/太耗时）或触发（时机不对）缺失。最有效杠杆通常是降低摩擦。

## 核心公式

\( B = M \times A \times P \)

- **M Motivation 动机**：快感/痛苦、希望/恐惧、社会认同/排斥
- **A Ability 能力**：时间、金钱、脑力、体力、与习惯偏离（越简单越高）
- **P Prompt 触发**：Spark（低动机激励）、Facilitator（低能力助力）、Signal（高M高A提醒）

## 使用流程

1) 定义 {target_behavior}（可计数、可观察、足够具体）
2) 评估当前 MAP：动机(1–10)、能力(1–10)、触发（有/无/时机错）
3) 优先做能力干预：减少步骤/缩短时间承诺/智能默认/一键完成
4) 设计触发策略：只在“行动线以上”触发；按 Spark/Facilitator/Signal 选型
5) 监控并迭代：行为发生率、步骤放弃率、触发打开后完成率、通知屏蔽率

## 典型场景

- Onboarding 激活率提升
- 转化漏斗优化（结账、付费、提交表单）
- 通知策略与习惯养成

