'use client';

import { useEffect, useState } from 'react';
import { App, Button, Empty, Modal, Skeleton } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import type { Skill } from '@/types';
import { SkillCategoryTag } from '@/components/SkillCategoryTag';
import { SkillMarkdown } from '@/components/SkillMarkdown';
import { getSkillDownload } from '@/lib/skill-utils';

type SkillDetail = Skill & {
  content?: string;
  has_package?: boolean;
};

interface SkillDetailModalProps {
  open: boolean;
  skillId: string | null;
  onClose: () => void;
}

export function SkillDetailModal({
  open,
  skillId,
  onClose,
}: SkillDetailModalProps) {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [skill, setSkill] = useState<SkillDetail | null>(null);

  useEffect(() => {
    if (!open || !skillId) {
      setSkill(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setSkill(null);

    fetch(`/api/skills/${encodeURIComponent(skillId)}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error ?? '加载失败');
        }
        return json.data as SkillDetail;
      })
      .then((data) => {
        if (!cancelled) {
          setSkill(data);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          message.error(err.message || '加载失败');
          onClose();
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, skillId, message, onClose]);

  useEffect(() => {
    if (!open || !skillId) return;

    const body = document.querySelector<HTMLElement>(
      '.ant-modal-root.skill-detail-modal .ant-modal-body',
    );
    if (body) {
      body.scrollTop = 0;
    }
  }, [open, skillId]);

  const download = skill ? getSkillDownload(skill) : null;

  return (
    <Modal
      title={skill?.name ?? '技能详情'}
      open={open}
      onCancel={onClose}
      width={720}
      destroyOnHidden
      classNames={{ root: 'skill-detail-modal' }}
      footer={
        download ? (
          <Button
            icon={<DownloadOutlined />}
            href={download.href}
            download={download.filename}
            target={download.external ? '_blank' : undefined}
            rel={download.external ? 'noopener noreferrer' : undefined}
          >
            下载 skill
          </Button>
        ) : null
      }
      styles={{
        root: { maxWidth: 'calc(100vw - 32px)' },
        body: { maxHeight: '60vh', overflow: 'auto' },
      }}
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : skill ? (
        <div className="skill-detail-body">
          {(skill.category || skill.introduction) && (
            <div className="skill-detail-intro">
              {skill.category ? (
                <SkillCategoryTag category={skill.category} />
              ) : null}
              {skill.introduction ? (
                <p className="skill-detail-lead">{skill.introduction}</p>
              ) : null}
            </div>
          )}

          {skill.content ? (
            <SkillMarkdown content={skill.content} />
          ) : (
            <Empty description="暂无详细内容" />
          )}
        </div>
      ) : null}
    </Modal>
  );
}
