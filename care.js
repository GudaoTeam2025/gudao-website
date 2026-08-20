(() => {
  const list = document.querySelector('#care-list');
  if (!list || !Array.isArray(window.GUDAO_CARE_ARTICLES)) return;

  const safe = (value) => String(value ?? '')
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#039;');

  const externalAttrs = (url) => /^https?:\/\//i.test(url)
    ? ' target="_blank" rel="noopener noreferrer"' : '';

  list.innerHTML = window.GUDAO_CARE_ARTICLES.map((article, index) => {
    const images = Array.isArray(article.images) ? article.images : [];
    const slides = images.map((image, imageIndex) => `
      <li class="care-slide" aria-hidden="${imageIndex !== 0}">
        <img src="${safe(image)}" alt="${safe(article.title)} 圖片 ${imageIndex + 1}"
          loading="${imageIndex === 0 ? 'eager' : 'lazy'}" draggable="false"
          onerror="this.style.display='none'; this.nextElementSibling.style.display='grid';">
        <div class="care-fallback">GUDAO<br>${safe(article.code)}</div>
      </li>`).join('');

    const dots = images.map((_, imageIndex) => `
      <button class="care-dot ${imageIndex === 0 ? 'active' : ''}" type="button"
        data-go-to="${imageIndex}" aria-label="顯示第 ${imageIndex + 1} 張圖片"></button>`).join('');

    const paragraphs = (article.paragraphs || []).map(text => `<p>${safe(text)}</p>`).join('');
    const points = (article.points || []).map(text => `<li>${safe(text)}</li>`).join('');

    return `
      <article class="care-article" data-care-index="${index}">
        <div class="care-gallery" tabindex="0" aria-label="${safe(article.title)} 圖片，可左右滑動">
          <ul class="care-track">${slides}</ul>
          ${images.length > 1 ? `
            <button class="care-arrow care-prev" type="button" aria-label="上一張圖片">‹</button>
            <button class="care-arrow care-next" type="button" aria-label="下一張圖片">›</button>
            <div class="care-dots">${dots}</div>` : ''}
          <span class="care-badge">${safe(article.badge)}</span>
          <span class="care-counter">1 / ${Math.max(images.length, 1)}</span>
        </div>

        <div class="care-content">
          <p class="care-category">${safe(article.category)}</p>
          <p class="care-code">${safe(article.code)}</p>
          <h2>${safe(article.title)}</h2>
          <p class="care-subtitle">${safe(article.subtitle)}</p>
          <div class="care-article-body">${paragraphs}</div>
          <ul class="care-points">${points}</ul>
          <a class="care-contact" href="${safe(article.link)}"${externalAttrs(article.link)}>
            ${safe(article.linkText)} <span aria-hidden="true">↗</span>
          </a>
        </div>
      </article>`;
  }).join('');

  document.querySelectorAll('.care-article').forEach(setupGallery);

  function setupGallery(article) {
    const gallery = article.querySelector('.care-gallery');
    const slides = [...article.querySelectorAll('.care-slide')];
    const dots = [...article.querySelectorAll('.care-dot')];
    const previous = article.querySelector('.care-prev');
    const next = article.querySelector('.care-next');
    const counter = article.querySelector('.care-counter');
    let current = 0;
    let dragging = false;
    let startX = 0;
    let deltaX = 0;

    if (!gallery || slides.length === 0) return;

    const show = (index) => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        const active = i === current;
        slide.classList.toggle('active', active);
        slide.setAttribute('aria-hidden', String(!active));
      });
      dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
      if (counter) counter.textContent = `${current + 1} / ${slides.length}`;
    };

    previous?.addEventListener('click', event => {
      event.preventDefault(); event.stopPropagation(); show(current - 1);
    });
    next?.addEventListener('click', event => {
      event.preventDefault(); event.stopPropagation(); show(current + 1);
    });
    dots.forEach(dot => dot.addEventListener('click', event => {
      event.preventDefault(); event.stopPropagation(); show(Number(dot.dataset.goTo));
    }));

    gallery.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); show(current - 1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); show(current + 1); }
    });

    gallery.addEventListener('pointerdown', event => {
      if (event.target.closest('button')) return;
      dragging = true; startX = event.clientX; deltaX = 0;
      gallery.setPointerCapture?.(event.pointerId);
    });
    gallery.addEventListener('pointermove', event => {
      if (dragging) deltaX = event.clientX - startX;
    });
    gallery.addEventListener('pointerup', event => {
      if (!dragging) return;
      dragging = false;
      gallery.releasePointerCapture?.(event.pointerId);
      if (Math.abs(deltaX) > 50) show(deltaX > 0 ? current - 1 : current + 1);
      deltaX = 0;
    });
    gallery.addEventListener('pointercancel', () => { dragging = false; deltaX = 0; });

    show(0);
  }
})();
