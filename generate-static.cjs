const fs = require('fs');
const path = require('path');

const html = fs.readFileSync('index.html', 'utf-8');

// Extract CSS (between first <style> and </style>)
const cssMatch = html.match(/<style>([\s\S]*?)<\/style>/);
const css = cssMatch[1];

// Extract I18N object
const i18nMatch = html.match(/const I18N = ([\s\S]*?);\s*\n\s*\n\s*\/\/ =+/);
const i18n = eval('(' + i18nMatch[1] + ')');

// Extract the HTML template parts
function extractSection(startMarker, endMarker) {
  const startIdx = html.indexOf(startMarker);
  const endIdx = html.indexOf(endMarker, startIdx);
  return html.slice(startIdx, endIdx);
}

// Template parts (not in any specific section, but after i18n and before </body>)
const progressBar = '<div id="progress-bar"></div>';

const topBar = html.match(/<nav class="top-bar">[\s\S]*?<\/nav>/)[0];

const containerStart = html.match(/<div class="container">[\s\S]*?<!-- Article -->/)[0];

const articleTemplate = html.match(/<article class="article">[\s\S]*?<\/article>/)[0];

const footer = html.match(/<footer class="blog-footer">[\s\S]*?<\/footer>/)[0];

const backToTop = '<button id="back-to-top" title="Back to top">\u2191</button>';

const baseUrl = 'https://ucfzem.github.io/ucfzem-blog';

function makePage(lang, t, isDefault) {
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  const metaDescs = {
    fr: 'Apprenez à automatiser la création de fiches produit e-commerce en combinant Next.js et l\'API de ChatGPT. Guide technique complet avec code source Next.js, API Route, et OpenAI.',
    en: 'Learn how to automate e-commerce product page creation with Next.js and the ChatGPT API. Step-by-step guide with Next.js API Routes, React components, and OpenAI integration.',
    es: 'Aprende a automatizar la creación de fichas de producto e-commerce con Next.js y la API de ChatGPT. Guía completa con código fuente, API Routes y OpenAI.',
    ar: 'تعلم أتمتة إنشاء صفحات المنتجات الإلكترونية باستخدام Next.js و ChatGPT API. دليل شامل مع كود مصدر Next.js و API Routes و OpenAI.'
  };

  // Reusable language switcher
  const langSwitcher = `
      <div class="lang-switcher">
        <a href="${baseUrl}/articles/automatiser-fiches-produit/" class="lang-btn${lang === 'fr' ? ' active' : ''}" title="Fran\u00e7ais">\u{1F1EB}\u{1F1F7} <span class="lang-label">FR</span></a>
        <a href="${baseUrl}/articles/automatiser-fiches-produit/en.html" class="lang-btn${lang === 'en' ? ' active' : ''}" title="English">\u{1F1EC}\u{1F1E7} <span class="lang-label">EN</span></a>
        <a href="${baseUrl}/articles/automatiser-fiches-produit/es.html" class="lang-btn${lang === 'es' ? ' active' : ''}" title="Espa\u00f1ol">\u{1F1EA}\u{1F1F8} <span class="lang-label">ES</span></a>
        <a href="${baseUrl}/articles/automatiser-fiches-produit/ar.html" class="lang-btn${lang === 'ar' ? ' active' : ''}" title="\u0627\u0644\u0639\u0631\u0628\u064a\u0629">\u{1F1F2}\u{1F1E6} <span class="lang-label">AR</span></a>
      </div>`;

  const themeBtn = `<button class="theme-toggle" id="theme-toggle" title="Toggle theme">\u{1F319}</button>`;

  const topBarFull = `<nav class="top-bar">
    <div class="top-bar-left">UcfZem Tech</div>
    <div class="top-bar-right">
      ${langSwitcher}
      ${themeBtn}
    </div>
  </nav>`;

  // Build related articles HTML
  const relatedHtml = t.related.map(r =>
    `<div class="related-card">
      <span class="related-card-tag">${r.tag}</span>
      <h4>${r.title}</h4>
      <p>${r.desc}</p>
    </div>`
  ).join('\n          ');

  // TOC items
  const tocHtml = t.toc_items.map(item =>
    `<li><a href="#${item.id}">${item.text}</a></li>`
  ).join('\n            ');

  // Hreflang links
  const hreflang = `
    <link rel="alternate" hreflang="fr" href="${baseUrl}/articles/automatiser-fiches-produit/" />
    <link rel="alternate" hreflang="en" href="${baseUrl}/articles/automatiser-fiches-produit/en.html" />
    <link rel="alternate" hreflang="es" href="${baseUrl}/articles/automatiser-fiches-produit/es.html" />
    <link rel="alternate" hreflang="ar" href="${baseUrl}/articles/automatiser-fiches-produit/ar.html" />
    <link rel="alternate" hreflang="x-default" href="${baseUrl}/articles/automatiser-fiches-produit/" />`;

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.title} | UcfZem Tech</title>
  <meta name="description" content="${metaDescs[lang]}">
  <meta name="robots" content="index, follow">
  <meta property="og:title" content="${t.title}">
  <meta property="og:description" content="${metaDescs[lang]}">
  <meta property="og:type" content="article">
  <meta property="og:locale" content="${lang === 'fr' ? 'fr_FR' : lang === 'en' ? 'en_US' : lang === 'es' ? 'es_ES' : 'ar_MA'}">
  ${hreflang}
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${t.title}">
  <meta name="twitter:description" content="${metaDescs[lang]}">
  <link rel="canonical" href="${baseUrl}/articles/automatiser-fiches-produit/${isDefault ? '' : lang + '.html'}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "${t.title}",
    "author": {
      "@type": "Person",
      "name": "UcfZem Tech"
    },
    "datePublished": "2026-06-28",
    "dateModified": "2026-06-28",
    "description": "${metaDescs[lang]}",
    "inLanguage": "${lang}",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "${baseUrl}/articles/automatiser-fiches-produit/${isDefault ? '' : lang + '.html'}"
    }
  }
  </script>
  <style>
