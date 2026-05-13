import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { extname, join, relative } from "node:path";

type CollectionType = "blog" | "diary" | "projects" | "achievements";

type MetaItem = {
  id: string;
  slug: string;
  title: string;
  date: string;
  updated: string;
  description?: string;
  tags: string[];
  wordCount: number;
  readingTime: number;
  indexable: boolean;
};

function isMarkdownFile(fileName: string) {
  const ext = extname(fileName).toLowerCase();
  return ext === ".md" || ext === ".mdx";
}

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    if (entry.name === "_meta.json") continue;
    const abs = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(abs));
    else if (entry.isFile() && isMarkdownFile(entry.name)) out.push(abs);
  }
  return out;
}

function parseFrontMatter(source: string): { data: Record<string, unknown>; body: string } {
  if (!(source.startsWith("---\n") || source.startsWith("---\r\n"))) {
    return { data: {}, body: source };
  }
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { data: {}, body: source };

  const raw = match[1];
  const body = source.slice(match[0].length);
  const data: Record<string, unknown> = {};

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const idx = trimmed.indexOf(":");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (value === "true" || value === "false") {
      data[key] = value === "true";
    } else if (value.startsWith("[") && value.endsWith("]")) {
      data[key] = value
        .slice(1, -1)
        .split(",")
        .map((item) => item.trim().replace(/^['"]|['"]$/g, ""))
        .filter(Boolean);
    } else {
      value = value.replace(/^['"]|['"]$/g, "");
      data[key] = value;
    }
  }

  return { data, body };
}

function extractFirstH1(body: string) {
  for (const line of body.split(/\r?\n/)) {
    const t = line.trim();
    if (!t) continue;
    const m = t.match(/^#\s+(.+)$/);
    if (m) return m[1].trim();
    break;
  }
  return null;
}

function stripMarkdown(source: string) {
  return source
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/[*_>#~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractDescription(body: string) {
  const withoutTitle = body.replace(/^#\s+.+$/m, "");
  for (const block of withoutTitle.split(/\n\s*\n/)) {
    const text = stripMarkdown(block);
    if (text.length >= 28) return text.slice(0, 120);
  }
  const fallback = stripMarkdown(body);
  return fallback ? fallback.slice(0, 120) : undefined;
}

function normalizeTags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(String).map((tag) => tag.trim()).filter(Boolean);
  }
  if (typeof value === "string" && value.trim()) {
    return value
      .split(/[，,]/)
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  return [];
}

function countWordsForMixedText(body: string) {
  const text = stripMarkdown(body);
  const cjk = text.match(/[\u4e00-\u9fff]/g)?.length ?? 0;
  const latin = text
    .replace(/[\u4e00-\u9fff]/g, " ")
    .match(/[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)*/g)?.length ?? 0;
  return cjk + latin;
}

function getBoolean(value: unknown, fallback: boolean) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (value === "true") return true;
    if (value === "false") return false;
  }
  return fallback;
}

function slugifyTitle(title: string) {
  const normalized = title.normalize("NFKD").toLowerCase();
  const ascii = normalized
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  if (ascii) return ascii;
  const hash = createHash("sha1").update(title).digest("hex").slice(0, 10);
  return `p${hash}`;
}

function slugifyHash(content: string) {
  return createHash("sha1").update(content).digest("hex").slice(0, 10);
}

function getGitDate(fileAbsPath: string) {
  const rel = relative(process.cwd(), fileAbsPath);
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%cs", "--", rel], {
      stdio: ["ignore", "pipe", "ignore"]
    })
      .toString("utf8")
      .trim();
    if (!out) return null;
    return out;
  } catch {
    return null;
  }
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toYmd(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function generateMeta(collectionType: CollectionType) {
  const CONTENT_DIR = join(process.cwd(), "src", "content", collectionType);
  const OUT_FILE = join(CONTENT_DIR, "_meta.json");

  const files = walk(CONTENT_DIR).sort();
  const usedSlugs = new Map<string, number>();
  const items: MetaItem[] = [];

  for (const abs of files) {
    const relFromContent = relative(CONTENT_DIR, abs).replaceAll("\\", "/");
    const id = relFromContent;

    const raw = readFileSync(abs, "utf8");
    const { data, body } = parseFrontMatter(raw);

    let title: string;
    let slug: string;
    let date: string;
    let description: string | undefined;
    let tags: string[];

    if (collectionType === "diary") {
      title = "";
      slug = slugifyHash(raw);
      description = undefined;
      tags = ["日记"];
    } else {
      title =
        (typeof data.title === "string" && data.title.trim()) ||
        extractFirstH1(body) ||
        relFromContent.replace(/\.(md|mdx)$/i, "");

      slug = slugifyTitle(title);
      description =
        (typeof data.description === "string" && data.description.trim()) ||
        (typeof data.summary === "string" && data.summary.trim()) ||
        extractDescription(body);
      tags = normalizeTags(data.tags);
    }

    date =
      (typeof data.date === "string" && data.date.trim()) ||
      getGitDate(abs) ||
      toYmd(statSync(abs).mtime);
    const updated =
      (typeof data.updated === "string" && data.updated.trim()) ||
      getGitDate(abs) ||
      toYmd(statSync(abs).mtime);
    const wordCount = countWordsForMixedText(body);
    const readingTime = Math.max(1, Math.ceil(wordCount / 500));
    const indexable = getBoolean(
      data.indexable,
      collectionType === "diary" ? wordCount >= 300 : true
    );

    const count = usedSlugs.get(slug) ?? 0;
    usedSlugs.set(slug, count + 1);
    if (count > 0) slug = `${slug}-${count + 1}`;

    items.push({
      id,
      slug,
      title,
      date,
      updated,
      description,
      tags,
      wordCount,
      readingTime,
      indexable
    });
  }

  items.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  writeFileSync(OUT_FILE, JSON.stringify(items, null, 2) + "\n", "utf8");
}

generateMeta("blog");
generateMeta("diary");
generateMeta("projects");
generateMeta("achievements");
