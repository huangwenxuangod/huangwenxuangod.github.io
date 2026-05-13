import { mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export type MetaItem = {
  id: string;
  slug: string;
  title: string;
  date: string;
  updated?: string;
  description?: string;
  tags?: string[];
  wordCount?: number;
  readingTime?: number;
  indexable?: boolean;
};

export type ContentBlock = {
  heading: string;
  content: string;
};

export const ROOT = process.cwd();
export const BLOG_DIR = join(ROOT, "src", "content", "blog");
export const REPORTS_DIR = join(ROOT, "reports");

const CHINESE_STOP_TERMS = new Set([
  "这个",
  "那个",
  "这些",
  "那些",
  "我们",
  "你们",
  "他们",
  "自己",
  "问题",
  "时候",
  "东西",
  "内容",
  "文章",
  "一个",
  "一种",
  "这样",
  "不是",
  "因为",
  "如果",
  "然后",
  "最后",
  "现在",
  "可以",
  "已经",
  "还是",
  "没有"
]);

const ENGLISH_STOP_TERMS = new Set([
  "the",
  "and",
  "that",
  "this",
  "with",
  "from",
  "into",
  "your",
  "have",
  "will",
  "just",
  "when",
  "what",
  "why",
  "how",
  "for",
  "are",
  "was",
  "were"
]);

export function ensureReportsDir() {
  mkdirSync(REPORTS_DIR, { recursive: true });
}

export function loadBlogMeta() {
  const meta = JSON.parse(readFileSync(join(BLOG_DIR, "_meta.json"), "utf8")) as MetaItem[];
  return meta.filter((item) => item.indexable !== false);
}

export function readPostSource(id: string) {
  return readFileSync(join(BLOG_DIR, id), "utf8");
}

export function parseFrontMatter(source: string) {
  if (!(source.startsWith("---\n") || source.startsWith("---\r\n"))) {
    return { data: {}, body: source };
  }
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { data: {}, body: source };

  const data: Record<string, unknown> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const idx = trimmed.indexOf(":");
    if (idx === -1) continue;
    data[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }
  return { data, body: source.slice(match[0].length) };
}

export function stripMarkdown(source: string) {
  return source
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/[>*_~|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function splitBlocks(body: string) {
  const lines = body.split(/\r?\n/);
  const blocks: ContentBlock[] = [];
  let heading = "开头";
  let content: string[] = [];

  function flush() {
    const text = content.join("\n").trim();
    if (stripMarkdown(text).length >= 40) {
      blocks.push({ heading, content: text });
    }
  }

  for (const line of lines) {
    const match = line.match(/^#{2,3}\s+(.+)$/);
    if (match) {
      flush();
      heading = match[1].trim();
      content = [];
    } else {
      content.push(line);
    }
  }

  flush();
  return blocks;
}

export function firstParagraph(content: string) {
  for (const part of content.split(/\n\s*\n/)) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    if (/^#{1,6}\s+/.test(trimmed)) continue;
    if (/^```/.test(trimmed)) continue;
    if (/^\|.+\|$/.test(trimmed)) continue;
    return stripMarkdown(trimmed);
  }
  return "";
}

export function extractEssayLinks(source: string) {
  const matches = [...source.matchAll(/\]\(\/essays\/([^/]+)\/\)/g)];
  return [...new Set(matches.map((match) => match[1]))];
}

export function normalizeText(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\u4e00-\u9fff]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractTerms(text: string) {
  const normalized = normalizeText(text);
  const terms = new Set<string>();

  for (const token of normalized.match(/[a-z0-9][a-z0-9-]{2,}/g) ?? []) {
    if (!ENGLISH_STOP_TERMS.has(token)) terms.add(token);
  }

  for (const chunk of normalized.match(/[\u4e00-\u9fff]{2,}/g) ?? []) {
    if (chunk.length <= 4) {
      if (!CHINESE_STOP_TERMS.has(chunk)) terms.add(chunk);
      continue;
    }

    if (chunk.length <= 8) {
      if (!CHINESE_STOP_TERMS.has(chunk)) terms.add(chunk);
    }

    for (let i = 0; i < chunk.length - 1; i += 1) {
      const bigram = chunk.slice(i, i + 2);
      if (!CHINESE_STOP_TERMS.has(bigram)) terms.add(bigram);
    }
  }

  return terms;
}

export function overlapCount(left: Set<string>, right: Set<string>) {
  let hits = 0;
  for (const item of left) {
    if (right.has(item)) hits += 1;
  }
  return hits;
}

export function unique<T>(items: T[]) {
  return [...new Set(items)];
}
