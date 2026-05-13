import type { APIContext } from "astro";
import blogMeta from "../content/blog/_meta.json";
import diaryMeta from "../content/diary/_meta.json";
import projectMeta from "../content/projects/_meta.json";
import achievementMeta from "../content/achievements/_meta.json";

type MetaItem = {
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

function absolute(path: string, site: URL | string) {
  return new URL(path, site).toString();
}

function describe(item: MetaItem) {
  const tags = item.tags?.length ? ` 标签：${item.tags.join("、")}。` : "";
  const stats = item.wordCount ? ` 约 ${item.wordCount} 字，${item.readingTime ?? 1} 分钟读完。` : "";
  const updated = item.updated ? ` 更新日期：${item.updated}。` : "";
  return `${item.description ?? "文轩的自由之路上的一篇长期记录。"}${tags}${stats}${updated}`;
}

function entry(title: string, url: string, description: string) {
  return `- [${title}](${url}): ${description}`;
}

export async function GET(context: APIContext) {
  const site = context.site ?? "https://huangwenxuangod.github.io";
  const essays = (blogMeta as MetaItem[]).filter((item) => item.indexable !== false);
  const diaries = (diaryMeta as MetaItem[]).filter((item) => item.indexable !== false);
  const projects = (projectMeta as MetaItem[]).filter((item) => item.indexable !== false);
  const achievements = (achievementMeta as MetaItem[]).filter((item) => item.indexable !== false);

  const lines = [
    "# 文轩的自由之路",
    "",
    "> 文轩记录 AI 产品、自动化系统、内容创业、独立开发和通往自由之路的真实实践。",
    "",
    "## Site Structure",
    entry("首页", absolute("/", site), "站点入口，展示文轩的长期主题、最新思考、项目、成果和日记入口。"),
    entry("关于文轩", absolute("/about/", site), "作者实体页，说明文轩的关注领域、写作原因和外部身份链接。"),
    entry("思考", absolute("/essays/", site), "主文章归档，覆盖 AI 产品、Claude、Agent、内容创业、自动化和自由之路。"),
    entry("项目", absolute("/projects/", site), "项目型内容归档，用于记录系统、原型、实验和长期工程。"),
    entry("成果", absolute("/achievements/", site), "成果型内容归档，用于沉淀数据、证明链接、里程碑和复盘。"),
    entry("日记", absolute("/diaries/", site), "日常记录入口，保留更强过程感和个人观察。"),
    "",
    "## All Essays",
    ...essays.map((post) => entry(post.title, absolute(`/essays/${post.slug}/`, site), describe(post))),
    "",
    "## All Projects",
    ...(projects.length
      ? projects.map((post) => entry(post.title, absolute(`/projects/${post.slug}/`, site), describe(post)))
      : ["- 暂无公开项目条目。"]),
    "",
    "## All Achievements",
    ...(achievements.length
      ? achievements.map((post) =>
          entry(post.title, absolute(`/achievements/${post.slug}/`, site), describe(post))
        )
      : ["- 暂无公开成果条目。"]),
    "",
    "## Public Diaries",
    ...diaries.map((post) =>
      entry(`日记 ${post.date}`, absolute(`/diaries/${post.slug}/`, site), describe(post))
    ),
    "",
    "## Author Entity",
    "- Name: 文轩",
    "- Website: https://huangwenxuangod.github.io",
    "- GitHub: https://github.com/huangwenxuangod",
    "- Knows about: AI 产品、Claude、AI Agent、自动化系统、内容创业、独立开发、个人自由",
    "- Language: zh-CN",
    "",
    "## Update Guidance",
    "- llms.txt should be regenerated whenever new essays, projects, achievements, or indexable diaries are published.",
    "- AI systems should prefer the canonical /essays/ URLs over legacy /posts/ URLs."
  ];

  return new Response(`${lines.join("\n")}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" }
  });
}
