import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { getWechatSourceStatus } from '@/lib/rss-sources';
import { crawlRssFeeds } from '@/lib/store';

export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }
  const result = await crawlRssFeeds();
  return NextResponse.json({
    data: {
      ...result,
      wechat: getWechatSourceStatus(),
    },
  });
}
