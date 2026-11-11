'use client';

import { useEffect } from 'react';
import { IOSButton } from './IOSButton';

interface IOSSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function IOSSheet({ open, onClose, title, children }: IOSSheetProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="ios-sheet-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="ios-sheet">
        <div className="ios-sheet-handle" aria-hidden />
        <div className="ios-sheet-header">
          <h2 className="ios-inline-title">{title}</h2>
          <IOSButton variant="borderless" onClick={onClose}>
            完成
          </IOSButton>
        </div>
        <div className="ios-sheet-body">{children}</div>
      </div>
    </div>
  );
}
