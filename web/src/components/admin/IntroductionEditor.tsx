'use client';

import { App, Input, Typography } from 'antd';
import { INTRO_MAX, INTRO_MIN } from '@/lib/constants';
import {
  formatPastedIntroduction,
  introLengthHint,
} from '@/lib/intro-format';

const { Text } = Typography;
const { TextArea } = Input;

interface IntroductionEditorProps {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}

export function IntroductionEditor({
  value,
  onChange,
  rows = 10,
}: IntroductionEditorProps) {
  const { message } = App.useApp();
  const lengthStatus = introLengthHint(value.length);

  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pasted = event.clipboardData.getData('text/plain');
    if (!pasted.trim()) return;

    event.preventDefault();
    const textarea = event.currentTarget;
    const { selectionStart, selectionEnd } = textarea;
    const formatted = formatPastedIntroduction(pasted);
    const nextValue =
      value.slice(0, selectionStart) +
      formatted.text +
      value.slice(selectionEnd);

    onChange(nextValue);

    if (formatted.truncated || formatted.warnings.length > 0) {
      message.info(
        formatted.warnings.length > 0
          ? `已自动排版：${formatted.warnings.join('；')}`
          : `已自动排版，共 ${formatted.length} 字`,
      );
    } else {
      message.success(`已自动排版，共 ${formatted.length} 字`);
    }

    requestAnimationFrame(() => {
      const cursor = selectionStart + formatted.text.length;
      textarea.setSelectionRange(cursor, cursor);
      textarea.focus();
    });
  };

  return (
    <div>
      <Text type="secondary">AI 引言</Text>
      <TextArea
        rows={rows}
        style={{ marginTop: 8 }}
        value={value}
        placeholder="粘贴原文摘要或引言，将自动识别并排版"
        onChange={(event) => onChange(event.target.value)}
        onPaste={handlePaste}
      />
      <Text
        type={
          lengthStatus === 'ok'
            ? 'secondary'
            : lengthStatus === 'short'
              ? 'warning'
              : 'danger'
        }
        style={{ fontSize: 12, marginTop: 4, display: 'block' }}
      >
        {value.length} / {INTRO_MIN}–{INTRO_MAX} 字
        {lengthStatus === 'short' && value.length > 0
          ? ' · 偏短'
          : lengthStatus === 'long'
            ? ' · 超出建议长度'
            : ''}
      </Text>
    </div>
  );
}
