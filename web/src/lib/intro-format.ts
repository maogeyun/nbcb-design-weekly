import { INTRO_MAX, INTRO_MIN } from './constants';

export interface FormatIntroResult {
  text: string;
  length: number;
  truncated: boolean;
  warnings: string[];
}

const HTML_ENTITY_MAP: Record<string, string> = {
  nbsp: ' ',
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
};

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity: string) => {
      if (entity.startsWith('#x') || entity.startsWith('#X')) {
        const code = Number.parseInt(entity.slice(2), 16);
        return Number.isNaN(code) ? match : String.fromCodePoint(code);
      }
      if (entity.startsWith('#')) {
        const code = Number.parseInt(entity.slice(1), 10);
        return Number.isNaN(code) ? match : String.fromCodePoint(code);
      }
      return HTML_ENTITY_MAP[entity.toLowerCase()] ?? match;
    })
    .replace(/\\u([0-9a-f]{4})/gi, (_, hex: string) =>
      String.fromCharCode(Number.parseInt(hex, 16)),
    );
}

function normalizeIntroLine(line: string): string {
  return collapseSpacesForIntro(line.trim());
}

function preserveLineBreaks(text: string): string {
  return text
    .split('\n')
    .map((line) => normalizeIntroLine(line))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function stripLeadingTitleLine(text: string): string {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length < 2) return text;

  const first = lines[0];
  const looksLikeTitle =
    first.length <= 48 &&
    !/[。！？.!?]$/.test(first) &&
    !/^【/.test(first);

  return looksLikeTitle ? lines.slice(1).join('\n') : text;
}

function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^>\s?/gm, '');
}

function stripListMarkers(text: string): string {
  return text
    .replace(/^[\s]*[-*•·●▪]\s+/gm, '')
    .replace(/^[\s]*\d+[.)]\s+/gm, '');
}

function collapseSpacesForIntro(text: string): string {
  let result = text.replace(/[ \t]+/g, ' ');
  result = result.replace(/([\u4e00-\u9fff])\s+([\u4e00-\u9fff])/g, '$1$2');
  result = result.replace(/([\u4e00-\u9fff])\s+([，。！？；：、])/g, '$1$2');
  result = result.replace(/([，。！？；：、])\s+([\u4e00-\u9fff])/g, '$1$2');
  return result.trim();
}

function truncateAtSentence(text: string, max: number): string {
  if (text.length <= max) return text;

  const slice = text.slice(0, max);
  const sentenceMatch = slice.match(/^[\s\S]*[。！？.!?]/);
  if (sentenceMatch && sentenceMatch[0].length >= Math.min(INTRO_MIN, max * 0.5)) {
    return sentenceMatch[0];
  }

  const commaIndex = slice.lastIndexOf('，');
  if (commaIndex >= Math.min(INTRO_MIN, max * 0.5)) {
    return slice.slice(0, commaIndex + 1);
  }

  return slice;
}

export function formatPastedIntroduction(raw: string): FormatIntroResult {
  const warnings: string[] = [];
  let text = raw.trim();
  if (!text) {
    return { text: '', length: 0, truncated: false, warnings: [] };
  }

  if (/<[a-z][\s\S]*>/i.test(text)) {
    text = text
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<\/div>/gi, '\n\n')
      .replace(/<[^>]+>/g, '');
    text = decodeHtmlEntities(text);
  } else {
    text = decodeHtmlEntities(text);
  }

  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  text = stripLeadingTitleLine(text);
  text = stripMarkdown(text);
  text = stripListMarkers(text);
  text = text.replace(/^(摘要|导读|引言|概述|简介|导语)[：:]\s*/i, '');
  text = text.replace(/[\u00a0\u2002-\u200b\u202f\u3000]/g, ' ');

  text = preserveLineBreaks(text);
  text = text
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .trim();

  let truncated = false;
  if (text.length > INTRO_MAX) {
    text = truncateAtSentence(text, INTRO_MAX);
    truncated = true;
    warnings.push(`已自动裁剪至 ${INTRO_MAX} 字以内`);
  }

  if (text.length < INTRO_MIN) {
    warnings.push(`当前 ${text.length} 字，建议 ${INTRO_MIN}–${INTRO_MAX} 字`);
  }

  return {
    text,
    length: text.length,
    truncated,
    warnings,
  };
}

export function introLengthHint(length: number): 'ok' | 'short' | 'long' {
  if (length === 0) return 'ok';
  if (length < INTRO_MIN) return 'short';
  if (length > INTRO_MAX) return 'long';
  return 'ok';
}
