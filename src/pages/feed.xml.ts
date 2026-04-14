import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import meta from "../content/blog/_meta.json";

type MetaItem = {
  id: string;
  slug: string;
  title: string;
  date: string;
  description?: string;
};

export async function GET(context: APIContext) {
  const posts = meta as MetaItem[];

  return rss({
    title: "文轩的财富自由之路",
    description: "记录通往财富自由路上每一个值得思考的瞬间。",
    site: context.site ?? "https://huangwenxuangod.github.io",
    items: posts.map((post) => ({
      title: post.title,
      pubDate: new Date(post.date),
      description: post.description ?? "",
      link: `/posts/${post.slug}/`,
    })),
    customData: `<language>zh-CN</language>`,
  });
}
