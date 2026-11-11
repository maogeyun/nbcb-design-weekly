'use client';

import { IOSNavBar } from '@/components/ios/IOSNavBar';
import { IOSGroupedList, IOSListCell } from '@/components/ios/IOSGroupedList';
import { toDesktopHref, PREFER_DESKTOP_COOKIE } from '@/lib/app-link';

function preferDesktop() {
  document.cookie = `${PREFER_DESKTOP_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

export default function MobileAboutPage() {
  return (
    <div>
      <IOSNavBar largeTitle="关于设计周刊" />

      <IOSGroupedList>
        <div className="ios-about-section">
          <h3 className="ios-text-headline">周刊宗旨</h3>
          <p className="ios-text-subhead" style={{ marginTop: 8 }}>
            宁波银行设计周刊面向 UED 团队及关注设计趋势的同事，每周精选 UI 设计、设计经验与
            AI 前沿领域的公开文章，提供 AI 辅助引言与原文链接，帮助大家在有限时间内完成
            「浏览 → 判断 → 深读」。
          </p>
        </div>
        <div className="ios-about-section">
          <h3 className="ios-text-headline">内容来源</h3>
          <p className="ios-text-subhead" style={{ marginTop: 8 }}>
            收录文章均来自互联网公开发布渠道（如 Figma Blog、NN/g、优设、UX Collective
            等），经编辑策展审核后发布。
          </p>
        </div>
        <div className="ios-about-section">
          <h3 className="ios-text-headline">版权声明</h3>
          <p className="ios-text-subhead" style={{ marginTop: 8 }}>
            本站仅提供编辑策展与 AI 辅助摘要（150–300 字），不拥有原文著作权，不全文转载。
            如需阅读完整内容，请通过「阅读原文」访问原作者页面。
          </p>
        </div>
        <div className="ios-about-section">
          <h3 className="ios-text-headline">反馈</h3>
          <p className="ios-text-subhead" style={{ marginTop: 8 }}>
            内容建议或链接问题反馈：UED 团队内部渠道
          </p>
        </div>
      </IOSGroupedList>

      <div style={{ marginTop: 24 }}>
        <IOSGroupedList>
          <IOSListCell
            title="查看桌面版"
            subtitle="在电脑上浏览完整站点"
            onClick={() => {
              preferDesktop();
              window.location.href = toDesktopHref('/about');
            }}
          />
        </IOSGroupedList>
      </div>

      <p className="ios-text-footnote" style={{ textAlign: 'center', padding: '24px 16px' }}>
        本文由 AI 辅助摘要，请访问原文获取完整内容 · © 宁波银行 UED
      </p>
    </div>
  );
}
