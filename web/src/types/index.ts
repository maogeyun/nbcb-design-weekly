export type ArticleCategory = 'ui_design' | 'design_experience' | 'ai_frontier';
export type ArticleStatus =
  | 'candidate'
  | 'selected'
  | 'published'
  | 'rejected'
  | 'archived';
export type IssueStatus = 'draft' | 'published' | 'unpublished';
export type LinkStatus = 'link_ok' | 'link_broken' | 'link_unknown';

export interface ArticleAttachment {
  original_name: string;
  stored_name: string;
  url: string;
  size: number;
  mime_type: string;
  uploaded_at: string;
}

export interface Article {
  id: string;
  title: string;
  original_url: string;
  source_name: string;
  published_at: string;
  category: ArticleCategory;
  introduction: string;
  language: 'zh' | 'en';
  link_status: LinkStatus;
  status: ArticleStatus;
  issue_id?: string;
  sort_order?: number;
  intro_reviewed: boolean;
  click_count?: number;
  attachment?: ArticleAttachment | null;
}

export interface WeeklyIssue {
  id: string;
  issue_number: number;
  title: string;
  publish_date: string;
  status: IssueStatus;
  cover_summary?: string;
  article_ids: string[];
}

export interface CategoryCounts {
  ui_design: number;
  design_experience: number;
  ai_frontier: number;
}

export interface IssueSummary extends WeeklyIssue {
  article_count: number;
  category_counts: CategoryCounts;
}

export interface IssueDetail extends WeeklyIssue {
  articles: Article[];
  article_count: number;
  category_counts: CategoryCounts;
}

/** 首页最新一期：摘要 + 前 3 篇预览文章 */
export interface IssueHomePreview extends IssueSummary {
  preview_articles: Article[];
}

export type SkillCategory =
  | 'requirements_analysis'
  | 'user_analysis'
  | 'solution_design'
  | 'design_acceptance'
  | 'effect_validation';

export interface Skill {
  id: string;
  name: string;
  introduction: string;
  category: SkillCategory;
  file_path?: string;
  package_path?: string;
  download_url?: string;
}

export interface SkillsData {
  skills: Skill[];
}
