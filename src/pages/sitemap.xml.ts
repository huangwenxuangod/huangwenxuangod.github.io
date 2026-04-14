import type { APIContext } from "astro";
import meta from "../content/blog/_meta.json";

type MetaItem = { slug: string; date: string };

export async function GET(context: APIContext) {
  const site = context.site ?? "https://huangwenxuangod.github.io";
  const posts = meta as MetaItem[];

  const urls = [
    `<url><loc>${site}/</loc></url>`,
    ...posts.map(
      (p) =>
        `<url><loc>${site}/posts/${p.slug}/</loc><lastmod>${p.date}</lastmod></url>`
    ),
  ].join("\n  ");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  ${urls}\n</urlset>`,
    { headers: { "Content-Type": "application/xml" } }
  );
}