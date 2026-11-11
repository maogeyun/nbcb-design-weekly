'use client';

import { useRef } from 'react';
import { IOSButton } from './IOSButton';

interface IOSSearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  showCancel?: boolean;
  onCancel?: () => void;
}

export function IOSSearchField({
  value,
  onChange,
  placeholder = '搜索',
  autoFocus = false,
  showCancel = false,
  onCancel,
}: IOSSearchFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="ios-search-field">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        style={{ flexShrink: 0, opacity: 0.4 }}
        aria-hidden
      >
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
      </svg>
      <input
        ref={inputRef}
        className="ios-search-input"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        enterKeyHint="search"
      />
      {showCancel && (
        <IOSButton
          variant="borderless"
          onClick={() => {
            onChange('');
            onCancel?.();
            inputRef.current?.blur();
          }}
        >
          取消
        </IOSButton>
      )}
    </div>
  );
}
