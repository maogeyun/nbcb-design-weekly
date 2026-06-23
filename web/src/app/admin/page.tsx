'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, Col, Row, Statistic, Typography } from 'antd';

const { Title, Paragraph } = Typography;

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    candidates: 0,
    latest: '无',
    issues: 0,
    skills: 0,
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/candidates').then((r) => r.json()),
      fetch('/api/issues/latest').then((r) => r.json()),
      fetch('/api/admin/issues').then((r) => r.json()),
      fetch('/api/admin/skills').then((r) => r.json()),
    ]).then(([candidates, latest, issues, skills]) => {
      if (candidates.error || issues.error || skills.error) {
        window.location.href = '/admin/login';
        return;
      }
      setStats({
        candidates: candidates.data?.length ?? 0,
        latest: latest.data
          ? `第 ${latest.data.issue_number} 期`
          : '无',
        issues: issues.data?.length ?? 0,
        skills: skills.data?.length ?? 0,
      });
    });
  }, []);

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 24 }}>
      <Title level={3}>编辑后台</Title>
      <Paragraph type="secondary">宁波银行设计周刊内容管理</Paragraph>

      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="候选池" value={stats.candidates} suffix="篇" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="最新发布" value={stats.latest} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="周刊总数" value={stats.issues} suffix="期" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="技能库" value={stats.skills} suffix="个" />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={8}>
          <Link href="/admin/candidates">
            <Card hoverable title="候选池" extra="管理 →">
              审核 AI 引言、选稿入刊
            </Card>
          </Link>
        </Col>
        <Col span={8}>
          <Link href="/admin/issues">
            <Card hoverable title="周刊列表" extra="管理 →">
              组刊编排与发布
            </Card>
          </Link>
        </Col>
        <Col span={8}>
          <Link href="/admin/skills">
            <Card hoverable title="技能管理" extra="管理 →">
              设计技能元数据与 Markdown
            </Card>
          </Link>
        </Col>
      </Row>

      <Paragraph style={{ marginTop: 24 }}>
        <Link href="/">← 返回前台</Link>
      </Paragraph>
    </div>
  );
}
