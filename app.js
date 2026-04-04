const POSTS_INDEX_URL = "./data/posts.json"; 
// ↑ 这里改成你项目里真正的文章索引 JSON 路径
// 如果你现在不是 posts.json，而是 news.json / articles.json，就改这里

const app = document.getElementById("app");

function getQuery(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeLang(lang) {
  return ["zh", "en", "es"].includes(lang) ? lang : "zh";
}

function getLocalizedField(field, lang) {
  if (!field) return "";
  if (typeof field === "string") return field;
  return field[lang] || field.zh || field.en || field.es || "";
}

function formatDate(dateStr, lang) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;

  const localeMap = {
    zh: "zh-CN",
    en: "en-US",
    es: "es-ES",
  };

  return new Intl.DateTimeFormat(localeMap[lang] || "zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

async function fetchPostsIndex() {
  const res = await fetch(POSTS_INDEX_URL, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load posts index: ${res.status}`);
  }
  return res.json();
}

function findPostById(posts, id) {
  return posts.find((item) => item.id === id);
}

async function fetchText(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load article file: ${res.status}`);
  }
  return res.text();
}

async function imageExists(src) {
  if (!src || !String(src).trim()) return false;

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

function simpleMarkdownToHtml(md) {
  // 这是一个尽量保守的简易转换
  // 你的项目如果已经有 markdown 渲染器，就直接用你原来的，不用这段
  return md
    .split(/\n{2,}/)
    .map(block => block.trim())
    .filter(Boolean)
    .map(block => {
      if (block.startsWith("### ")) return `<h3>${escapeHtml(block.slice(4))}</h3>`;
      if (block.startsWith("## ")) return `<h2>${escapeHtml(block.slice(3))}</h2>`;
      if (block.startsWith("# ")) return `<h1>${escapeHtml(block.slice(2))}</h1>`;
      return `<p>${escapeHtml(block).replace(/\n/g, "<br>")}</p>`;
    })
    .join("\n");
}

function extractLangBlock(rawMd, lang) {
  const match = rawMd.match(new RegExp(`:::${lang}\\n([\\s\\S]*?)\\n:::`, "m"));
  return match ? match[1].trim() : "";
}

function extractFrontMatter(rawMd) {
  const match = rawMd.match(/^---\n([\s\S]*?)\n---/);
  return match ? match[1] : "";
}

function parseFrontMatterValue(frontMatter, key) {
  const re = new RegExp(`^${key}:\\s*(.+)$`, "m");
  const m = frontMatter.match(re);
  return m ? m[1].trim() : "";
}

function buildArticleHtml(post, lang, bodyHtml, showImage) {
  const title = getLocalizedField(post.title, lang);
  const summary = getLocalizedField(post.summary, lang);
  const section = post.section || "";
  const dateText = formatDate(post.date, lang);

  return `
    <a class="back-link" href="./index.html?lang=${lang}">← Back</a>

    <article>
      <header class="article-head">
        ${showImage ? `<img class="article-cover" src="${escapeHtml(post.image)}" alt="${escapeHtml(title)}">` : ""}
        <div class="article-head-inner">
          <div class="article-meta">
            ${section ? `<span class="article-tag">${escapeHtml(section)}</span>` : ""}
            ${dateText ? `<span>${escapeHtml(dateText)}</span>` : ""}
          </div>
          <h1 class="article-title">${escapeHtml(title)}</h1>
          ${summary ? `<p class="article-summary">${escapeHtml(summary)}</p>` : ""}
        </div>
      </header>

      <section class="article-body">
        ${bodyHtml}
      </section>
    </article>
  `;
}

async function renderArticlePage() {
  try {
    const id = getQuery("id");
    const lang = normalizeLang(getQuery("lang") || "zh");

    if (!id) {
      app.innerHTML = `<div class="error">Missing article id.</div>`;
      return;
    }

    const posts = await fetchPostsIndex();
    const post = findPostById(posts, id);

    if (!post) {
      app.innerHTML = `<div class="error">Article not found.</div>`;
      return;
    }

    // 这里假设索引里有 post.file 字段指向 md 文件
    // 如果你现在用的是 post.path / post.url / post.markdown，就改成对应字段
    const mdPath = post.file || post.path || post.url || "";
    if (!mdPath) {
      app.innerHTML = `<div class="error">Markdown file path is missing.</div>`;
      return;
    }

    const rawMd = await fetchText(mdPath);
    const langMd = extractLangBlock(rawMd, lang);
    const bodyHtml = simpleMarkdownToHtml(langMd);

    // 关键逻辑：没写 image，或图片不存在，就不显示图片栏
    const showImage = await imageExists(post.image);

    app.innerHTML = buildArticleHtml(post, lang, bodyHtml, showImage);
    document.title = `${getLocalizedField(post.title, lang)} - Semanario China`;
  } catch (err) {
    console.error(err);
    app.innerHTML = `<div class="error">Failed to load the article.</div>`;
  }
}

/* =========
   首页/列表页也可以用同样逻辑
   没图就不渲染缩略图
   ========= */

function buildCardHtml(post, lang, showImage) {
  const title = getLocalizedField(post.title, lang);
  const summary = getLocalizedField(post.summary, lang);
  const section = post.section || "";

  return `
    <article class="news-card">
      <a href="./article.html?id=${encodeURIComponent(post.id)}&lang=${lang}">
        ${showImage ? `
          <div class="news-card-cover-wrap">
            <img class="news-card-cover" src="${escapeHtml(post.image)}" alt="${escapeHtml(title)}">
          </div>
        ` : ""}
        <div class="news-card-body">
          ${section ? `<div class="news-card-section">${escapeHtml(section)}</div>` : ""}
          <h2 class="news-card-title">${escapeHtml(title)}</h2>
          ${summary ? `<p class="news-card-summary">${escapeHtml(summary)}</p>` : ""}
        </div>
      </a>
    </article>
  `;
}

async function renderCards(posts, lang) {
  const htmlList = await Promise.all(
    posts.map(async (post) => {
      const showImage = await imageExists(post.image);
      return buildCardHtml(post, lang, showImage);
    })
  );
  return htmlList.join("\n");
}

async function init() {
  const page = document.body.dataset.page;
  if (page === "article") {
    await renderArticlePage();
  }
}

init();
