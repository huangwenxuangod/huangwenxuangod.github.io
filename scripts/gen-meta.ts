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
  description?: string;
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
  const parts = source.split(/^---\s*$/m, 3);
  if (parts.length < 3) return { data: {}, body: source };

  const raw = parts[1];
  const body = parts[2];
  const data: Record<string, unknown> = {};

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const idx = trimmed.indexOf(":");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    value = value.replace(/^['"]|['"]$/g, "");
    data[key] = value;
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

    if (collectionType === "diary") {
      title = "";
      slug = slugifyHash(raw);
      description = undefined;
    } else {
      title =
        (typeof data.title === "string" && data.title.trim()) ||
        extractFirstH1(body) ||
        relFromContent.replace(/\.(md|mdx)$/i, "");

      slug = slugifyTitle(title);
      description =
        typeof data.description === "string" && data.description.trim() ? data.description.trim() : undefined;
    }

    date =
      (typeof data.date === "string" && data.date.trim()) ||
      getGitDate(abs) ||
      toYmd(statSync(abs).mtime);

    const count = usedSlugs.get(slug) ?? 0;
    usedSlugs.set(slug, count + 1);
    if (count > 0) slug = `${slug}-${count + 1}`;

    items.push({ id, slug, title, date, description });
  }

  items.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  writeFileSync(OUT_FILE, JSON.stringify(items, null, 2) + "\n", "utf8");
}

generateMeta("blog");
generateMeta("diary");
generateMeta("projects");
generateMeta("achievements");
