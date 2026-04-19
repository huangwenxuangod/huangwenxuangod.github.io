# 文轩的自由之路 - 项目配置

## 技术栈
- 运行时: Bun
- 语言: TypeScript
- 框架: Astro 5.0
- 内容管理: Astro Content Collections

## 常用命令
```bash
bun run dev          # 启动开发服务器
bun run gen:meta     # 生成内容元数据
bun run build        # 构建生产版本
bun run preview      # 预览构建结果
bun run check        # TypeScript 类型检查
```

## 项目结构
```
wenxuan-blog/
├── src/
│   ├── content/
│   │   ├── blog/    # 博客文章
│   │   ├── diary/   # 日记 (新增)
│   │   └── config.ts
│   ├── layouts/
│   └── pages/
├── scripts/
└── public/
```

## 内容类型
1. **Blog (博客)**: 带 frontmatter 的长文
2. **Diary (日记)**: 无 frontmatter，纯内容
