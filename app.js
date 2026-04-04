const uiText = {
  es: {
    kicker: "Noticias sobre China para América Latina",
    subtitle: "Ventana trilingüe sobre China, América Latina y el mundo.",
   es: {
  kicker: "Noticias sobre China para América Latina",
  subtitle: "Ventana trilingüe sobre China, América Latina y el mundo.",
  nav: [
    { label: "Portada", slug: "home" },
    { label: "China", slug: "china" },
    { label: "América Latina", slug: "latam" },
    { label: "Economía", slug: "economy" },
    { label: "Cultura", slug: "culture" },
    { label: "Especiales", slug: "special" }
  ],
  latest: "Últimas noticias",
  featured: "Lecturas recomendadas",
  footer: "Cobertura de China y América Latina",
  back: "← Volver a la portada",
  metaSource: "Semanario China"
},
    latest: "Últimas noticias",
    featured: "Lecturas recomendadas",
    footer: "Cobertura de China y América Latina",
    back: "← Volver a la portada",
    metaSource: "Semanario China"
  },
  en: {
    kicker: "News on China for Latin America",
    subtitle: "A trilingual window on China, Latin America and the world.",
    en: {
  kicker: "News on China for Latin America",
  subtitle: "A trilingual window on China, Latin America and the world.",
  nav: [
    { label: "Home", slug: "home" },
    { label: "China", slug: "china" },
    { label: "Latin America", slug: "latam" },
    { label: "Economy", slug: "economy" },
    { label: "Culture", slug: "culture" },
    { label: "Special Reports", slug: "special" }
  ],
  latest: "Latest News",
  featured: "Recommended Reading",
  footer: "Coverage of China and Latin America",
  back: "← Back to homepage",
  metaSource: "Semanario China"
},
    latest: "Latest News",
    featured: "Recommended Reading",
    footer: "Coverage of China and Latin America",
    back: "← Back to homepage",
    metaSource: "Semanario China"
  },
  zh: {
    kicker: "面向拉丁美洲的中国新闻",
    subtitle: "以西语、英语和中文呈现中国、拉美与世界的观察。",
    zh: {
  kicker: "面向拉丁美洲的中国新闻",
  subtitle: "以西语、英语和中文呈现中国、拉美与世界的观察。",
  nav: [
    { label: "首页", slug: "home" },
    { label: "中国", slug: "china" },
    { label: "拉美", slug: "latam" },
    { label: "经贸", slug: "economy" },
    { label: "文化", slug: "culture" },
    { label: "专题", slug: "special" }
  ],
  latest: "最新消息",
  featured: "推荐阅读",
  footer: "中国与拉美新闻观察",
  back: "← 返回首页",
  metaSource: "Semanario China"
}
    latest: "最新消息",
    featured: "推荐阅读",
    footer: "中国与拉美新闻观察",
    back: "← 返回首页",
    metaSource: "Semanario China"
  }
};

function getLang() {
  const params = new URLSearchParams(window.location.search);
  return params.get("lang") || "es";
}

function setLang(lang) {
  const url = new URL(window.location.href);
  url.searchParams.set("lang", lang);
  window.location.href = url.toString();
}

function setLanguageButtons(lang) {
  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
    btn.addEventListener("click", () => setLang(btn.dataset.lang));
  });
}

function renderCommonUI(lang) {
  const text = uiText[lang];

  const kicker = document.getElementById("site-kicker");
  const subtitle = document.getElementById("site-subtitle");
  const nav = document.getElementById("main-nav");
  const footer = document.getElementById("footer-text");
  const back = document.getElementById("back-link");

  if (kicker) kicker.textContent = text.kicker;
  if (subtitle) subtitle.textContent = text.subtitle;
  if (footer) footer.textContent = text.footer;
  if (back) back.textContent = text.back;

  if (nav) {
  const currentCategory = getCategory();

  nav.innerHTML = text.nav.map(item => {
    const href =
      item.slug === "home"
        ? `index.html?lang=${lang}`
        : `index.html?lang=${lang}&category=${item.slug}`;

    const activeClass = currentCategory === item.slug ? " active-nav" : "";

    return `<a class="nav-pill${activeClass}" href="${href}">${item.label}</a>`;
  }).join("");
}
  document.documentElement.lang = lang;
}

