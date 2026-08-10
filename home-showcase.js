(() => {
  const grid = document.querySelector('#home-showcase-grid');
  if (!grid || !Array.isArray(window.GUDAO_HOME_FEATURES)) return;

  const safeText = (value) => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  grid.innerHTML = window.GUDAO_HOME_FEATURES.map((item) => {
    const isExternal = /^https?:\/\//i.test(item.link);
    const externalAttributes = isExternal
      ? ' target="_blank" rel="noopener noreferrer"'
      : '';

    return `
      <article class="home-showcase-card">
        <a class="home-showcase-poster" href="${safeText(item.link)}"${externalAttributes} aria-label="${safeText(item.title)}">
          <img
            src="${safeText(item.image)}"
            alt="${safeText(item.title)}"
            loading="lazy"
            onerror="this.style.display='none'; this.nextElementSibling.style.display='grid';"
          >
          <div class="home-showcase-fallback">GUDAO<br>${safeText(item.eyebrow)}</div>
          <span class="home-showcase-status">${safeText(item.status)}</span>
        </a>

        <div class="home-showcase-body">
          <p class="home-showcase-eyebrow">${safeText(item.eyebrow)}</p>
          <h2>${safeText(item.title)}</h2>
          <p>${safeText(item.description)}</p>
          <a class="home-showcase-link" href="${safeText(item.link)}"${externalAttributes}>
            ${safeText(item.linkText)} <span aria-hidden="true">↗</span>
          </a>
        </div>
      </article>
    `;
  }).join('');
})();
