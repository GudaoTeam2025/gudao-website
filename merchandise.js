(() => {
  const list = document.querySelector('#merchandise-list');
  if (!list || !Array.isArray(window.GUDAO_MERCHANDISE)) return;

  const escapeHtml = (value) => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  function isExternal(url) {
    return /^https?:\/\//i.test(url);
  }

  list.innerHTML = window.GUDAO_MERCHANDISE.map((product, productIndex) => {
    const images = Array.isArray(product.images) ? product.images : [];
    const slides = images.map((image, imageIndex) => `
      <li class="merch-slide" data-slide="${imageIndex}" aria-hidden="${imageIndex !== 0}">
        <img
          src="${escapeHtml(image)}"
          alt="${escapeHtml(product.name)} 圖片 ${imageIndex + 1}"
          loading="${imageIndex === 0 ? 'eager' : 'lazy'}"
          draggable="false"
          onerror="this.style.display='none'; this.nextElementSibling.style.display='grid';"
        >
        <div class="merch-image-fallback">GUDAO<br>${escapeHtml(product.code)}</div>
      </li>
    `).join('');

    const dots = images.map((_, imageIndex) => `
      <button
        class="merch-dot ${imageIndex === 0 ? 'active' : ''}"
        type="button"
        data-go-to="${imageIndex}"
        aria-label="顯示第 ${imageIndex + 1} 張圖片"
      ></button>
    `).join('');

    const highlights = (product.highlights || []).map(item => `<li>${escapeHtml(item)}</li>`).join('');
    const external = isExternal(product.link) ? ' target="_blank" rel="noopener noreferrer"' : '';

    return `
      <article class="merch-product" data-product-index="${productIndex}">
        <div class="merch-gallery" tabindex="0" aria-label="${escapeHtml(product.name)} 商品圖片，可左右滑動">
          <ul class="merch-track">${slides}</ul>

          ${images.length > 1 ? `
            <button class="merch-arrow merch-prev" type="button" aria-label="上一張圖片">‹</button>
            <button class="merch-arrow merch-next" type="button" aria-label="下一張圖片">›</button>
            <div class="merch-dots" aria-label="圖片選擇">${dots}</div>
          ` : ''}

          <span class="merch-status">${escapeHtml(product.status)}</span>
          <span class="merch-counter">1 / ${Math.max(images.length, 1)}</span>
        </div>

        <div class="merch-content">
          <p class="merch-category">${escapeHtml(product.category)}</p>
          <p class="merch-code">${escapeHtml(product.code)}</p>
          <h2>${escapeHtml(product.name)}</h2>
          <p class="merch-subtitle">${escapeHtml(product.subtitle)}</p>
          <p class="merch-description">${escapeHtml(product.description)}</p>

          <ul class="merch-highlights">${highlights}</ul>

          <a class="merch-link" href="${escapeHtml(product.link)}"${external}>
            ${escapeHtml(product.linkText)} <span aria-hidden="true">↗</span>
          </a>
        </div>
      </article>
    `;
  }).join('');

  document.querySelectorAll('.merch-product').forEach(setupGallery);

  function setupGallery(product) {
    const gallery = product.querySelector('.merch-gallery');
    const slides = [...product.querySelectorAll('.merch-slide')];
    const dots = [...product.querySelectorAll('.merch-dot')];
    const previous = product.querySelector('.merch-prev');
    const next = product.querySelector('.merch-next');
    const counter = product.querySelector('.merch-counter');
    let current = 0;
    let startX = 0;
    let deltaX = 0;

    if (slides.length === 0) return;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        const active = slideIndex === current;
        slide.classList.toggle('active', active);
        slide.setAttribute('aria-hidden', String(!active));
      });
      dots.forEach((dot, dotIndex) => dot.classList.toggle('active', dotIndex === current));
      counter.textContent = `${current + 1} / ${slides.length}`;
    }

    previous?.addEventListener('click', () => show(current - 1));
    next?.addEventListener('click', () => show(current + 1));
    dots.forEach(dot => dot.addEventListener('click', () => show(Number(dot.dataset.goTo))));

    gallery.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft') show(current - 1);
      if (event.key === 'ArrowRight') show(current + 1);
    });

    gallery.addEventListener('pointerdown', event => {
      startX = event.clientX;
      deltaX = 0;
      gallery.setPointerCapture?.(event.pointerId);
    });

    gallery.addEventListener('pointermove', event => {
      if (!startX) return;
      deltaX = event.clientX - startX;
    });

    gallery.addEventListener('pointerup', event => {
      gallery.releasePointerCapture?.(event.pointerId);
      if (Math.abs(deltaX) > 50) show(deltaX > 0 ? current - 1 : current + 1);
      startX = 0;
      deltaX = 0;
    });

    gallery.addEventListener('pointercancel', () => {
      startX = 0;
      deltaX = 0;
    });

    show(0);
  }
})();
