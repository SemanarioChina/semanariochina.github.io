import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");
const OUTPUT_FILE = path.join(process.cwd(), "news-data.json");

function extractLangBlock(content, lang) {
  const regex = new RegExp(`:::${lang}\\s*([\\s\\S]*?):::`, "m");
  const match = content.match(regex);
  return match ? match[1].trim() : "";
}

function toHtml(markdownText) {
  return marked.parse(markdownText || "");
}

function ensureString(value, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeImagePath(value = "") {
  if (!value) return "";
  const clean = String(value).replace(/^\.?\//, "");
  return "/" + clean;
}

function readPosts() {
  if (!fs.existsSync(POSTS_DIR)) return [];

  const files = fs
    .readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith(".md"));

  const posts = files.map((file) => {
    const fullPath = path.join(POSTS_DIR, file);
    const raw = fs.readFileSync(fullPath, "utf8");
    const parsed = matter(raw);

    const esBodyMd = extractLangBlock(parsed.content, "es");
    const enBodyMd = extractLangBlock(parsed.content, "en");
    const zhBodyMd = extractLangBlock(parsed.content, "zh");

    const data = parsed.data || {};

    return {
      id: ensureString(data.id, file.replace(/\.md$/, "")),
      date: ensureString(data.date, ""),
      section: ensureString(data.section, ""),
      image: normalizeImagePath(data.image),
      tags: ensureArray(data.tags),
      category: {
        es: ensureString(data.category?.es, ""),
        en: ensureString(data.category?.en, ""),
        zh: ensureString(data.category?.zh, "")
      },
      title: {
        es: ensureString(data.title?.es, ""),
        en: ensureString(data.title?.en, ""),
        zh: ensureString(data.title?.zh, "")
      },
      summary: {
        es: ensureString(data.summary?.es, ""),
        en: ensureString(data.summary?.en, ""),
        zh: ensureString(data.summary?.zh, "")
      },
      bodyHtml: {
        es: toHtml(esBodyMd),
        en: toHtml(enBodyMd),
        zh: toHtml(zhBodyMd)
      }
    };
  });

  posts.sort((a, b) => (a.date < b.date ? 1 : -1));
  return posts;
}

const posts = readPosts();
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(posts, null, 2), "utf8");

console.log(`Built ${posts.length} posts into news-data.json`);
