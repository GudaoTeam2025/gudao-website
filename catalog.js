(() => {
  const IG_URL = "https://www.instagram.com/gudao.team/";

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function safeImagePath(value) {
    const path = String(value ?? "").trim();
    return /^(images|assets)\/[a-zA-Z0-9_./-]+$/.test(path) ? path : "";
  }

  function createCard(item, type) {
    const isProduct = type === "product";
    const image = safeImagePath(item.image);
    const badge = isProduct ? item.status : item.date;

    const category = isProduct && item.category
      ? `<p class="product-category">${escapeHtml(item.category)}</p>`
      : "";

    const productMeta = isProduct
      ? `
        <div class="meta">
          <i>${escapeHtml(item.size)}</i>
          <b>${escapeHtml(item.price)}</b>
        </div>
      `
      : "";

    return `
      <article class="card">
        <div class="poster">
          ${image ? `
            <img
              src="${escapeHtml(image)}"
              alt="${escapeHtml(item.name)}"
              loading="lazy"
              onerror="this.hidden=true; this.nextElementSibling.hidden=false;"
            >
          ` : ""}
          <div class="poster-fallback" ${image ? "hidden" : ""}>GUDAO</div>
          <span>${escapeHtml(badge || "")}</span>
        </div>

        <div class="card-body">
          <small>${escapeHtml(item.code || "GUDAO EVENT")}</small>
          ${category}
          <h2>${escapeHtml(item.name)}</h2>
          <p>${escapeHtml(item.description)}</p>
          ${productMeta}
          <a href="${IG_URL}" target="_blank" rel="noopener noreferrer">
            INSTAGRAM 私訊 ↗
          </a>
        </div>
      </article>
    `;
  }

  const productGrid = document.querySelector("#product-grid");
  const eventGrid = document.querySelector("#event-grid");

  if (productGrid) {
    const products = Array.isArray(window.GUDAO_PRODUCTS)
      ? window.GUDAO_PRODUCTS
      : [];
    const filters = document.querySelector("#filters");

    function drawProducts(category = "全部") {
      const filtered = products.filter((item) => {
        return category === "全部" || item.category === category;
      });

      productGrid.innerHTML = filtered.length
        ? filtered.map((item) => createCard(item, "product")).join("")
        : `<div class="empty-state">此分類目前尚無植株</div>`;
    }

    filters?.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-f]");
      if (!button) return;

      filters.querySelectorAll("button[data-f]").forEach((item) => {
        item.classList.toggle("active", item === button);
      });

      drawProducts(button.dataset.f);
    });

    drawProducts();
  }

  if (eventGrid) {
    const events = Array.isArray(window.GUDAO_EVENTS)
      ? window.GUDAO_EVENTS
      : [];

    eventGrid.innerHTML = events.length
      ? events.map((item) => createCard(item, "event")).join("")
      : `<div class="empty-state">目前尚無活動</div>`;
  }
})();
