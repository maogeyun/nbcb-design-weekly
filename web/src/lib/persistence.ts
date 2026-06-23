import 'server-only';
import fs from 'fs';
import path from 'path';
import seedData from '@/mocks/seed.json';
import type { Article, WeeklyIssue } from '@/types';

export interface StoreData {
  issues: WeeklyIssue[];
  articles: Article[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
export const STORE_PATH = path.join(DATA_DIR, 'store.json');

export function getStoreMtime(): number {
  try {
    if (fs.existsSync(STORE_PATH)) {
      return fs.statSync(STORE_PATH).mtimeMs;
    }
  } catch {
    // ignore
  }
  return 0;
}

export function loadStore(): StoreData {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      return JSON.parse(raw) as StoreData;
    }
  } catch {
    // fall through to seed
  }
  return structuredClone(seedData as StoreData);
}

export function saveStore(data: StoreData): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export function resetStore(): StoreData {
  const data = structuredClone(seedData as StoreData);
  saveStore(data);
  return data;
}
