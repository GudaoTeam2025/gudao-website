(() => {
  "use strict";

  const IG_PROFILE_URL = "https://www.instagram.com/gudao.team/";
  const IG_MESSAGE_URL = "https://ig.me/m/gudao.team";
  const PRODUCTS_PER_PAGE = 15;

  const escapeHtml = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const safeImagePath = (value) => {
    const path = String(value ?? "").trim();
    return /^(images|assets)\/[a-zA-Z0-9_./-]+$/.test(path) ? path : "";
  };

  const safeUrl = (value, fallback = IG_PROFILE_URL) => {
    try {
      const url = new URL(String(value || fallback), window.location.href);
      return ["https:", "http:"].includes(url.protocol) ? url.href : fallback;
    } catch {
      return fallback;
    }
  };

  function createCard(item, type, itemIndex = 0) {
    const isProduct = type === "product";
    const image = safeImagePath(item.image);
    const action = isProduct
      ? `<button class="product-inquiry" type="button" data-product-index="${itemIndex}">複製植株資訊並私訊孤島 ↗</button>`
      : `<a href="${escapeHtml(safeUrl(item.link))}" target="_blank" rel="noopener noreferrer">前往 INSTAGRAM 查看更多 ↗</a>`;

    return `
      <article class="card">
        <div class="poster">
          ${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(item.name)}" loading="lazy" onerror="this.hidden=true; this.nextElementSibling.hidden=false;">` : ""}
          <div class="poster-fallback" ${image ? "hidden" : ""}>GUDAO</div>
          <span>${escapeHtml(isProduct ? item.status : item.date)}</span>
        </div>
        <div class="card-body">
          <small>${escapeHtml(item.code || "GUDAO EVENT")}</small>
          ${isProduct && item.category ? `<p class="product-category">${escapeHtml(item.category)}</p>` : ""}
          <h2>${escapeHtml(item.name)}</h2>
          <p>${escapeHtml(item.description)}</p>
          ${isProduct ? `<div class="meta"><i>${escapeHtml(item.size)}</i><b>${escapeHtml(item.price)}</b></div>` : ""}
          ${action}
        </div>
      </article>`;
  }

  function inquiryMessage(product) {
    return ["您好，我想詢問以下植株：", "", `品名：${product.name || "未提供"}`, `分類：${product.category || "未提供"}`, `編號：${product.code || "未提供"}`, `尺寸：${product.size || "請私訊確認"}`, `價格：${product.price || "DM for Price"}`, `狀態：${product.status || "未提供"}`, "", "請問這棵目前還可以購買嗎？"].join("\n");
  }

  async function copyText(text) {
    if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.cssText = "position:fixed;top:-9999px;left:-9999px";
    document.body.appendChild(area);
    area.select();
    const copied = document.execCommand("copy");
    area.remove();
    if (!copied) throw new Error("瀏覽器不支援自動複製");
  }

  function showCopyNotice(productName) {
    document.querySelector("#product-copy-notice")?.remove();
    const notice = document.createElement("div");
    notice.id = "product-copy-notice";
    notice.className = "product-copy-notice";
    notice.innerHTML = `<button class="copy-notice-backdrop" type="button" aria-label="關閉並前往 Instagram 私訊"></button><section class="copy-notice-card" role="dialog" aria-modal="true" aria-labelledby="copy-notice-title"><button class="copy-notice-close" type="button" aria-label="關閉並前往 Instagram 私訊">×</button><p class="copy-notice-label">GUDAO INQUIRY</p><h2 id="copy-notice-title">已複製植株資訊</h2><p class="copy-notice-product">${escapeHtml(productName)}</p><p class="copy-notice-description">植株資訊已複製。前往孤島 Instagram 聊天室後，請長按訊息輸入框並選擇「貼上」。</p><button class="copy-notice-confirm" type="button">前往 IG 私訊 ↗</button></section>`;
    document.body.appendChild(notice);
    document.body.classList.add("copy-notice-open");
    let closing = false;
    const close = () => {
      if (closing) return;
      closing = true;
      notice.classList.add("is-closing");
      setTimeout(() => {
        notice.remove();
        document.body.classList.remove("copy-notice-open");
        window.location.href = IG_MESSAGE_URL;
      }, 180);
    };
    notice.querySelectorAll(".copy-notice-backdrop,.copy-notice-close,.copy-notice-confirm").forEach((button) => button.addEventListener("click", close));
    notice.querySelector(".copy-notice-confirm")?.focus();
  }

  async function contactGudao(product, button) {
    const original = button.textContent;
    button.disabled = true;
    try {
      await copyText(inquiryMessage(product));
      button.textContent = "已複製";
      showCopyNotice(product.name);
    } catch (error) {
      console.error(error);
      button.textContent = "複製失敗，前往 IG";
      setTimeout(() => window.location.href = IG_MESSAGE_URL, 700);
    } finally {
      setTimeout(() => { button.textContent = original; button.disabled = false; }, 1800);
    }
  }

  const productGrid = document.querySelector("#product-grid");
  if (productGrid) {
    const products = Array.isArray(window.GUDAO_PRODUCTS) ? window.GUDAO_PRODUCTS : [];
    const filters = document.querySelector("#filters");
    const pagination = document.createElement("nav");
    pagination.className = "product-pagination";
    pagination.setAttribute("aria-label", "植株商品分頁");
    productGrid.insertAdjacentElement("afterend", pagination);
    let category = "全部";
    let page = 1;

    function filteredProducts() {
      return products.filter((item) => category === "全部" || item.category === category);
    }

    function renderPagination(total) {
      const pages = Math.ceil(total / PRODUCTS_PER_PAGE);
      if (pages <= 1) { pagination.hidden = true; pagination.innerHTML = ""; return; }
      pagination.hidden = false;
      const numbers = Array.from({length: pages}, (_, index) => index + 1).map((number) => `<button class="product-page-number ${number === page ? "active" : ""}" type="button" data-page="${number}" aria-current="${number === page ? "page" : "false"}">${number}</button>`).join("");
      pagination.innerHTML = `<button class="product-page-direction" type="button" data-page="${page - 1}" ${page === 1 ? "disabled" : ""}>‹ 上一頁</button><div class="product-page-numbers">${numbers}</div><button class="product-page-direction" type="button" data-page="${page + 1}" ${page === pages ? "disabled" : ""}>下一頁 ›</button>`;
    }

    function draw(scroll = false) {
      const all = filteredProducts();
      const pages = Math.max(1, Math.ceil(all.length / PRODUCTS_PER_PAGE));
      page = Math.min(Math.max(page, 1), pages);
      const current = all.slice((page - 1) * PRODUCTS_PER_PAGE, page * PRODUCTS_PER_PAGE);
      productGrid.innerHTML = current.length ? current.map((item, index) => createCard(item, "product", index)).join("") : `<div class="empty-state">此分類目前尚無植株</div>`;
      productGrid.querySelectorAll(".product-inquiry").forEach((button) => button.addEventListener("click", () => contactGudao(current[Number(button.dataset.productIndex)], button)));
      renderPagination(all.length);
      if (scroll) productGrid.scrollIntoView({behavior:"smooth", block:"start"});
    }

    filters?.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-f]");
      if (!button) return;
      filters.querySelectorAll("button[data-f]").forEach((item) => item.classList.toggle("active", item === button));
      category = button.dataset.f;
      page = 1;
      draw();
    });

    pagination.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-page]");
      if (!button || button.disabled) return;
      page = Number(button.dataset.page);
      draw(true);
    });
    draw();
  }

  const eventGrid = document.querySelector("#event-grid");
  if (eventGrid) {
    const events = Array.isArray(window.GUDAO_EVENTS) ? window.GUDAO_EVENTS : [];
    eventGrid.innerHTML = events.length ? events.map((item, index) => createCard(item, "event", index)).join("") : `<div class="empty-state">目前尚無活動</div>`;
  }
})();
