const uiText = {
  es: {
    kicker: "Noticias sobre China para América Latina",
    subtitle: "Ventana trilingüe sobre China, América Latina y el mundo.",
    nav: [
      { label: "Portada", type: "category", slug: "home" },
      { label: "China", type: "category", slug: "china" },
      { label: "América Latina", type: "category", slug: "latam" },
      { label: "Economía", type: "category", slug: "economy" },
      { label: "Cultura", type: "category", slug: "culture" },
      { label: "Especiales", type: "category", slug: "special" },
      { label: "Archivo", type: "archive" }
    ],
    latest: "Últimas noticias",
    featured: "Lecturas recomendadas",
    archiveTitle: "Archivo completo",
    archiveIntro: "Consulta todas las publicaciones históricas.",
    loadMore: "Cargar más",
    noMore: "No hay más artículos",
    footer: "Cobertura de China y América Latina",
    back: "← Volver a la portada",
    metaSource: "Semanario China",
    noPosts: "No hay artículos en esta categoría."
  },
  en: {
    kicker: "News on China for Latin America",
    subtitle: "A trilingual window on China, Latin America and the world.",
    nav: [
      { label: "Home", type: "category", slug: "home" },
      { label: "China", type: "category", slug: "china" },
      { label: "Latin America", type: "category", slug: "latam" },
      { label: "Economy", type: "category", slug: "economy" },
      { label: "Culture", type: "category", slug: "culture" },
      { label: "Special Reports", type: "category", slug: "special" },
      { label: "Archive", type: "archive" }
    ],
    latest: "Latest News",
    featured: "Recommended Reading",
    archiveTitle: "Complete Archive",
    archiveIntro: "Browse all historical posts.",
    loadMore: "Load more",
    noMore: "No more posts",
    footer: "Coverage of China and Latin America",
    back: "← Back to homepage",
    metaSource: "Semanario China",
    noPosts: "No posts in this category."
  },
  zh: {
    kicker: "面向拉丁美洲的中国新闻",
    subtitle: "以西语、英语和中文呈现中国、拉美与世界的观察。",
    nav: [
      { label: "首页", type: "category", slug: "home" },
      { label: "中国", type: "category", slug: "china" },
      { label: "拉美", type: "category", slug: "latam" },
      { label: "经贸", type: "category", slug: "economy" },
      { label: "文化", type: "category", slug: "culture" },
      { label: "专题", type: "category", slug: "special" },
      { label: "全部文章", type: "archive" }
    ],
    latest: "最新消息",
    featured: "推荐阅读",
    archiveTitle: "全部历史文章",
    archiveIntro: "汇总本频道所有历史文章，欢迎关注",
    loadMore: "更多",
    noMore: "没有更多文章了",
    footer: "中国与拉美新闻观察",
    back: "← 返回首页",
    metaSource: "Semanario China",
    noPosts: "这个栏目下还没有文章。"
  }
};

const sectionLabels = {
  home: {
    es: "Portada",
    en: "Home",
    zh: "首页"
  },
  china: {
    es: "China",
    en: "China",
    zh: "中国"
  },
  latam: {
    es: "América Latina",
    en: "Latin America",
    zh: "拉美"
  },
  economy: {
    es: "Economía",
    en: "Economy",
    zh: "经贸"
  },
  culture: {
    es: "Cultura",
    en: "Culture",
    zh: "文化"
  },
  special: {
    es: "Especiales",
    en: "Special Reports",
    zh: "专题"
  }
};

const archiveState = {
  visibleCount: 10,
  items: []
};

function getParams() {
  return new URLSearchParams(window.location.search);
}

function getLang() {
  const lang = getParams().get("lang") || "es";
  return ["es", "en", "zh"].includes(lang) ? lang : "es";
}

function getCategory() {
  return getParams().get("category") || "home";
}

function getArticleId() {
  return getParams().get("id") || "";
}

