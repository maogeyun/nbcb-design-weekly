import Link from 'next/link';
import type { ArticleCategory } from '@/types';
import { CATEGORY_LABELS } from '@/lib/constants';
import { categoryTagStyles } from '@/lib/tokens';

interface IOSGroupedListProps {
  children: React.ReactNode;
  className?: string;
}

export function IOSGroupedList({ children, className = '' }: IOSGroupedListProps) {
  return (
    <div className={`ios-grouped-inset ios-grouped-inset--no-border ${className}`.trim()}>
      {children}
    </div>
  );
}

interface IOSListCellProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  detail?: React.ReactNode;
  showChevron?: boolean;
  onClick?: () => void;
  href?: string;
}

export function IOSListCell({
  title,
  subtitle,
  detail,
  showChevron = true,
  onClick,
  href,
}: IOSListCellProps) {
  const content = (
    <>
      <div className="ios-list-cell-content">
        <div className="ios-list-cell-title">{title}</div>
        {subtitle && <div className="ios-list-cell-subtitle">{subtitle}</div>}
      </div>
      {detail && (
        <span className="ios-text-footnote" style={{ flexShrink: 0 }}>
          {detail}
        </span>
      )}
      {showChevron && (
        <svg className="ios-list-cell-chevron" viewBox="0 0 8 14" fill="none" aria-hidden>
          <path
            d="M1 1l6 6-6 6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className="ios-list-cell">
        {content}
      </Link>
    );
  }

  return (
    <div
      className="ios-list-cell"
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {content}
    </div>
  );
}

export function IOSSectionHeader({ children }: { children: React.ReactNode }) {
  return <h2 className="ios-section-header">{children}</h2>;
}

export function IOSCategoryTag({ category }: { category: ArticleCategory }) {
  const style = categoryTagStyles[category];
  return (
    <span
      className="ios-category-tag"
      style={{ color: style.color, background: style.background }}
    >
      {CATEGORY_LABELS[category]}
    </span>
  );
}

interface IOSFeedRowProps {
  title: string;
  body?: string;
  meta?: string;
  category?: ArticleCategory;
  href: string;
}

export function IOSFeedRow({ title, body, meta, category, href }: IOSFeedRowProps) {
  return (
    <IOSListCell
      href={href}
      title={
        <span style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {category && <IOSCategoryTag category={category} />}
          <span>{title}</span>
        </span>
      }
      subtitle={
        <>
          {body}
          {meta && (
            <span className="ios-text-footnote" style={{ display: 'block', marginTop: 6 }}>
              {meta}
            </span>
          )}
        </>
      }
    />
  );
}
