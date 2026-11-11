#!/usr/bin/env python3
"""Capture dev page at 2056px desktop width and extract CDP styles."""
import json
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

OUT = Path(sys.argv[1])
URL = "http://localhost:3000/"
FRAME_W, FRAME_H = 2056, 1230


def style_of(page, selector, inner=None):
    return page.evaluate(
        """([selector, inner]) => {
          const root = document.querySelector(selector);
          if (!root) return null;
          const el = inner ? (root.querySelector(inner) || root) : root;
          const cs = getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          return {
            selector,
            inner,
            fontSize: cs.fontSize,
            fontWeight: cs.fontWeight,
            lineHeight: cs.lineHeight,
            color: cs.color,
            backgroundColor: cs.backgroundColor,
            borderRadius: cs.borderRadius,
            boxShadow: cs.boxShadow,
            border: cs.border,
            padding: cs.padding,
            gap: cs.gap || null,
            width: rect.width,
            height: rect.height,
            top: rect.top,
            left: rect.left,
            text: (el.innerText || '').slice(0, 120)
          };
        }""",
        [selector, inner],
    )


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    results = {}

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": FRAME_W, "height": FRAME_H},
            device_scale_factor=1,
        )
        page = context.new_page()
        page.goto(URL, wait_until="networkidle", timeout=90000)
        page.wait_for_function(
            "() => document.body.innerText.includes('本期精选文章')",
            timeout=60000,
        )
        page.wait_for_timeout(800)

        results["metrics"] = page.evaluate(
            """() => ({
              href: location.href,
              innerWidth: window.innerWidth,
              innerHeight: window.innerHeight,
              scrollWidth: document.documentElement.scrollWidth,
              scrollHeight: document.documentElement.scrollHeight,
              hasDesktopNav: !!document.querySelector('.desktop-nav') && getComputedStyle(document.querySelector('.desktop-nav')).display !== 'none',
              cardCount: document.querySelectorAll('.featured-article-card').length
            })"""
        )

        page.screenshot(path=str(OUT / "dev.png"), full_page=True)

        nav = page.evaluate(
            """() => [...document.querySelectorAll('.desktop-nav a')].map((a) => {
              const span = a.querySelector('span');
              const cs = getComputedStyle(span || a);
              const rect = a.getBoundingClientRect();
              return {
                label: a.innerText.trim(),
                fontSize: cs.fontSize,
                fontWeight: cs.fontWeight,
                lineHeight: cs.lineHeight,
                color: cs.color,
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height
              };
            })"""
        )

        results["styles"] = {
            "nav": nav,
            "heroBadge": style_of(page, ".home-hero span"),
            "heroTitle": style_of(page, ".home-hero h1"),
            "heroSubtitle": page.evaluate(
                """() => {
                  const hero = document.querySelector('.home-hero');
                  if (!hero) return null;
                  const texts = [...hero.querySelectorAll('.ant-typography')].filter(el => !el.closest('h1'));
                  const el = texts[0];
                  if (!el) return null;
                  const cs = getComputedStyle(el);
                  const rect = el.getBoundingClientRect();
                  return {
                    fontSize: cs.fontSize,
                    fontWeight: cs.fontWeight,
                    lineHeight: cs.lineHeight,
                    color: cs.color,
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height,
                    text: el.innerText.slice(0, 120)
                  };
                }"""
            ),
            "heroDivider": page.evaluate(
                """() => {
                  const spans = [...document.querySelectorAll('.home-hero span')];
                  const el = spans.find(s => getComputedStyle(s).height === '4px' || s.style.height === '4px' || getComputedStyle(s).backgroundColor.includes('255, 166, 47'));
                  if (!el) return null;
                  const cs = getComputedStyle(el);
                  const rect = el.getBoundingClientRect();
                  return {
                    width: rect.width,
                    height: rect.height,
                    borderRadius: cs.borderRadius,
                    backgroundColor: cs.backgroundColor,
                    top: rect.top,
                    left: rect.left
                  };
                }"""
            ),
            "sectionTitle": style_of(page, "section h2"),
            "sectionLink": page.evaluate(
                """() => {
                  const links = [...document.querySelectorAll('section a')];
                  const el = links.find(a => a.innerText.includes('查看全部'));
                  if (!el) return null;
                  const cs = getComputedStyle(el);
                  const rect = el.getBoundingClientRect();
                  return {
                    fontSize: cs.fontSize,
                    fontWeight: cs.fontWeight,
                    lineHeight: cs.lineHeight,
                    color: cs.color,
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height,
                    text: el.innerText.trim()
                  };
                }"""
            ),
            "cardRoot": style_of(page, ".featured-article-card"),
            "cardTitle": page.evaluate(
                """() => {
                  const card = document.querySelector('.featured-article-card');
                  const el = card?.querySelector('.ant-typography strong, .ant-typography');
                  if (!el) return null;
                  const cs = getComputedStyle(el);
                  const rect = el.getBoundingClientRect();
                  return {
                    fontSize: cs.fontSize,
                    fontWeight: cs.fontWeight,
                    lineHeight: cs.lineHeight,
                    color: cs.color,
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height
                  };
                }"""
            ),
            "cardBody": page.evaluate(
                """() => {
                  const card = document.querySelector('.featured-article-card');
                  const els = card ? [...card.querySelectorAll('.ant-typography')] : [];
                  const el = els[1];
                  if (!el) return null;
                  const cs = getComputedStyle(el);
                  const rect = el.getBoundingClientRect();
                  return {
                    fontSize: cs.fontSize,
                    fontWeight: cs.fontWeight,
                    lineHeight: cs.lineHeight,
                    color: cs.color,
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height
                  };
                }"""
            ),
            "ctaButton": style_of(page, "a[href='/archive'] .ant-btn"),
            "archiveStats": page.evaluate(
                """() => {
                  const btn = document.querySelector("a[href='/archive']");
                  const container = btn?.closest('div[style]')?.parentElement;
                  const texts = container ? [...container.querySelectorAll('.ant-typography')] : [];
                  const el = texts[texts.length - 1];
                  if (!el) return null;
                  const cs = getComputedStyle(el);
                  const rect = el.getBoundingClientRect();
                  return {
                    fontSize: cs.fontSize,
                    fontWeight: cs.fontWeight,
                    lineHeight: cs.lineHeight,
                    color: cs.color,
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height,
                    text: el.innerText.trim()
                  };
                }"""
            ),
            "footer": style_of(page, "footer .ant-typography"),
            "bodyBg": page.evaluate(
                "() => getComputedStyle(document.body).backgroundColor"
            ),
            "heroBg": page.evaluate(
                "() => document.querySelector('.home-hero') ? getComputedStyle(document.querySelector('.home-hero')).backgroundColor : null"
            ),
            "headerBg": page.evaluate(
                "() => document.querySelector('header') ? getComputedStyle(document.querySelector('header')).backgroundColor : null"
            ),
            "gridGap": page.evaluate(
                """() => {
                  const grid = document.querySelector('.home-article-grid');
                  if (!grid) return null;
                  const cs = getComputedStyle(grid);
                  return { gap: cs.gap, columnGap: cs.columnGap, rowGap: cs.rowGap };
                }"""
            ),
        }
        browser.close()

    (OUT / "cdp-styles.json").write_text(
        json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    try:
        from PIL import Image

        img = Image.open(OUT / "dev.png")
        w, h = img.size
    except Exception:
        w, h = FRAME_W, FRAME_H

    aligned = abs(w - FRAME_W) / FRAME_W <= 0.02

    meta = {
        "dev_input": {
            "type": "url",
            "url": URL,
            "resolved": results["metrics"]["href"],
            "capture": "Playwright full_page 2056px desktop dpr=1",
            "image": [w, h],
            "aligned_to_frame": aligned,
            "note": "3000 端口 webpack dev；Turbopack 中文路径 bug 已规避",
        },
        "design_input": {
            "platform": "figma",
            "type": "link",
            "url": "https://www.figma.com/design/Sd6rkUWJZoFPvjr4uAC4hn/%E6%91%B8%E9%B1%BC%E5%91%A8%E5%88%8A?node-id=4-2",
        },
        "production_url": URL,
        "resolved_url": results["metrics"]["href"],
        "capture_method": "Playwright viewport 2056×1230 dpr=1 full_page",
        "viewport": {"width": FRAME_W, "height": FRAME_H, "dpr": 1},
        "image_size": [w, h],
        "methodology": "Figma context + Playwright getComputedStyle",
        "requirements_confirmed": {},
        "corrections": [],
    }
    (OUT / "report-meta.json").write_text(
        json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(json.dumps({"width": w, "height": h, "aligned": aligned, "metrics": results["metrics"]}, ensure_ascii=False))


if __name__ == "__main__":
    main()