function buildIndexUrl(lang, category = "home") {
  const url = new URL(window.location.href);
  url.pathname = "/index.html";
  url.searchParams.set("lang", lang);

  if (category === "home") {
    url.searchParams.delete("category");
  } else {
    url.searchParams.set("category", category);
  }

  url.searchParams.delete("id");
  return `${url.pathname}${url.search}`;
}

function buildArticleUrl(id, lang) {
  const url = new URL(window.location.href);
  url.pathname = "/article.html";
  url.searchParams.set("id", id);
  url.searchParams.set("lang", lang);
  url.searchParams.delete("category");
  return `${url.pathname}${url.search}`;
}

function buildArchiveUrl(lang) {
  const url = new URL(window.location.href);
  url.pathname = "/archive.html";
  url.searchParams.set("lang", lang);
  url.searchParams.delete("category");
  url.searchParams.delete("id");
  return `${url.pathname}${url.search}`;
}

function setLang(lang) {
  const page = document.body.dataset.page;
  const currentCategory = getCategory();
  const currentId = getArticleId();

  if (page === "article" && currentId) {
    window.location.href = buildArticleUrl(currentId, lang);
    return;
  }

  if (page === "archive") {
    window.location.href = buildArchiveUrl(lang);
    return;
  }

  window.location.href = buildIndexUrl(lang, currentCategory);
}

function setLanguageButtons(lang) {
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
    btn.addEventListener("click", () => setLang(btn.dataset.lang));
  });
}

function getCategoryLabel(story, lang) {
  if (story.category?.[lang]) return story.category[lang];
  if (story.category?.zh) return story.category.zh;
  if (story.category?.en) return story.category.en;
  if (story.category?.es) return story.category.es;

  if (story.section && sectionLabels[story.section]?.[lang]) {
    return sectionLabels[story.section][lang];
  }

  if (Array.isArray(story.tags) && story.tags.length > 0) {
    return story.tags[0];
  }

  return "";
}

function renderCommonUI(lang) {
  const text = uiText[lang];
  const kicker = document.getElementById("site-kicker");
  const subtitle = document.getElementById("site-subtitle");
  const nav = document.getElementById("main-nav");
  const footer = document.getElementById("footer-text");
  const back = document.getElementById("back-link");
  const page = document.body.dataset.page;
  const currentCategory = getCategory();

  if (kicker) kicker.textContent = text.kicker;
  if (subtitle) subtitle.textContent = text.subtitle;
  if (footer) footer.textContent = text.footer;
  if (back) back.textContent = text.back;

  if (nav) {
    nav.innerHTML = text.nav
      .map((item) => {
        let href = "#";
        let activeClass = "";

        if (item.type === "archive") {
          href = buildArchiveUrl(lang);
          activeClass = page === "archive" ? " active-nav" : "";
        } else {
          href = buildIndexUrl(lang, item.slug);
          activeClass = currentCategory === item.slug && page === "home" ? " active-nav" : "";
        }

        return `<a class="nav-pill${activeClass}" href="${href}">${item.label}</a>`;
      })
      .join("");
  }

  document.documentElement.lang = lang;
}

async function loadNewsData() {
  const res = await fetch(`./news-data.json?v=${Date.now()}`, {
    cache: "no-store"
  });

  if (!res.ok) {
    throw new Error("Failed to load news-data.json");
  }

  return await res.json();
}

function getFilteredData(newsData, category) {
  if (category === "home") return newsData;
  return newsData.filter((story) => story.section === category);
}

function createEmptyState(text) {
  return `<div class="empty-state">${text}</div>`;
}

function createImageTag(className, src, alt, extraAttrs = "") {
  if (!src || !String(src).trim()) return "";
  return `<img class="${className}" src="${src}" alt="${alt || ""}" ${extraAttrs}>`;
}

function attachImageFallbackHandlers() {
  document.querySelectorAll("img").forEach((img) => {
    img.addEventListener(
      "error",
      () => {
        if (img.id === "article-image") {
          img.style.display = "none";
          img.removeAttribute("src");
          return;
        }

        const heroLink = img.closest("#hero-card > a");
        if (heroLink) {
          heroLink.style.display = "none";
          return;
        }

        const newsCardLink = img.closest(".news-card > a");
        if (newsCardLink) {
          newsCardLink.style.display = "none";
          return;
        }

        img.style.display = "none";
      },
      { once: true }
    );
  });
}

