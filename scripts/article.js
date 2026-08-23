/* Renders one article on article.html. The post is chosen by the `post` query
   parameter, e.g. article.html?post=oxbridge-interview-preparation.

   Because there is one HTML file behind every article, the per-article <head>
   — title, description, canonical, share tags, structured data — has to be
   written here rather than sitting in the markup. */

const SITE_ORIGIN = 'https://www.theunimentor.com';

const articleElem = document.querySelector('.js-article');
const moreListElem = document.querySelector('.js-more-list');
const moreTitleElem = document.querySelector('.js-more-title');

const requestedSlug = new URLSearchParams(window.location.search).get('post');
const article = articles.find(entry => entry.slug === requestedSlug);

const HERO_WIDTHS = [640, 1024, 1600];
const CARD_WIDTHS = [640, 1024, 1600];

function setMeta(selector, attribute, value) {
  const element = document.querySelector(selector);
  if (element) element.setAttribute(attribute, value);
}

function setLink(rel, href) {
  let element = document.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

function absoluteUrl(path) {
  return SITE_ORIGIN + '/' + String(path).replace(/^\//, '');
}

function renderNotFound() {
  document.title = 'Article not found | TheUniMentor';
  // A missing post must not be indexed under the canonical blog URL.
  const robots = document.createElement('meta');
  robots.setAttribute('name', 'robots');
  robots.setAttribute('content', 'noindex');
  document.head.appendChild(robots);

  articleElem.innerHTML = `
    <div class="article-header">
      <h1 class="article-title">We couldn't find that article</h1>
    </div>
    <div class="article-body">
      <p>The link may be out of date. Everything we have published is listed on
      the <a href="blog.html" style="color: var(--accent-color); font-weight: 500; display: inline;">blog page</a>.</p>
    </div>
  `;
}

function renderHead() {
  const url = `${SITE_ORIGIN}/article.html?post=${encodeURIComponent(article.slug)}`;
  const image = absoluteUrl(article.image);

  document.title = `${article.title} | TheUniMentor`;

  setMeta('meta[name="description"]', 'content', article.excerpt);
  setMeta('meta[property="og:title"]', 'content', `${article.title} | TheUniMentor`);
  setMeta('meta[property="og:description"]', 'content', article.excerpt);
  setMeta('meta[property="og:url"]', 'content', url);
  setMeta('meta[property="og:image"]', 'content', image);
  setMeta('meta[name="twitter:title"]', 'content', `${article.title} | TheUniMentor`);
  setMeta('meta[name="twitter:description"]', 'content', article.excerpt);
  setMeta('meta[name="twitter:image"]', 'content', image);
  setLink('canonical', url);

  const jsonLd = document.createElement('script');
  jsonLd.type = 'application/ld+json';
  jsonLd.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    image: [image],
    datePublished: article.date,
    dateModified: article.date,
    articleSection: article.category,
    author: { '@type': 'Organization', name: article.author },
    publisher: {
      '@type': 'Organization',
      name: 'TheUniMentor',
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl('images/icons/the-insight-mentor-logo.png')
      }
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    inLanguage: 'en-GB'
  });
  document.head.appendChild(jsonLd);

  const breadcrumb = document.createElement('script');
  breadcrumb.type = 'application/ld+json';
  breadcrumb.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/` },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_ORIGIN}/blog.html` },
      { '@type': 'ListItem', position: 3, name: article.title, item: url }
    ]
  });
  document.head.appendChild(breadcrumb);
}

function renderArticle() {
  renderHead();

  const hero = ResponsiveImage.pictureHTML(article.image, {
    widths: HERO_WIDTHS,
    sizes: '(max-width: 860px) 100vw, 820px',
    className: 'article-hero',
    loading: 'eager',
    fetchpriority: 'high'
  });

  articleElem.innerHTML = `
    ${hero}
    <div class="article-header">
      <h1 class="article-title">${article.title}</h1>
      <div class="article-meta">
        <span class="article-category">${article.category}</span>
        <span class="article-author">By ${article.author}</span>
        <span class="article-meta-sep">&#8226;</span>
        <time datetime="${article.date}">${article.displayDate}</time>
        <span class="article-meta-sep">&#8226;</span>
        <span>${article.readTime}</span>
      </div>
    </div>
    <div class="article-body">${article.body}</div>
  `;
}

function renderMoreArticles() {
  const others = articles
    .filter(entry => entry.slug !== requestedSlug)
    // Articles in the same category first, then the rest by date.
    .sort((a, b) => {
      if (!article) return b.date.localeCompare(a.date);
      const aMatch = a.category === article.category ? 0 : 1;
      const bMatch = b.category === article.category ? 0 : 1;
      return aMatch - bMatch || b.date.localeCompare(a.date);
    })
    .slice(0, 3);

  if (!others.length) return;

  moreTitleElem.classList.remove('hidden');
  moreListElem.innerHTML = others.map(entry => `
    <article class="article-card">
      <a class="article-card-link" href="article.html?post=${encodeURIComponent(entry.slug)}">
        <div class="article-card-image-container">
          ${ResponsiveImage.pictureHTML(entry.image, {
            widths: CARD_WIDTHS,
            sizes: '(max-width: 500px) 100vw, (max-width: 1240px) 50vw, 380px',
            className: 'article-card-image',
            loading: 'lazy'
          })}
        </div>
        <div class="article-card-text">
          <div class="article-meta">
            <span class="article-category">${entry.category}</span>
            <span>${entry.readTime}</span>
          </div>
          <h2 class="article-card-title">${entry.title}</h2>
          <p class="article-card-excerpt">${entry.excerpt}</p>
          <span class="article-card-more">Read the article</span>
        </div>
      </a>
    </article>
  `).join('');
}

if (article) {
  renderArticle();
} else {
  renderNotFound();
}

renderMoreArticles();
