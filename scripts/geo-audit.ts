import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type MetaItem = {
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

type BlockScore = {
  heading: string;
  chars: number;
  score: number;
  answer: number;
  selfContained: number;
  structure: number;
  facts: number;
  experience: number;
  preview: string;
};

const ROOT = process.cwd();
const BLOG_DIR = join(ROOT, "src", "content", "blog");
const OUT_DIR = join(ROOT, "reports");
const OUT_FILE = join(OUT_DIR, "geo-audit.md");

function parseFrontMatter(source: string) {
  if (!(source.startsWith("---\n") || source.startsWith("---\r\n"))) {
    return { body: source };
  }
  const match = source.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  return { body: match ? source.slice(match[0].length) : source };
}

function stripMarkdown(source: string) {
  return source
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/[>*_~]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function splitBlocks(body: string) {
  const lines = body.split(/\r?\n/);
  const blocks: Array<{ heading: string; content: string }> = [];
  let heading = "开头";
  let content: string[] = [];

  function flush() {
    const text = content.join("\n").trim();
    if (stripMarkdown(text).length >= 80) {
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

function clamp(value: number, max: number) {
  return Math.min(value, max);
}

function scoreBlock(block: { heading: string; content: string }): BlockScore {
  const text = stripMarkdown(block.content);
  const chars = text.length;
  const first = text.slice(0, 140);

  let answer = 0;
  if (/[？?]$/.test(block.heading) || /(为什么|什么|如何|是不是|能不能|什么时候|普通人)/.test(block.heading)) {
    answer += 8;
  }
  if (/(是|指的是|意味着|核心是|本质是|关键在于|区别在于|原因是|最重要的是|真正.+是|不是.+而是)/.test(first)) {
    answer += 12;
  }
  if (/(第一|第二|第三|首先|其次|最后|步骤|方法|结论|建议|判断|答案)/.test(first)) answer += 6;
  if (first.length >= 45 && first.length <= 180) answer += 4;

  let selfContained = 0;
  if (chars >= 160 && chars <= 700) selfContained += 12;
  else if (chars >= 110 && chars <= 900) selfContained += 8;
  else if (chars >= 80 && chars <= 1100) selfContained += 4;
  const vagueRefs = text.match(/[它这那其]/g)?.length ?? 0;
  if (vagueRefs / Math.max(chars, 1) < 0.035) selfContained += 6;
  if (!/^(它|这|那|其|这个|这些|这样)/.test(first)) selfContained += 3;
  if (/(Claude|GPT|AI|Agent|豆包|Bun|Astro|RSS|币安|内容创业|自动化|交易系统)/i.test(text)) selfContained += 7;

  let structure = 0;
  if (/^\s*[-*+]\s+/m.test(block.content)) structure += 6;
  if (/^\s*\d+\.\s+/m.test(block.content)) structure += 5;
  if (/\|.+\|/.test(block.content)) structure += 5;
  if ((block.content.match(/^###\s+/gm)?.length ?? 0) >= 2) structure += 6;
  if (block.content.split(/\n\s*\n/).filter(Boolean).length >= 2) structure += 4;

  let facts = 0;
  facts += clamp((text.match(/\d+(?:\.\d+)?%/g)?.length ?? 0) * 3, 6);
  facts += clamp((text.match(/\d{4}年|\d{4}-\d{2}-\d{2}|20\d{2}/g)?.length ?? 0) * 2, 4);
  facts += clamp((text.match(/\d+(?:\.\d+)?\s*(?:小时|分钟|天|周|个月|年|次|个|篇|元|刀|倍)/g)?.length ?? 0) * 2, 5);
  facts += clamp((text.match(/GitHub Actions|Secrets|SMTP|Token|API|UTC/gi)?.length ?? 0), 4);

  let experience = 0;
  if (/(我|我们).{0,12}(做了|试了|发现|复盘|失败|搭建|测试|写了|跑了)/.test(text)) experience += 5;
  if (/(项目|案例|真实|过程|结果|截图|数据|复盘|失败)/.test(text)) experience += 3;
  if (/(Claude|GPT|豆包|Cursor|GitHub|币安|RSS|Bun|Astro)/i.test(text)) experience += 2;

  const score = answer + selfContained + structure + facts + experience;
  return {
    heading: block.heading,
    chars,
    score,
    answer,
    selfContained,
    structure,
    facts,
    experience,
    preview: text.slice(0, 90)
  };
}

function scorePost(post: MetaItem) {
  const raw = readFileSync(join(BLOG_DIR, post.id), "utf8");
  const { body } = parseFrontMatter(raw);
  const blocks = splitBlocks(body).map(scoreBlock);
  const topBlocks = [...blocks].sort((a, b) => b.score - a.score).slice(0, 3);
  const weakBlocks = [...blocks].sort((a, b) => a.score - b.score).slice(0, 3);
  const citability = blocks.length
    ? Math.round(blocks.reduce((sum, block) => sum + block.score, 0) / blocks.length)
    : 0;
  const metadataIssues = [
    !post.description ? "缺 description" : "",
    !post.tags?.length ? "缺 tags" : "",
    !post.updated ? "缺 updated" : "",
    (post.wordCount ?? 0) < 300 ? "内容偏短" : ""
  ].filter(Boolean);

  return { post, blocks, topBlocks, weakBlocks, citability, metadataIssues };
}

function grade(score: number) {
  if (score >= 70) return "强";
  if (score >= 55) return "可优化";
  if (score >= 40) return "偏弱";
  return "弱";
}

const meta = JSON.parse(readFileSync(join(BLOG_DIR, "_meta.json"), "utf8")) as MetaItem[];
const results = meta.filter((post) => post.indexable !== false).map(scorePost);
const average = results.length
  ? Math.round(results.reduce((sum, item) => sum + item.citability, 0) / results.length)
  : 0;

const lines = [
  "# 文轩博客 GEO 本地审计",
  "",
  `生成时间：${new Date().toISOString().slice(0, 10)}`,
  `文章数量：${results.length}`,
  `平均中文可引用性：${average}/100（${grade(average)}）`,
  "",
  "## 优先改造文章",
  "",
  ...results
    .filter((item) => item.citability < 55 || item.metadataIssues.length > 0)
    .slice(0, 8)
    .map((item, index) => {
      const issues = item.metadataIssues.length ? item.metadataIssues.join("、") : "主要是段落可引用性不足";
      return `${index + 1}. ${item.post.title} — ${item.citability}/100，${issues}`;
    }),
  "",
  "## 单篇详情",
  "",
  ...results.flatMap((item) => [
    `### ${item.post.title}`,
    "",
    `- URL: /essays/${item.post.slug}/`,
    `- 可引用性: ${item.citability}/100（${grade(item.citability)}）`,
    `- 元数据问题: ${item.metadataIssues.join("、") || "无"}`,
    `- 字数/阅读时间: ${item.post.wordCount ?? 0} 字 / ${item.post.readingTime ?? 1} 分钟`,
    "",
    "高潜力段落：",
    ...item.topBlocks.map((block) => `- ${block.heading} — ${block.score}/100：${block.preview}`),
    "",
    "优先重写段落：",
    ...item.weakBlocks.map((block) => `- ${block.heading} — ${block.score}/100：${block.preview}`),
    ""
  ]),
  "## 改写规则",
  "",
  "- 每个重要 H2 后第一段先给结论，再解释背景。",
  "- 把纯叙事段落改成 180-500 字的自包含 answer block。",
  "- 给核心判断补充数字、日期、工具名、项目过程或失败细节。",
  "- 给适合搜索的问题加 FAQ，但不要把整篇文章改成机械问答。",
  "- 每篇核心文章至少连到 3 篇相关思考、项目或成果。"
];

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_FILE, `${lines.join("\n")}\n`, "utf8");
console.log(`GEO audit written to ${OUT_FILE}`);
