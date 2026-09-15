(() => {
  const IG_PROFILE_URL = "https://www.instagram.com/gudao.team/";
  const IG_MESSAGE_URL = "https://ig.me/m/gudao.team";

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

    return /^(images|assets)\/[a-zA-Z0-9_./-]+$/.test(path)
      ? path
      : "";
  }

  function createCard(item, type, itemIndex = 0) {
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

    const contactElement = isProduct
      ? `
        <button
          class="product-inquiry"
          type="button"
          data-product-index="${itemIndex}"
        >
          複製植株資訊並私訊孤島 ↗
        </button>
      `
      : `
        <a
          href="${escapeHtml(item.link || IG_PROFILE_URL)}"
          target="_blank"
          rel="noopener noreferrer"
        >
          前往INSTAGRAM 查看更多 ↗
        </a>
      `;

    const imageElement = image
      ? `
        <img
          src="${escapeHtml(image)}"
          alt="${escapeHtml(item.name)}"
          loading="lazy"
          onerror="this.hidden=true; this.nextElementSibling.hidden=false;"
        >
      `
      : "";

    return `
      <article class="card">
        <div class="poster">
          ${imageElement}
          <div class="poster-fallback" ${image ? "hidden" : ""}>GUDAO</div>
          <span>${escapeHtml(badge || "")}</span>
        </div>

        <div class="card-body">
          <small>${escapeHtml(item.code || "GUDAO EVENT")}</small>
          ${category}
          <h2>${escapeHtml(item.name)}</h2>
          <p>${escapeHtml(item.description)}</p>
          ${productMeta}
          ${contactElement}
        </div>
      </article>
    `;
  }

  function createInquiryMessage(product) {
    return [
      "您好，我想詢問以下植株：",
      "",
      `品名：${product.name || "未提供"}`,
      `分類：${product.category || "未提供"}`,
      `編號：${product.code || "未提供"}`,
      `尺寸：${product.size || "請私訊確認"}`,
      `價格：${product.price || "DM for Price"}`,
      `狀態：${product.status || "未提供"}`,
      "",
      "請問這棵目前還可以購買嗎？"
    ].join("\n");
  }

  async function copyText(text) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      await navigator.clipboard.writeText(text);
      return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "-9999px";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    const copied = document.execCommand("copy");
    textarea.remove();

    if (!copied) {
      throw new Error("瀏覽器不支援自動複製");
    }
  }

  async function contactGudao(product, button) {
    if (!product || !button) return;

    const originalText = button.textContent;
    button.disabled = true;

    try {
      await copyText(createInquiryMessage(product));
      button.textContent = "已複製，正在前往 IG";
    } catch (error) {
      console.error("複製商品資訊失敗：", error);
      button.textContent = "無法複製，前往 IG";
    }

    window.setTimeout(() => {
      window.location.href = IG_MESSAGE_URL;
      button.textContent = originalText;
      button.disabled = false;
    }, 500);
  }

  const productGrid = document.querySelector("#product-grid");
  const eventGrid = document.querySelector("#event-grid");

  if (productGrid) {
    const products = Array.isArray(window.GUDAO_PRODUCTS)
      ? window.GUDAO_PRODUCTS
      : [];
    const filters = document.querySelector("#filters");

    function drawProducts(category = "全部") {
      const filteredProducts = products.filter((item) => {
        return category === "全部" || item.category === category;
      });

      productGrid.innerHTML = filteredProducts.length
        ? filteredProducts
            .map((item, index) => createCard(item, "product", index))
            .join("")
        : `<div class="empty-state">此分類目前尚無植株</div>`;

      productGrid.querySelectorAll(".product-inquiry").forEach((button) => {
        button.addEventListener("click", () => {
          const productIndex = Number(button.dataset.productIndex);
          contactGudao(filteredProducts[productIndex], button);
        });
      });
    }

    filters?.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-f]");
      if (!button) return;

      filters.querySelectorAll("button[data-f]").forEach((filterButton) => {
        filterButton.classList.toggle("active", filterButton === button);
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
      ? events.map((item, index) => createCard(item, "event", index)).join("")
      : `<div class="empty-state">目前尚無活動</div>`;
  }
})();
