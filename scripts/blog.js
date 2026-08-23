/* Renders the article list on blog.html from data/blogInfo.js, plus the
   category filter above it. */

const blogListElem = document.querySelector('.js-blog-list');
const blogFiltersElem = document.querySelector('.js-blog-filters');

const ALL_CATEGORIES = 'All';

/* Every article image has derivatives at these widths — see
   tools/build-images.py. A card is at most half the 1200px container; the
   featured card takes 45% of it, and both go full-bleed on a phone. */
const CARD_WIDTHS = [640, 1024, 1600];
const CARD_SIZES = '(max-width: 500px) 100vw, (max-width: 1240px) 50vw, 560px';

// Newest first, whatever order the data file happens to be written in.
const sortedArticles = [...articles].sort((a, b) => b.date.localeCompare(a.date));

function articleCardHTML(article, { featured = false } = {}) {
  const image = ResponsiveImage.pictureHTML(article.image, {
    widths: CARD_WIDTHS,
    sizes: CARD_SIZES,
    className: 'article-card-image',
    // The first card is above the fold on every screen.
    loading: featured ? 'eager' : 'lazy'
  });

  return `
    <article class="article-card${featured ? ' featured' : ''}">
      <a class="article-card-link" href="article.html?post=${encodeURIComponent(article.slug)}">
        <div class="article-card-image-container">
          ${image}
        </div>
        <div class="article-card-text">
          <div class="article-meta">
            ${featured ? '<span class="featured-flag">Latest</span>' : ''}
            <span class="article-category">${article.category}</span>
            <span>${article.displayDate}</span>
            <span class="article-meta-sep">&#8226;</span>
            <span>${article.readTime}</span>
          </div>
          <h2 class="article-card-title">${article.title}</h2>
          <p class="article-card-excerpt">${article.excerpt}</p>
          <span class="article-card-more">Read the article</span>
        </div>
      </a>
    </article>
  `;
}

function renderArticles(category) {
  const shown = category === ALL_CATEGORIES
    ? sortedArticles
    : sortedArticles.filter(article => article.category === category);

  if (!shown.length) {
    blogListElem.innerHTML =
      '<p class="blog-empty">No articles in this category yet.</p>';
    return;
  }

  // The newest article gets the wide treatment, but only in the unfiltered
  // view — inside a single category a lone featured card looks like an error.
  const useFeatured = category === ALL_CATEGORIES;

  blogListElem.innerHTML = shown
    .map((article, index) => articleCardHTML(article, { featured: useFeatured && index === 0 }))
    .join('');
}

function renderFilters() {
  const categories = [ALL_CATEGORIES, ...new Set(sortedArticles.map(a => a.category))];

  blogFiltersElem.innerHTML = categories.map(category => `
    <button type="button" class="filter-chip" data-category="${category}"
      aria-pressed="${category === ALL_CATEGORIES}">${category}</button>
  `).join('');

  blogFiltersElem.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      blogFiltersElem.querySelectorAll('.filter-chip').forEach(other => {
        other.setAttribute('aria-pressed', other === chip);
      });
      renderArticles(chip.dataset.category);
    });
  });
}

renderFilters();
renderArticles(ALL_CATEGORIES);
