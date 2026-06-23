'use client';

import Link from 'next/link';
import { Button, Result } from 'antd';

export default function NotFound() {
  return (
    <Result
      status="404"
      title="页面不存在"
      subTitle="您访问的页面不存在或已下线"
      extra={[
        <Link key="home" href="/">
          <Button type="primary">回首页</Button>
        </Link>,
        <Link key="archive" href="/archive">
          <Button>查看归档</Button>
        </Link>,
      ]}
    />
  );
}