function renderHome(lang, newsData) {
  const text = uiText[lang];
  const hero = document.getElementById("hero-card");
  const latestPanel = document.getElementById("latest-panel");
  const featuredTitle = document.getElementById("featured-title");
  const featuredGrid = document.getElementById("featured-grid");

  const currentCategory = getCategory();
  const filteredData = getFilteredData(newsData, currentCategory);

  if (!filteredData.length) {
    if (hero) hero.innerHTML = createEmptyState(text.noPosts);
    if (latestPanel) latestPanel.innerHTML = `<h2 class="panel-title">${text.latest}</h2>`;
    if (featuredTitle) featuredTitle.textContent = text.featured;
    if (featuredGrid) featuredGrid.innerHTML = "";
    return;
  }

  const mainStory = filteredData[0];
  const latestStories = filteredData.slice(0, 5);
  const featuredStories = filteredData.slice(1, 7);

  if (hero) {
    const heroImageHtml = createImageTag(
      "hero-image",
      mainStory.image || "",
      mainStory.title?.[lang] || ""
    );

    hero.innerHTML = `
      ${heroImageHtml ? `
        <a href="${buildArticleUrl(mainStory.id, lang)}">
          ${heroImageHtml}
        </a>
      ` : ""}
      <div class="hero-content">
        <div class="label-chip">${getCategoryLabel(mainStory, lang)}</div>
        <h2 class="hero-title">
          <a href="${buildArticleUrl(mainStory.id, lang)}">${mainStory.title?.[lang] || ""}</a>
        </h2>
        <p class="hero-summary">${mainStory.summary?.[lang] || ""}</p>
        <div class="meta-line">${mainStory.date || ""} ｜ ${text.metaSource}</div>
      </div>
    `;
  }

  if (latestPanel) {
    latestPanel.innerHTML = `
      <h2 class="panel-title">${text.latest}</h2>
      ${latestStories
        .map(
          (story) => `
            <div class="latest-item">
              <a href="${buildArticleUrl(story.id, lang)}">${story.title?.[lang] || ""}</a>
              <div class="meta-line">${story.date || ""}</div>
            </div>
          `
        )
        .join("")}
    `;
  }

  if (featuredTitle) {
    featuredTitle.textContent = text.featured;
  }

  if (featuredGrid) {
    featuredGrid.innerHTML = featuredStories
      .map((story) => {
        const cardImageHtml = createImageTag(
          "",
          story.image || "",
          story.title?.[lang] || ""
        );

        return `
          <article class="news-card">
            ${cardImageHtml ? `
              <a href="${buildArticleUrl(story.id, lang)}">
                ${cardImageHtml}
              </a>
            ` : ""}
            <div class="news-card-content">
              <div class="card-category">${getCategoryLabel(story, lang)}</div>
              <h3>
                <a href="${buildArticleUrl(story.id, lang)}">${story.title?.[lang] || ""}</a>
              </h3>
              <p>${story.summary?.[lang] || ""}</p>
              <div class="meta-line">${story.date || ""}</div>
            </div>
          </article>
        `;
      })
      .join("");
  }

  attachImageFallbackHandlers();
}

