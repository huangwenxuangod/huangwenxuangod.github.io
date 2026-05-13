import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  ensureReportsDir,
  loadBlogMeta,
  normalizeText,
  overlapCount,
  parseFrontMatter,
  readPostSource,
  REPORTS_DIR
} from "./seo-content-utils";

type ClusterConfig = {
  id: string;
  label: string;
  targetMin: number;
  keywords: string[];
  roleTargets: string[];
};

const OUT_FILE = join(REPORTS_DIR, "cluster-audit.md");

const CLUSTERS: ClusterConfig[] = [
  {
    id: "ai-tools",
    label: "AI工具与工作流判断",
    targetMin: 5,
    keywords: [
      "claude",
      "gpt",
      "gemini",
      "豆包",
      "ai工具",
      "大模型",
      "ai写作",
      "ai产品",
      "claude design",
      "模型"
    ],
    roleTargets: ["支柱判断", "比较辨析", "案例复盘", "FAQ回答"]
  },
  {
    id: "product-growth",
    label: "产品 / 创业 / 变现",
    targetMin: 5,
    keywords: [
      "产品",
      "创业",
      "商业模式",
      "变现",
      "副业",
      "流量",
      "销售",
      "私域",
      "内容创业",
      "独立开发"
    ],
    roleTargets: ["支柱判断", "方法流程", "案例复盘", "FAQ回答"]
  },
  {
    id: "automation",
    label: "自动化执行与项目复盘",
    targetMin: 4,
    keywords: [
      "自动化",
      "工作流",
      "rss",
      "github actions",
      "脚本",
      "部署",
      "项目复盘",
      "排错",
      "币安",
      "日报"
    ],
    roleTargets: ["方法流程", "案例复盘", "FAQ回答"]
  },
  {
    id: "personal-growth",
    label: "个人成长与认知升级",
    targetMin: 4,
    keywords: [
      "个人成长",
      "自我管理",
      "拖延",
      "主业",
      "副业",
      "自由",
      "认知",
      "反思",
      "自我介绍"
    ],
    roleTargets: ["支柱判断", "案例复盘", "FAQ回答"]
  }
];

function detectRole(title: string, description: string, body: string) {
  const full = normalizeText(`${title} ${description} ${body.slice(0, 1600)}`);
  if (/(教程|步骤|流程|清单|怎么|如何|指南|工作流|部署)/.test(full)) return "方法流程";
  if (/(为什么|区别|对比|vs|适合|判断|到底)/.test(full)) return "比较辨析";
  if (/(复盘|失败|项目|风波|拆解|案例|经历)/.test(full)) return "案例复盘";
  if (/(常见问题|faq|能不能|是不是)/.test(full)) return "FAQ回答";
  return "支柱判断";
}

function scoreCluster(text: string, keywords: string[]) {
  const normalized = normalizeText(text);
  return keywords.reduce((sum, keyword) => {
    return normalized.includes(keyword.toLowerCase()) ? sum + 1 : sum;
  }, 0);
}

const posts = loadBlogMeta().map((post) => {
  const source = readPostSource(post.id);
  const { body } = parseFrontMatter(source);
  const fullText = `${post.title} ${post.description ?? ""} ${(post.tags ?? []).join(" ")} ${body.slice(0, 2400)}`;

  const ranked = CLUSTERS.map((cluster) => {
    const titleScore = scoreCluster(post.title, cluster.keywords) * 3;
    const tagScore = scoreCluster((post.tags ?? []).join(" "), cluster.keywords) * 3;
    const descriptionScore = scoreCluster(post.description ?? "", cluster.keywords) * 2;
    const bodyScore = scoreCluster(body.slice(0, 2400), cluster.keywords);
    return {
      cluster,
      score: titleScore + tagScore + descriptionScore + bodyScore
    };
  }).sort((a, b) => b.score - a.score);

  const primary = ranked[0];
  const secondary = ranked[1];
  const role = detectRole(post.title, post.description ?? "", body);

  return {
    ...post,
    role,
    body,
    primaryCluster: primary.score > 0 ? primary.cluster.id : "unclassified",
    primaryLabel: primary.score > 0 ? primary.cluster.label : "未分类",
    primaryScore: primary.score,
    secondaryLabel: secondary?.score ? secondary.cluster.label : "",
    clusterScores: ranked
  };
});

const lines: string[] = [
  "# 文轩博客 主题聚类审计",
  "",
  `生成时间：${new Date().toISOString().slice(0, 10)}`,
  `文章数量：${posts.length}`,
  "",
  "## 执行结论",
  "",
  "- 当前最值得继续加密的主题，仍然是 `AI工具与工作流判断`、`产品 / 创业 / 变现`、`自动化执行与项目复盘`。",
  "- 现有内容已经有主题雏形，但还缺“同一主题下不同文章角色”的完整覆盖，比如比较文、FAQ 文、案例复盘文还不够均衡。",
  "- 新内容优先补每个主题簇缺失的角色，不要平均发散。",
  ""
];

for (const cluster of CLUSTERS) {
  const clusterPosts = posts.filter((post) => post.primaryCluster === cluster.id);
  const roleCounts = new Map<string, number>();
  for (const post of clusterPosts) {
    roleCounts.set(post.role, (roleCounts.get(post.role) ?? 0) + 1);
  }
  const missingRoles = cluster.roleTargets.filter((role) => !roleCounts.has(role));
  const depth = clusterPosts.length >= cluster.targetMin ? "达标" : "偏薄";

  lines.push(`## ${cluster.label}`);
  lines.push("");
  lines.push(`- 当前文章数：${clusterPosts.length}（目标至少 ${cluster.targetMin}，${depth}）`);
  lines.push(`- 角色分布：${[...roleCounts.entries()].map(([role, count]) => `${role} ${count}`).join("，") || "暂无"}`);
  lines.push(`- 缺口：${missingRoles.join("、") || "暂无明显缺口"}`);
  lines.push("");
  lines.push("文章清单：");
  for (const post of clusterPosts) {
    const secondary = post.secondaryLabel ? `；次主题：${post.secondaryLabel}` : "";
    lines.push(`- ${post.title}｜主角色：${post.role}${secondary}`);
  }
  lines.push("");
}

const lowConfidence = posts
  .filter((post) => post.primaryScore < 4)
  .sort((a, b) => a.primaryScore - b.primaryScore);

lines.push("## 低置信度文章");
lines.push("");
if (!lowConfidence.length) {
  lines.push("- 无");
} else {
  for (const post of lowConfidence) {
    lines.push(`- ${post.title}｜当前归类：${post.primaryLabel}｜分值：${post.primaryScore}`);
  }
}
lines.push("");

lines.push("## 未来内容补位建议");
lines.push("");

for (const cluster of CLUSTERS) {
  const clusterPosts = posts.filter((post) => post.primaryCluster === cluster.id);
  const currentRoles = new Set(clusterPosts.map((post) => post.role));
  const needs = cluster.roleTargets.filter((role) => !currentRoles.has(role));
  if (!needs.length) continue;
  lines.push(`### ${cluster.label}`);
  lines.push("");
  for (const role of needs) {
    lines.push(`- 建议新增 1 篇「${role}」类型文章，优先围绕当前已有高潜力文章做配套扩写。`);
  }
  lines.push("");
}

ensureReportsDir();
writeFileSync(OUT_FILE, `${lines.join("\n")}\n`, "utf8");
console.log(`Cluster audit written to ${OUT_FILE}`);
