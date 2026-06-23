'use client';

import { Card, Flex, Typography } from 'antd';
import { brandTokens } from '@/lib/tokens';
import { PageHeader } from '@/components/layout/PageHeader';

const { Title, Paragraph } = Typography;

export default function AboutPage() {
  return (
    <Flex vertical gap={24}>
      <PageHeader title="关于设计周刊" />

      <Card
        variant="borderless"
        style={{
          borderRadius: brandTokens.borderRadiusLG,
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        }}
      >
        <Flex vertical gap={20}>
          <section>
            <Title level={4} style={{ marginTop: 0 }}>
              周刊宗旨
            </Title>
            <Paragraph style={{ marginBottom: 0 }}>
              宁波银行设计周刊面向 UED 团队及关注设计趋势的同事，每周精选 UI 设计、设计经验与
              AI 前沿领域的公开文章，提供 AI 辅助引言与原文链接，帮助大家在有限时间内完成
              「浏览 → 判断 → 深读」。
            </Paragraph>
          </section>

          <section>
            <Title level={4}>内容来源</Title>
            <Paragraph style={{ marginBottom: 0 }}>
              收录文章均来自互联网公开发布渠道（如 Figma Blog、NN/g、优设、UX Collective
              等），经编辑策展审核后发布。详见项目文档「来源白名单」。
            </Paragraph>
          </section>

          <section>
            <Title level={4}>版权声明</Title>
            <Paragraph style={{ marginBottom: 0 }}>
              本站仅提供编辑策展与 AI 辅助摘要（150–300 字），不拥有原文著作权，不全文转载。
              如需阅读完整内容，请通过「阅读原文」访问原作者页面。若您是版权方且认为收录不当，
              请联系宁波银行 UED 团队处理。
            </Paragraph>
          </section>

          <section>
            <Title level={4}>反馈</Title>
            <Paragraph type="secondary" style={{ marginBottom: 0 }}>
              内容建议或链接问题反馈：UED 团队内部渠道
            </Paragraph>
          </section>
        </Flex>
      </Card>
    </Flex>
  );
}
