import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import meta from "../../content/diary/_meta.json";

type MetaItem = {
  id: string;
  slug: string;
  title: string;
  date: string;
};

export async function GET(context: APIContext) {
  const posts = meta as MetaItem[];

  return rss({
    title: "文轩的自由之路 · 日记",
    description: "记录日常的点滴。",
    site: context.site ?? "https://huangwenxuangod.github.io",
    items: posts.map((post) => ({
      title: post.date,
      pubDate: new Date(post.date),
      description: "",
      link: `/diaries/${post.slug}/`,
    })),
    customData: `<language>zh-CN</language>`,
  });
}