${css}
  </style>
</head>
<body>
  <div id="progress-bar"></div>

  ${topBarFull}

  <div class="container">
    <aside>
      <button class="mobile-toc-toggle" id="toc-toggle">\u2630 ${t.toc_title}</button>
      <div class="toc" id="toc">
        <h3>${t.toc_title}</h3>
        <ul id="toc-list">
          ${tocHtml}
        </ul>
      </div>
    </aside>

    <article class="article">
      <span class="article-badge">${t.badge}</span>
      <h1 class="article-title">${t.title}</h1>

      <div class="article-meta">
        <span>\u270D\uFE0F ${t.author}</span>
        <span>\uD83D\uDCC5 ${t.date}</span>
        <span>\u23F1\uFE0F ${t.reading_time}</span>
      </div>

      <div class="share-bar">
        <button class="share-btn" onclick="navigator.clipboard.writeText(window.location.href).then(() => { const b=this; const o=b.innerHTML; b.innerHTML='\u2705 Copi\u00e9!'; setTimeout(()=>b.innerHTML=o,2000); })">\uD83D\uDD17 ${t.share_copy}</button>
        <button class="share-btn" onclick="window.open('https://twitter.com/intent/tweet?text='+encodeURIComponent(document.title)+'&url='+encodeURIComponent(window.location.href),'_blank')">\uD83D\uDC26 Twitter</button>
        <button class="share-btn" onclick="window.open('https://www.linkedin.com/sharing/share-offsite/?url='+encodeURIComponent(window.location.href),'_blank')">\uD83D\uDCBC LinkedIn</button>
      </div>

      <div class="article-content">
        ${t.content}
      </div>

      <div class="newsletter">
        <h3>${t.newsletter_title}</h3>
        <p>${t.newsletter_desc}</p>
        <form class="newsletter-form" onsubmit="return false;">
          <input type="email" placeholder="${t.newsletter_placeholder}">
          <button type="submit">${t.newsletter_btn}</button>
        </form>
      </div>

      <div class="related">
        <h3>${t.related_title}</h3>
        <div class="related-grid">
          ${relatedHtml}
        </div>
      </div>
    </article>

    <footer class="blog-footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <span class="footer-logo">UcfZem Tech</span>
          <p class="footer-tagline">${t.footer_tagline}</p>
        </div>
        <div class="footer-links">
          <div class="footer-col">
            <h4>${t.footer_nav}</h4>
            <a href="https://ucfzem.github.io/">${t.footer_home}</a>
            <a href="https://ucfzem.github.io/works/">${t.footer_works}</a>
            <a href="${baseUrl}/">${t.footer_blog}</a>
          </div>
          <div class="footer-col">
            <h4>${t.footer_projects}</h4>
            <a href="https://ucfzem.github.io/guide-freelance/">${t.footer_guide}</a>
            <a href="https://elixir-techx.vercel.app/">ElixirTechx</a>
            <a href="https://500-prompts-ia.vercel.app/">500 Prompts IA</a>
          </div>
          <div class="footer-col">
            <h4>${t.footer_contact}</h4>
            <a href="https://github.com/ucfzem">${t.footer_github}</a>
            <a href="mailto:azer.tyu199p@gmail.com">${t.footer_email}</a>
          </div>
        </div>
        <div class="footer-bottom">
          <p>${t.footer_copy}</p>
          <div class="footer-legal">
            <a href="#">${t.footer_legal}</a>
            <a href="#">${t.footer_cgv}</a>
            <a href="#">${t.footer_privacy}</a>
          </div>
        </div>
      </div>
    </footer>
  </div>

  <button id="back-to-top" title="Back to top">\u2191</button>

  <script>
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    let currentTheme = localStorage.getItem('theme') || 'light';
    function applyTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      themeToggle.textContent = theme === 'dark' ? '\u2600\uFE0F' : '\u{1F319}';
      localStorage.setItem('theme', theme);
      currentTheme = theme;
    }
    themeToggle.addEventListener('click', () => {
      applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });
    applyTheme(currentTheme);

    // Progress bar
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      document.getElementById('progress-bar').style.width = (docHeight > 0 ? (scrollTop / docHeight) * 100 : 0) + '%';
    });

    // Back to top
    const backToTop = document.getElementById('back-to-top');
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('visible', window.scrollY > 400);
    });
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // TOC highlight
    function initTOC() {
      const headings = document.querySelectorAll('.article-content h2[id]');
      const tocLinks = document.querySelectorAll('#toc-list a');
      if (!headings.length || !tocLinks.length) return;
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            tocLinks.forEach(link => link.classList.remove('active'));
            const activeLink = document.querySelector(\`#toc-list a[href="#\${entry.target.id}"]\`);
            if (activeLink) activeLink.classList.add('active');
          }
        });
      }, { rootMargin: '-80px 0px -60% 0px', threshold: 0 });
      headings.forEach(h => observer.observe(h));
    }
    initTOC();

    // Mobile TOC toggle
    document.getElementById('toc-toggle').addEventListener('click', () => {
      document.getElementById('toc').classList.toggle('open');
    });
    document.getElementById('toc-list').addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        document.getElementById('toc').classList.remove('open');
      }
    });
  </script>
</body>
</html>`;
}

// Create output directory
const outDir = 'articles/automatiser-fiches-produit';
fs.mkdirSync(outDir, { recursive: true });

// Generate French (default)
const frFr = makePage('fr', i18n.fr, true);
fs.writeFileSync(path.join(outDir, 'index.html'), frFr);
console.log('✓ articles/automatiser-fiches-produit/index.html (fr)');

// Generate English
const enUs = makePage('en', i18n.en, false);
fs.writeFileSync(path.join(outDir, 'en.html'), enUs);
console.log('✓ articles/automatiser-fiches-produit/en.html (en)');

// Generate Spanish
const esEs = makePage('es', i18n.es, false);
fs.writeFileSync(path.join(outDir, 'es.html'), esEs);
console.log('✓ articles/automatiser-fiches-produit/es.html (es)');

// Generate Arabic
const arMa = makePage('ar', i18n.ar, false);
fs.writeFileSync(path.join(outDir, 'ar.html'), arMa);
console.log('✓ articles/automatiser-fiches-produit/ar.html (ar)');

// Generate sitemap
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>${baseUrl}/articles/automatiser-fiches-produit/</loc>
    <lastmod>2026-06-28</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="fr" href="${baseUrl}/articles/automatiser-fiches-produit/" />
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/articles/automatiser-fiches-produit/en.html" />
    <xhtml:link rel="alternate" hreflang="es" href="${baseUrl}/articles/automatiser-fiches-produit/es.html" />
    <xhtml:link rel="alternate" hreflang="ar" href="${baseUrl}/articles/automatiser-fiches-produit/ar.html" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/articles/automatiser-fiches-produit/" />
  </url>
  <url>
    <loc>${baseUrl}/articles/automatiser-fiches-produit/en.html</loc>
    <lastmod>2026-06-28</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/articles/automatiser-fiches-produit/es.html</loc>
    <lastmod>2026-06-28</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/articles/automatiser-fiches-produit/ar.html</loc>
    <lastmod>2026-06-28</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>2026-06-28</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
fs.writeFileSync('articles/sitemap.xml', sitemap);
console.log('✓ articles/sitemap.xml');

console.log('\nDone! Generated 4 static pages + sitemap.');
