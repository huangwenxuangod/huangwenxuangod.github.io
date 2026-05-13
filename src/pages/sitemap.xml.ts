import type { APIContext } from "astro";
import blogMeta from "../content/blog/_meta.json";
import diaryMeta from "../content/diary/_meta.json";
import projectMeta from "../content/projects/_meta.json";
import achievementMeta from "../content/achievements/_meta.json";

type MetaItem = { slug: string; date: string; updated?: string; indexable?: boolean };

export async function GET(context: APIContext) {
  const site = context.site ?? "https://huangwenxuangod.github.io";
  const blogPosts = (blogMeta as MetaItem[]).filter((p) => p.indexable !== false);
  const diaryPosts = (diaryMeta as MetaItem[]).filter((p) => p.indexable !== false);
  const projects = (projectMeta as MetaItem[]).filter((p) => p.indexable !== false);
  const achievements = (achievementMeta as MetaItem[]).filter((p) => p.indexable !== false);

  const urls = [
    `<url><loc>${site}/</loc></url>`,
    `<url><loc>${site}/essays</loc></url>`,
    `<url><loc>${site}/projects</loc></url>`,
    `<url><loc>${site}/achievements</loc></url>`,
    `<url><loc>${site}/diaries</loc></url>`,
    `<url><loc>${site}/about</loc></url>`,
    `<url><loc>${site}/llms.txt</loc></url>`,
    `<url><loc>${site}/llms-full.txt</loc></url>`,
    ...blogPosts.map(
      (p) =>
        `<url><loc>${site}/essays/${p.slug}/</loc><lastmod>${p.updated ?? p.date}</lastmod></url>`
    ),
    ...projects.map(
      (p) =>
        `<url><loc>${site}/projects/${p.slug}/</loc><lastmod>${p.updated ?? p.date}</lastmod></url>`
    ),
    ...achievements.map(
      (p) =>
        `<url><loc>${site}/achievements/${p.slug}/</loc><lastmod>${p.updated ?? p.date}</lastmod></url>`
    ),
    ...diaryPosts.map(
      (p) =>
        `<url><loc>${site}/diaries/${p.slug}/</loc><lastmod>${p.updated ?? p.date}</lastmod></url>`
    ),
  ].join("\n  ");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  ${urls}\n</urlset>`,
    { headers: { "Content-Type": "application/xml" } }
  );
}