function renderArticle(lang, newsData) {
  const id = getArticleId() || newsData[0]?.id;
  const story = newsData.find((item) => item.id === id) || newsData[0];
  const text = uiText[lang];

  if (!story) return;

  document.title = `${story.title?.[lang] || ""} - Semanario China`;

  const category = document.getElementById("article-category");
  const title = document.getElementById("article-title");
  const summary = document.getElementById("article-summary");
  const meta = document.getElementById("article-meta");
  const image = document.getElementById("article-image");
  const body = document.getElementById("article-body");
  const back = document.getElementById("back-link");

  if (category) category.textContent = getCategoryLabel(story, lang);
  if (title) title.textContent = story.title?.[lang] || "";
  if (summary) summary.textContent = story.summary?.[lang] || "";
  if (meta) meta.textContent = `${story.date || ""} ｜ ${text.metaSource}`;

  if (image) {
    if (story.image && String(story.image).trim()) {
      image.src = story.image;
      image.alt = story.title?.[lang] || "";
      image.style.display = "block";

      image.onerror = () => {
        image.style.display = "none";
        image.removeAttribute("src");
      };
    } else {
      image.style.display = "none";
      image.removeAttribute("src");
      image.alt = "";
    }
  }

  if (body) body.innerHTML = story.bodyHtml?.[lang] || "";

  if (back) {
    const backCategory = story.section || "home";
    back.href = buildIndexUrl(lang, backCategory);
  }
}

function createArchiveCard(story, lang, text) {
  const cardImageHtml = createImageTag(
    "",
    story.image || "",
    story.title?.[lang] || ""
  );

  return `
    <article class="news-card">
      ${cardImageHtml ? `
        <a href="${buildArticleUrl(story.id, lang)}">
          ${cardImageHtml}
        </a>
      ` : ""}
      <div class="news-card-content">
        <div class="card-category">${getCategoryLabel(story, lang)}</div>
        <h3>
          <a href="${buildArticleUrl(story.id, lang)}">${story.title?.[lang] || ""}</a>
        </h3>
        <p>${story.summary?.[lang] || ""}</p>
        <div class="meta-line">${story.date || ""} ｜ ${text.metaSource}</div>
      </div>
    </article>
  `;
}

function renderArchiveList(lang) {
  const text = uiText[lang];
  const archiveList = document.getElementById("archive-list");
  const loadMoreBtn = document.getElementById("load-more-btn");

  if (!archiveList || !loadMoreBtn) return;

  const visibleItems = archiveState.items.slice(0, archiveState.visibleCount);

  archiveList.innerHTML = visibleItems
    .map((story) => createArchiveCard(story, lang, text))
    .join("");

  if (archiveState.visibleCount >= archiveState.items.length) {
    loadMoreBtn.disabled = true;
    loadMoreBtn.textContent = text.noMore;
  } else {
    loadMoreBtn.disabled = false;
    loadMoreBtn.textContent = text.loadMore;
  }

  attachImageFallbackHandlers();
}

function renderArchive(lang, newsData) {
  const text = uiText[lang];
  const title = document.getElementById("archive-title");
  const intro = document.getElementById("archive-intro");
  const back = document.getElementById("back-link");
  const loadMoreBtn = document.getElementById("load-more-btn");

  if (title) title.textContent = text.archiveTitle;
  if (intro) intro.textContent = text.archiveIntro;
  if (back) back.href = buildIndexUrl(lang, "home");

  archiveState.items = [...newsData];
  archiveState.visibleCount = 10;

  renderArchiveList(lang);

  if (loadMoreBtn) {
    loadMoreBtn.onclick = () => {
      archiveState.visibleCount += 10;
      renderArchiveList(lang);
    };
  }

  document.title = `${text.archiveTitle} - Semanario China`;
}

async function init() {
  const lang = getLang();
  const page = document.body.dataset.page;

  setLanguageButtons(lang);
  renderCommonUI(lang);

  try {
    const newsData = await loadNewsData();

    if (page === "home") {
      renderHome(lang, newsData);
    }

    if (page === "article") {
      renderArticle(lang, newsData);
    }

    if (page === "archive") {
      renderArchive(lang, newsData);
    }
  } catch (error) {
    console.error(error);

    const hero = document.getElementById("hero-card");
    const articleBody = document.getElementById("article-body");
    const archiveList = document.getElementById("archive-list");

    if (hero) {
      hero.innerHTML = `<div class="empty-state">Failed to load content.</div>`;
    }

    if (articleBody) {
      articleBody.innerHTML = `<p>Failed to load content.</p>`;
    }

    if (archiveList) {
      archiveList.innerHTML = `<div class="empty-state">Failed to load content.</div>`;
    }
  }
}

init();
