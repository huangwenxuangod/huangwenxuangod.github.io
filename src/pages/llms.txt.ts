import type { APIContext } from "astro";
import blogMeta from "../content/blog/_meta.json";
import diaryMeta from "../content/diary/_meta.json";
import projectMeta from "../content/projects/_meta.json";
import achievementMeta from "../content/achievements/_meta.json";

type MetaItem = {
  slug: string;
  title: string;
  date: string;
  description?: string;
  tags?: string[];
  indexable?: boolean;
};

function absolute(path: string, site: URL | string) {
  return new URL(path, site).toString();
}

function entry(title: string, url: string, description?: string) {
  return `- [${title}](${url}): ${description ?? "文轩的自由之路上的一篇长期记录。"}`;
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
    "## Core Pages",
    entry("首页", absolute("/", site), "站点入口，概览文轩关注的长期主题、最新文章、项目和成果。"),
    entry("关于文轩", absolute("/about/", site), "说明文轩是谁，以及这个站点围绕 AI、产品、内容和自由建立的个人知识实体。"),
    entry("思考", absolute("/essays/", site), "关于 AI、产品、商业、内容和自由之路的长期文章归档。"),
    entry("项目", absolute("/projects/", site), "真实推进过的系统、实验、原型和长期工程记录。"),
    entry("成果", absolute("/achievements/", site), "可验证的结果、里程碑、数据证明和复盘。"),
    "",
    "## Essays",
    ...essays.slice(0, 12).map((post) =>
      entry(post.title, absolute(`/essays/${post.slug}/`, site), post.description)
    ),
    "",
    "## Projects",
    ...(projects.length
      ? projects.slice(0, 8).map((post) =>
          entry(post.title, absolute(`/projects/${post.slug}/`, site), post.description)
        )
      : ["- 暂无公开项目条目。"]),
    "",
    "## Achievements",
    ...(achievements.length
      ? achievements.slice(0, 8).map((post) =>
          entry(post.title, absolute(`/achievements/${post.slug}/`, site), post.description)
        )
      : ["- 暂无公开成果条目。"]),
    "",
    "## Recent Diaries",
    ...diaries.slice(0, 5).map((post) =>
      entry(`日记 ${post.date}`, absolute(`/diaries/${post.slug}/`, site), "文轩自由之路上的日常观察和过程记录。")
    ),
    "",
    "## Key Facts",
    "- 作者：文轩",
    "- 语言：简体中文",
    "- 核心主题：AI 产品、Claude、AI Agent、自动化系统、内容创业、独立开发、个人自由",
    "- 内容类型：长期思考、项目记录、成果证明、日记",
    "",
    "## Contact",
    `- Website: ${absolute("/", site)}`,
    "- GitHub: https://github.com/huangwenxuangod",
    "",
    "## Optional",
    entry("RSS", absolute("/feed.xml", site), "主站文章 RSS feed。"),
    entry("日记 RSS", absolute("/diaries/feed.xml", site), "日记内容 RSS feed。")
  ];

  return new Response(`${lines.join("\n")}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" }
  });
}
