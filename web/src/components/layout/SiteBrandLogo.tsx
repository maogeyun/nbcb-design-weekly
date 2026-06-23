'use client';

import Image from 'next/image';
import { Flex } from 'antd';

const BRAND_HEIGHT = 40;
const LOGO_NATURAL = { w: 1024, h: 143 };

function scaleWidth(naturalW: number, naturalH: number, height: number) {
  return Math.round((naturalW / naturalH) * height);
}

export function SiteBrandLogo() {
  const logoW = scaleWidth(LOGO_NATURAL.w, LOGO_NATURAL.h, BRAND_HEIGHT);

  return (
    <Flex align="center" className="site-brand">
      <Image
        src="/nbcb-brand-logo.png"
        alt="宁波银行 UED"
        width={logoW}
        height={BRAND_HEIGHT}
        priority
        className="site-brand-logo"
      />
    </Flex>
  );
}
