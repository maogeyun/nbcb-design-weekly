'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IOSButton } from './IOSButton';

interface IOSNavBarProps {
  title?: string;
  largeTitle?: string;
  showBack?: boolean;
  backLabel?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  rightLabel?: string;
  onRightClick?: () => void;
  scrollTargetId?: string;
}

export function IOSNavBar({
  title,
  largeTitle,
  showBack = false,
  backLabel = '返回',
  onBack,
  rightAction,
  rightLabel,
  onRightClick,
  scrollTargetId = 'ios-scroll-root',
}: IOSNavBarProps) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!largeTitle) return;

    const sentinel = document.getElementById(`${scrollTargetId}-sentinel`);
    if (!sentinel) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => setCollapsed(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-44px 0px 0px 0px' },
    );
    observerRef.current.observe(sentinel);

    return () => observerRef.current?.disconnect();
  }, [largeTitle, scrollTargetId]);

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    router.back();
  };

  const resolvedRight =
    rightAction ??
    (rightLabel ? (
      <IOSButton variant="borderless" onClick={onRightClick}>
        {rightLabel}
      </IOSButton>
    ) : null);

  return (
    <header className="ios-nav-bar ios-glass-nav">
      <div className="ios-nav-bar-inner">
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', minWidth: 0 }}>
          {showBack && (
            <IOSButton variant="borderless" onClick={handleBack}>
              <svg width="12" height="20" viewBox="0 0 12 20" fill="none" aria-hidden>
                <path
                  d="M10 2L2 10l8 8"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {backLabel}
            </IOSButton>
          )}
          {(title || (largeTitle && collapsed)) && (
            <h1 className="ios-inline-title" style={{ marginLeft: showBack ? 0 : 12 }}>
              {collapsed ? largeTitle ?? title : title}
            </h1>
          )}
        </div>
        {resolvedRight && <div style={{ flexShrink: 0 }}>{resolvedRight}</div>}
      </div>
      {largeTitle && !collapsed && (
        <h1 className="ios-large-title ios-scroll-collapse-title">{largeTitle}</h1>
      )}
    </header>
  );
}

export function IOSScrollSentinel({ id = 'ios-scroll-root' }: { id?: string }) {
  return <div id={`${id}-sentinel`} style={{ height: 1, marginTop: -1 }} aria-hidden />;
}