async function loadNewsData() {
  const res = await fetch(`./news-data.json?v=${Date.now()}`);
  if (!res.ok) throw new Error("Failed to load news-data.json");
  return await res.json();
}

function renderHome(lang, newsData) {
  const currentCategory = getCategory();

let filteredData = newsData;
if (currentCategory !== "home") {
  filteredData = newsData.filter(story => story.section === currentCategory);
}
  const text = uiText[lang];
  const hero = document.getElementById("hero-card");
  const latestPanel = document.getElementById("latest-panel");
  const featuredTitle = document.getElementById("featured-title");
  const featuredGrid = document.getElementById("featured-grid");

  if (!filteredData.length) {
    if (hero) hero.innerHTML = "<div class='hero-content'><p>No posts yet.</p></div>";
    if (latestPanel) latestPanel.innerHTML = "";
    if (featuredGrid) featuredGrid.innerHTML = "";
    return;
  }

  const mainStory = filteredData[0];
  const latestStories = filteredData.slice(0, 5);
  const featuredStories = filteredData.slice(1, 7);

  hero.innerHTML = `
    <a href="article.html?id=${mainStory.id}&lang=${lang}">
      <img class="hero-image" src="${mainStory.image}" alt="${mainStory.title[lang]}">
    </a>
    <div class="hero-content">
      <div class="label-chip">${mainStory.category[lang] || ""}</div>
      <h2 class="hero-title">
        <a href="article.html?id=${mainStory.id}&lang=${lang}">${mainStory.title[lang] || ""}</a>
      </h2>
      <p class="hero-summary">${mainStory.summary[lang] || ""}</p>
      <div class="meta-line">${mainStory.date} ｜ ${text.metaSource}</div>
    </div>
  `;

  latestPanel.innerHTML = `
    <h2 class="panel-title">${text.latest}</h2>
    ${latestStories.map(story => `
      <div class="latest-item">
        <a href="article.html?id=${story.id}&lang=${lang}">${story.title[lang] || ""}</a>
        <div class="meta-line">${story.date}</div>
      </div>
    `).join("")}
  `;

  featuredTitle.textContent = text.featured;

  featuredGrid.innerHTML = featuredStories.map(story => `
    <article class="news-card">
      <a href="article.html?id=${story.id}&lang=${lang}">
        <img src="${story.image}" alt="${story.title[lang] || ""}">
      </a>
      <div class="news-card-content">
        <div class="card-category">${story.category[lang] || ""}</div>
        <h3>
          <a href="article.html?id=${story.id}&lang=${lang}">${story.title[lang] || ""}</a>
        </h3>
        <p>${story.summary[lang] || ""}</p>
        <div class="meta-line">${story.date}</div>
      </div>
    </article>
  `).join("");
}
function getCategory() {
  const params = new URLSearchParams(window.location.search);
  return params.get("category") || "home";
}
function renderArticle(lang, newsData) {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id") || newsData[0]?.id;
  const story = newsData.find(item => item.id === id) || newsData[0];
  const text = uiText[lang];

  if (!story) return;

  document.title = `${story.title[lang]} - Semanario China`;

  document.getElementById("article-category").textContent = story.category[lang] || "";
  document.getElementById("article-title").textContent = story.title[lang] || "";
  document.getElementById("article-meta").textContent = `${story.date} ｜ ${text.metaSource}`;

  const image = document.getElementById("article-image");
  image.src = story.image;
  image.alt = story.title[lang] || "";

  document.getElementById("article-body").innerHTML = story.bodyHtml[lang] || "";
}

async function init() {
  const lang = getLang();
  const page = document.body.dataset.page;

  setLanguageButtons(lang);
  renderCommonUI(lang);

  try {
    const newsData = await loadNewsData();
    if (page === "home") renderHome(lang, newsData);
    if (page === "article") renderArticle(lang, newsData);
  } catch (err) {
    console.error(err);
  }
}

init();
