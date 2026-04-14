# 文轩的财富自由之路

极简黑白风格个人博客，基于 Astro + Bun + GitHub Pages。

## 目录结构

```
.
├── src/
│   ├── content/
│   │   └── blog/          # Markdown 文章 + _meta.json（自动生成）
│   ├── layouts/
│   │   └── BaseLayout.astro
│   └── pages/
│       ├── index.astro    # 首页
│       ├── feed.xml.ts    # RSS
│       └── posts/
│           └── [slug].astro
├── public/
│   ├── assets/
│   │   ├── css/style.css
│   │   └── js/theme.ts
│   ├── favicon.ico
│   ├── favicon-32x32.png
│   └── apple-touch-icon.png
├── scripts/
│   └── gen-blog-meta.ts   # 自动生成 _meta.json
├── .github/workflows/
│   └── deploy.yml         # Bun + Astro 自动部署
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

## 写新文章

在 `src/content/blog/` 新建 `.md` 文件，加上 front matter：

```markdown
---
title: 文章标题
date: 2025-07-01
---

正文内容...
```

## 发布流程

```bash
git add .
git commit -m "新文章：标题"
git push
```

GitHub Actions 自动：`gen:meta` → `astro build` → 部署，约 1 分钟上线。

## 本地预览

```bash
bun install       # 首次
bun run dev       # http://localhost:4321
```
