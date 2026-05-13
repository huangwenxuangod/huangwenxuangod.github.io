import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  ensureReportsDir,
  extractEssayLinks,
  extractTerms,
  loadBlogMeta,
  overlapCount,
  parseFrontMatter,
  readPostSource,
  REPORTS_DIR
} from "./seo-content-utils";

const OUT_FILE = join(REPORTS_DIR, "internal-link-suggestions.md");

const CLUSTER_KEYWORDS = [
  { id: "ai-tools", keywords: ["claude", "gpt", "gemini", "豆包", "ai工具", "大模型", "模型", "设计"] },
  { id: "product-growth", keywords: ["产品", "创业", "变现", "商业模式", "私域", "流量", "销售", "副业"] },
  { id: "automation", keywords: ["自动化", "工作流", "脚本", "github actions", "rss", "日报", "部署", "币安"] },
  { id: "personal-growth", keywords: ["成长", "拖延", "自由", "主业", "副业", "反思", "自我"] }
];

function detectCluster(text: string) {
  const normalized = text.toLowerCase();
  let best = { id: "misc", score: 0 };
  for (const cluster of CLUSTER_KEYWORDS) {
    const score = cluster.keywords.reduce((sum, keyword) => {
      return normalized.includes(keyword.toLowerCase()) ? sum + 1 : sum;
    }, 0);
    if (score > best.score) best = { id: cluster.id, score };
  }
  return best.id;
}

const posts = loadBlogMeta().map((post) => {
  const source = readPostSource(post.id);
  const { body } = parseFrontMatter(source);
  const tags = new Set((post.tags ?? []).map((tag) => tag.toLowerCase()));
  const terms = extractTerms(`${post.title} ${post.description ?? ""} ${body.slice(0, 2000)} ${(post.tags ?? []).join(" ")}`);
  const cluster = detectCluster(`${post.title} ${(post.tags ?? []).join(" ")} ${body.slice(0, 1400)}`);
  return {
    ...post,
    source,
    cluster,
    tags,
    terms,
    existingLinks: new Set(extractEssayLinks(source))
  };
});

function relationReason(sharedTags: string[], sameCluster: boolean, termOverlap: number) {
  const reasons: string[] = [];
  if (sharedTags.length) reasons.push(`共享 tags：${sharedTags.slice(0, 3).join(" / ")}`);
  if (sameCluster) reasons.push("同主题文章");
  if (termOverlap >= 6) reasons.push("关键词重叠高");
  else if (termOverlap >= 3) reasons.push("关键词相关");
  return reasons.join("；");
}

const lines: string[] = [
  "# 文轩博客 内链建议",
  "",
  `生成时间：${new Date().toISOString().slice(0, 10)}`,
  `文章数量：${posts.length}`,
  "",
  "## 执行结论",
  "",
  "- 每篇核心文章至少保留 3 条站内链接，其中 1 条同主题深化、1 条相邻主题、1 条方法论或作者立场。",
  "- 下面的建议只列“还没加上的链接”，方便直接补进正文或延伸阅读。",
  ""
];

for (const post of posts) {
  const suggestions = posts
    .filter((candidate) => candidate.slug !== post.slug)
    .filter((candidate) => !post.existingLinks.has(candidate.slug))
    .map((candidate) => {
      const sharedTags = [...post.tags].filter((tag) => candidate.tags.has(tag));
      const sameCluster = post.cluster === candidate.cluster;
      const termOverlap = overlapCount(post.terms, candidate.terms);
      const score = sharedTags.length * 8 + (sameCluster ? 6 : 0) + Math.min(termOverlap, 8) * 2;
      return {
        candidate,
        sharedTags,
        sameCluster,
        termOverlap,
        score
      };
    })
    .filter((item) => item.score >= 8)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  lines.push(`## ${post.title}`);
  lines.push("");
  lines.push(`- 当前已存在站内链接：${post.existingLinks.size}`);
  if (!suggestions.length) {
    lines.push("- 暂无高置信度新建议");
    lines.push("");
    continue;
  }

  lines.push("建议补充：");
  for (const item of suggestions) {
    lines.push(
      `- [${item.candidate.title}](/essays/${item.candidate.slug}/)｜原因：${relationReason(
        item.sharedTags,
        item.sameCluster,
        item.termOverlap
      )}`
    );
  }
  lines.push("");
}

ensureReportsDir();
writeFileSync(OUT_FILE, `${lines.join("\n")}\n`, "utf8");
console.log(`Internal link suggestions written to ${OUT_FILE}`);
