export const SITE_NAME = "文轩的自由之路";
export const AUTHOR_NAME = "文轩";
export const DEFAULT_SITE = "https://huangwenxuangod.github.io";

export const AUTHOR_TOPICS = [
  "AI 产品实践",
  "Claude",
  "AI Agent",
  "自动化系统",
  "内容创业",
  "独立开发",
  "个人自由"
];

export function absoluteUrl(path: string, site: URL | string = DEFAULT_SITE) {
  return new URL(path, site).toString();
}

export function personJsonLd(site: URL | string = DEFAULT_SITE) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${absoluteUrl("/about/", site)}#person`,
    name: AUTHOR_NAME,
    url: absoluteUrl("/about/", site),
    description:
      "文轩长期记录 AI 产品、自动化系统、内容创业、独立开发和通往自由之路的真实实践。",
    knowsAbout: AUTHOR_TOPICS,
    sameAs: ["https://github.com/huangwenxuangod"]
  };
}

export function websiteJsonLd(site: URL | string = DEFAULT_SITE) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${absoluteUrl("/", site)}#website`,
    name: SITE_NAME,
    url: absoluteUrl("/", site),
    description: "记录思考、项目、成果和通往自由路上的真实过程。",
    publisher: {
      "@id": `${absoluteUrl("/about/", site)}#person`
    },
    inLanguage: "zh-CN"
  };
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
  site: URL | string = DEFAULT_SITE
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path, site)
    }))
  };
}
