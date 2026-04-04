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
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }
  return [];
}

function normalizeImagePath(value = "") {
  if (!value) return "";
  const clean = String(value).replace(/^\.?\//, "");
  return "/" + clean;
}

function normalizeCategory(value) {
  if (typeof value === "string") {
    const text = value.trim();
    return {
      es: text,
      en: text,
      zh: text
    };
  }

  if (value && typeof value === "object") {
    const es = ensureString(value.es, "").trim();
    const en = ensureString(value.en, "").trim();
    const zh = ensureString(value.zh, "").trim();

    return {
      es: es || en || zh || "",
      en: en || es || zh || "",
      zh: zh || en || es || ""
    };
  }

  return {
    es: "",
    en: "",
    zh: ""
  };
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
      category: normalizeCategory(data.category),
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
