'use client';

import { useEffect, useRef, useState } from 'react';
import {
  App,
  Button,
  Divider,
  Drawer,
  Form,
  Input,
  Select,
  Space,
  Typography,
  Upload,
} from 'antd';
import type { UploadProps } from 'antd';
import {
  DeleteOutlined,
  DownloadOutlined,
  InboxOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import type { Skill, SkillCategory } from '@/types';
import {
  SKILL_CATEGORY_LABELS,
  SKILL_CATEGORY_ORDER,
} from '@/lib/constants';

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

export interface SkillFormValues {
  id: string;
  name: string;
  introduction: string;
  category: SkillCategory;
  download_url?: string;
  content: string;
}

interface SkillEditorProps {
  open: boolean;
  skillId: string | null;
  onClose: () => void;
  onSaved: () => void;
}

const defaultValues: SkillFormValues = {
  id: '',
  name: '',
  introduction: '',
  category: 'requirements_analysis',
  download_url: '',
  content: '',
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function SkillEditor({
  open,
  skillId,
  onClose,
  onSaved,
}: SkillEditorProps) {
  const { message } = App.useApp();
  const [form] = Form.useForm<SkillFormValues>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingMd, setUploadingMd] = useState(false);
  const [uploadingPackage, setUploadingPackage] = useState(false);
  const [removingPackage, setRemovingPackage] = useState(false);
  const [packageInfo, setPackageInfo] = useState<{
    path?: string;
    name?: string;
    size?: number;
  } | null>(null);
  const pendingPackageRef = useRef<File | null>(null);
  const isCreate = skillId === null;

  useEffect(() => {
    if (!open) {
      pendingPackageRef.current = null;
      setPackageInfo(null);
      return;
    }

    if (isCreate) {
      form.setFieldsValue(defaultValues);
      return;
    }

    setLoading(true);
    fetch(`/api/admin/skills/${skillId}`)
      .then((res) => {
        if (res.status === 401) {
          window.location.href = '/admin/login';
          return null;
        }
        return res.json();
      })
      .then((json) => {
        if (!json?.data) {
          message.error(json?.error ?? '加载失败');
          return;
        }
        const skill = json.data as Skill & {
          content?: string;
          has_package?: boolean;
        };
        form.setFieldsValue({
          id: skill.id,
          name: skill.name,
          introduction: skill.introduction,
          category: skill.category,
          download_url: skill.download_url ?? '',
          content: skill.content ?? '',
        });
        if (skill.has_package && skill.package_path) {
          setPackageInfo({
            path: skill.package_path,
            name: skill.package_path.split('/').pop(),
          });
        } else {
          setPackageInfo(null);
        }
      })
      .finally(() => setLoading(false));
  }, [open, skillId, isCreate, form, message]);

  const applyPackageHints = (hints?: {
    name?: string;
    description?: string;
    markdown_entry?: string;
  }) => {
    if (!hints) return;
    const current = form.getFieldsValue();
    if (hints.name && !current.name?.trim()) {
      form.setFieldValue('name', hints.name);
    }
    if (hints.description && !current.introduction?.trim()) {
      form.setFieldValue('introduction', hints.description);
    }
    if (hints.markdown_entry) {
      message.info(`已从 ${hints.markdown_entry} 解析正文`);
    }
  };

  const uploadPackageFile = async (file: File) => {
    if (isCreate) {
      pendingPackageRef.current = file;
      setPackageInfo({ name: file.name, size: file.size });
      message.success(`已选择文件包：${file.name}，保存后将自动上传`);
      return;
    }

    setUploadingPackage(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`/api/admin/skills/${skillId}/package`, {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) {
        message.error(json.error ?? '文件包上传失败');
        return;
      }
      setPackageInfo({
        path: json.data?.package_path,
        name: file.name,
        size: file.size,
      });
      if (json.data?.content) {
        form.setFieldValue('content', json.data.content);
      }
      applyPackageHints(json.data?.hints);
      message.success('技能文件包已上传');
    } finally {
      setUploadingPackage(false);
    }
  };

  const handleRemovePackage = async () => {
    if (isCreate) {
      pendingPackageRef.current = null;
      setPackageInfo(null);
      return;
    }

    setRemovingPackage(true);
    try {
      const res = await fetch(`/api/admin/skills/${skillId}/package`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok) {
        message.error(json.error ?? '删除失败');
        return;
      }
      setPackageInfo(null);
      message.success('文件包已删除');
    } finally {
      setRemovingPackage(false);
    }
  };

  const handleMdUpload = async (file: File) => {
    if (isCreate) {
      try {
        const text = await file.text();
        const parsed = text.match(/^---[\r\n]+[\s\S]*?[\r\n]+---[\r\n]+([\s\S]*)$/);
        form.setFieldValue('content', parsed ? parsed[1] : text);
        message.success('已载入 Markdown 正文');
      } catch {
        message.error('读取文件失败');
      }
      return;
    }

    setUploadingMd(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`/api/admin/skills/${skillId}/file`, {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) {
        message.error(json.error ?? '上传失败');
        return;
      }
      form.setFieldValue('content', json.data?.content ?? '');
      message.success('Markdown 已替换');
    } finally {
      setUploadingMd(false);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const payload = {
        name: values.name,
        introduction: values.introduction,
        category: values.category,
        download_url: values.download_url,
        content: values.content,
      };

      const url = isCreate
        ? '/api/admin/skills'
        : `/api/admin/skills/${skillId}`;
      const method = isCreate ? 'POST' : 'PATCH';
      const body = isCreate ? { ...payload, id: values.id } : payload;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();

      if (!res.ok) {
        message.error(json.error ?? '保存失败');
        return;
      }

      const savedId = isCreate ? values.id : skillId;
      const pendingPackage = pendingPackageRef.current;
      if (pendingPackage && savedId) {
        const formData = new FormData();
        formData.append('file', pendingPackage);
        const packageRes = await fetch(`/api/admin/skills/${savedId}/package`, {
          method: 'POST',
          body: formData,
        });
        const packageJson = await packageRes.json();
        if (!packageRes.ok) {
          message.warning(
            `技能已保存，但文件包上传失败：${packageJson.error ?? '未知错误'}`,
          );
        } else {
          pendingPackageRef.current = null;
        }
      }

      message.success(isCreate ? '技能已创建' : '技能已更新');
      onSaved();
      onClose();
    } catch {
      // validation failed
    } finally {
      setSaving(false);
    }
  };

  const packageUploadProps: UploadProps = {
    accept: '.zip',
    maxCount: 1,
    showUploadList: false,
    disabled: uploadingPackage || loading,
    beforeUpload: (file) => {
      uploadPackageFile(file);
      return false;
    },
  };

  const mdUploadProps: UploadProps = {
    accept: '.md',
    maxCount: 1,
    showUploadList: false,
    disabled: uploadingMd || loading,
    beforeUpload: (file) => {
      handleMdUpload(file);
      return false;
    },
  };

  return (
    <Drawer
      title={isCreate ? '新建技能' : '编辑技能'}
      open={open}
      onClose={onClose}
      size={720}
      destroyOnHidden
      extra={
        <Space>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" loading={saving} onClick={handleSave}>
            保存
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical" disabled={loading}>
        <Title level={5} style={{ marginTop: 0 }}>基本信息</Title>

        {isCreate && (
          <Form.Item
            name="id"
            label="ID（slug）"
            rules={[
              { required: true, message: '请输入 ID' },
              {
                pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                message: '仅小写字母、数字与连字符',
              },
            ]}
          >
            <Input placeholder="例如 empathy-map" />
          </Form.Item>
        )}

        <Form.Item
          name="name"
          label="名称"
          rules={[{ required: true, message: '请输入名称' }]}
        >
          <Input placeholder="技能名称" />
        </Form.Item>

        <Form.Item
          name="category"
          label="分类"
          rules={[{ required: true, message: '请选择分类' }]}
        >
          <Select
            options={SKILL_CATEGORY_ORDER.map((key) => ({
              value: key,
              label: SKILL_CATEGORY_LABELS[key],
            }))}
          />
        </Form.Item>

        <Form.Item
          name="introduction"
          label="简介"
          rules={[{ required: true, message: '请输入简介' }]}
        >
          <TextArea rows={3} placeholder="一句话描述技能用途" />
        </Form.Item>

        <Form.Item name="download_url" label="外链文档（可选）">
          <Input placeholder="https://..." />
        </Form.Item>

        <Divider />

        <Title level={5}>技能文件包</Title>
        <Paragraph type="secondary" style={{ marginBottom: 12 }}>
          上传包含 SKILL.md 的 .zip 文件包，将自动解析正文并供用户下载完整包。
        </Paragraph>

        {packageInfo ? (
          <Space
            style={{
              width: '100%',
              marginBottom: 16,
              padding: 12,
              background: 'var(--ant-color-fill-quaternary)',
              borderRadius: 8,
            }}
            align="start"
          >
            <div style={{ flex: 1 }}>
              <Text strong>{packageInfo.name ?? '技能文件包'}</Text>
              {packageInfo.size !== undefined && (
                <Text type="secondary" style={{ marginLeft: 8 }}>
                  {formatFileSize(packageInfo.size)}
                </Text>
              )}
              {packageInfo.path && !isCreate && (
                <div style={{ marginTop: 4 }}>
                  <Button
                    type="link"
                    size="small"
                    icon={<DownloadOutlined />}
                    href={`/skills/${packageInfo.path}`}
                    download
                    style={{ padding: 0 }}
                  >
                    下载当前文件包
                  </Button>
                </div>
              )}
            </div>
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              loading={removingPackage}
              onClick={handleRemovePackage}
            >
              移除
            </Button>
          </Space>
        ) : null}

        <Upload.Dragger {...packageUploadProps}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            点击或拖拽上传技能文件包（.zip）
          </p>
          <p className="ant-upload-hint">
            推荐包含 SKILL.md，最大 5MB
            {isCreate ? '；保存后将自动上传' : ''}
          </p>
        </Upload.Dragger>

        <Divider />

        <Title level={5}>Markdown 正文</Title>
        <Paragraph type="secondary" style={{ marginBottom: 12 }}>
          用于前台展示与单文件下载；也可通过上传 .md 单独更新正文。
        </Paragraph>

        <Space style={{ marginBottom: 8 }}>
          <Upload {...mdUploadProps}>
            <Button
              size="small"
              icon={<UploadOutlined />}
              loading={uploadingMd}
            >
              上传 .md 替换
            </Button>
          </Upload>
        </Space>

        <Form.Item name="content" style={{ marginBottom: 0 }}>
          <TextArea rows={14} placeholder="技能正文（不含 frontmatter）" />
        </Form.Item>
      </Form>
    </Drawer>
  );
}
