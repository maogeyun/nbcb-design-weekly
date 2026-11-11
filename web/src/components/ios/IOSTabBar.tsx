'use client';

import { useRouter, usePathname } from 'next/navigation';

const SEARCH_TAB = {
  key: '/m/search',
  label: '搜索',
  icon: (
    <svg className="ios-tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
    </svg>
  ),
} as const;

const MAIN_TABS = [
  {
    key: '/m',
    label: '周刊',
    icon: (
      <svg className="ios-tab-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M6 4h12a2 2 0 012 2v14l-4-3-4 3-4-3-4 3V6a2 2 0 012-2z" />
      </svg>
    ),
  },
  {
    key: '/m/archive',
    label: '归档',
    icon: (
      <svg className="ios-tab-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M4 5h16v3H4V5zm0 5h10v3H4v-3zm0 5h16v3H4v-3z" />
      </svg>
    ),
  },
  {
    key: '/m/skills',
    label: '技能',
    icon: (
      <svg className="ios-tab-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
      </svg>
    ),
  },
  {
    key: '/m/about',
    label: '关于',
    icon: (
      <svg className="ios-tab-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
      </svg>
    ),
  },
] as const;

export function IOSTabBar({ latestIssueId }: { latestIssueId?: string | null }) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (key: string) => {
    if (key === '/m') {
      if (pathname === '/m' || pathname === '/m/') return true;
      const weeklyMatch = pathname.match(/^\/m\/weekly\/([^/?#]+)/);
      if (weeklyMatch && latestIssueId && weeklyMatch[1] === latestIssueId) {
        return true;
      }
      return false;
    }
    return pathname === key || pathname.startsWith(`${key}/`);
  };

  const searchActive = isActive(SEARCH_TAB.key);

  return (
    <nav className="ios-tab-bar" aria-label="主导航">
      <div className="ios-tab-bar-capsule ios-glass-bar">
        {MAIN_TABS.map((tab) => {
          const active = isActive(tab.key);

          return (
            <button
              key={tab.key}
              type="button"
              className={`ios-tab-item${active ? ' ios-tab-item--active' : ''}`}
              onClick={() => router.push(tab.key)}
              aria-current={active ? 'page' : undefined}
            >
              {active && <span className="ios-tab-selection-pill" aria-hidden />}
              <span className="ios-tab-item-content">
                {tab.icon}
                <span className="ios-text-caption2">{tab.label}</span>
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className={`ios-tab-search-standalone ios-glass-bar${searchActive ? ' ios-tab-search-standalone--active' : ''}`}
        onClick={() => router.push(SEARCH_TAB.key)}
        aria-current={searchActive ? 'page' : undefined}
        aria-label={SEARCH_TAB.label}
      >
        {SEARCH_TAB.icon}
      </button>
    </nav>
  );
}
