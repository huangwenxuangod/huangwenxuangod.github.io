import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  ensureReportsDir,
  firstParagraph,
  loadBlogMeta,
  parseFrontMatter,
  readPostSource,
  REPORTS_DIR,
  splitBlocks
} from "./seo-content-utils";

const OUT_FILE = join(REPORTS_DIR, "answer-block-audit.md");

function clamp(value: number, max: number) {
  return Math.min(value, max);
}

function auditFirstParagraph(heading: string, paragraph: string) {
  const chars = paragraph.length;
  const first = paragraph.slice(0, 140);
  const issues: string[] = [];

  let answer = 0;
  if (/[？?]$/.test(heading) || /(为什么|什么|如何|能不能|是不是|适不适合|普通人)/.test(heading)) {
    answer += 10;
  }
  if (/(是|意味着|核心是|本质是|关键在于|最重要的是|真正.+是|不是.+而是)/.test(first)) {
    answer += 18;
  } else {
    issues.push("开头没有直接给判断");
  }

  let length = 0;
  if (chars >= 90 && chars <= 320) length += 18;
  else if (chars >= 60 && chars <= 420) length += 10;
  else issues.push(chars < 60 ? "首段太短" : "首段过长");

  let context = 0;
  const vagueRefs = paragraph.match(/[它这那其]/g)?.length ?? 0;
  if (vagueRefs / Math.max(chars, 1) < 0.035) context += 12;
  else issues.push("代词偏多，上下文依赖重");
  if (!/^(它|这|那|其|这个|这些|这样)/.test(first)) context += 6;

  let specificity = 0;
  specificity += clamp((paragraph.match(/\d+(?:\.\d+)?\s*(?:个|次|步|天|周|小时|分钟|年|篇|元|倍)/g)?.length ?? 0) * 4, 8);
  specificity += clamp((paragraph.match(/GitHub|Claude|GPT|Gemini|豆包|RSS|币安|API|Actions|邮件|产品|副业|流量/gi)?.length ?? 0) * 2, 10);
  if (specificity < 6) issues.push("具体对象或细节偏少");

  const score = Math.min(answer + length + context + specificity, 100);
  return { score, issues, preview: first };
}

const results = loadBlogMeta().map((post) => {
  const source = readPostSource(post.id);
  const { body } = parseFrontMatter(source);
  const blocks = splitBlocks(body).map((block) => {
    const paragraph = firstParagraph(block.content);
    return {
      heading: block.heading,
      paragraph,
      ...auditFirstParagraph(block.heading, paragraph)
    };
  });

  const avg = blocks.length
    ? Math.round(blocks.reduce((sum, block) => sum + block.score, 0) / blocks.length)
    : 0;

  return {
    post,
    avg,
    weakest: [...blocks].sort((a, b) => a.score - b.score).slice(0, 3)
  };
});

const priority = [...results].sort((a, b) => a.avg - b.avg);

const lines: string[] = [
  "# 文轩博客 Answer Block 审计",
  "",
  `生成时间：${new Date().toISOString().slice(0, 10)}`,
  "",
  "## 优先修复文章",
  ""
];

for (const item of priority.slice(0, 8)) {
  lines.push(`${priority.indexOf(item) + 1}. ${item.post.title}｜首段答复式平均分 ${item.avg}/100`);
}

lines.push("");
lines.push("## 单篇弱段落");
lines.push("");

for (const item of priority) {
  lines.push(`### ${item.post.title}`);
  lines.push("");
  for (const block of item.weakest) {
    lines.push(`- ${block.heading}｜${block.score}/100｜问题：${block.issues.join("、") || "无明显问题"}`);
    lines.push(`  - 预览：${block.preview}`);
  }
  lines.push("");
}

ensureReportsDir();
writeFileSync(OUT_FILE, `${lines.join("\n")}\n`, "utf8");
console.log(`Answer block audit written to ${OUT_FILE}`);
