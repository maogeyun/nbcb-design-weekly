import type { IssueHomePreview, IssueSummary, Skill } from '@/types';

const IS_STATIC_EXPORT = process.env.NEXT_PUBLIC_STATIC_EXPORT === '1';

type SkillDetail = Skill & {
  content?: string;
  has_package?: boolean;
};

async function fetchApiData<T>(apiPath: string, staticPath: string): Promise<T> {
  const url = IS_STATIC_EXPORT ? staticPath : apiPath;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to load ${url}`);
  }
  const json = await res.json();
  return json.data as T;
}

export function isStaticExportMode(): boolean {
  return IS_STATIC_EXPORT;
}

export async function fetchLatestIssuePreview(): Promise<IssueHomePreview | null> {
  return fetchApiData<IssueHomePreview | null>(
    '/api/issues/latest',
    '/static-data/latest-issue.json',
  );
}

export async function fetchPublishedIssues(): Promise<IssueSummary[]> {
  return fetchApiData<IssueSummary[]>('/api/issues', '/static-data/issues.json');
}

export async function fetchSkillsList(): Promise<Skill[]> {
  return fetchApiData<Skill[]>('/api/skills', '/static-data/skills.json');
}

export async function fetchSkillDetail(skillId: string): Promise<SkillDetail> {
  return fetchApiData<SkillDetail>(
    `/api/skills/${encodeURIComponent(skillId)}`,
    `/static-data/skills/${encodeURIComponent(skillId)}.json`,
  );
}

export async function fetchLatestIssueId(): Promise<string | null> {
  const issue = await fetchLatestIssuePreview();
  return issue?.id ?? null;
}
