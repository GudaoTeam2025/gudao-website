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
          href="${escapeHtml(item_URL)}
          前往 INSTAGRAM 查看更多 ↗
        </a>
      `;

    const imageElement = image
      ? `
        <img
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

          <div
            class="poster-fallback"
            ${image ? "hidden" : ""}
          >
            GUDAO
          </div>

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
    if (
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === "function"
    ) {
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
    if (!product || !button) {
      return;
    }

    const originalText = button.textContent;

    button.disabled = true;

    try {
      await copyText(createInquiryMessage(product));

      button.textContent = "已複製";

      showCopyNotice(product.name);
    } catch (error) {
      console.error("複製植株資訊失敗：", error);

      button.textContent = "複製失敗，前往 IG";

      window.setTimeout(() => {
        openInstagramMessage();
      }, 700);
    } finally {
      window.setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
      }, 1800);
    }
  }

  function showCopyNotice(productName) {
    const oldNotice = document.querySelector("#product-copy-notice");

    if (oldNotice) {
      oldNotice.remove();
    }

    const notice = document.createElement("div");

    notice.id = "product-copy-notice";
    notice.className = "product-copy-notice";
    notice.setAttribute("role", "dialog");
    notice.setAttribute("aria-modal", "true");
    notice.setAttribute(
      "aria-labelledby",
      "copy-notice-title"
    );

    notice.innerHTML = `
      <button
        class="copy-notice-backdrop"
        type="button"
        aria-label="關閉並前往 Instagram 私訊"
      ></button>

      <section class="copy-notice-card">
        <button
          class="copy-notice-close"
          type="button"
          aria-label="關閉並前往 Instagram 私訊"
        >
          ×
        </button>

        <p class="copy-notice-label">
          GUDAO INQUIRY
        </p>

        <h2 id="copy-notice-title">
          已複製植株資訊
        </h2>

        <p class="copy-notice-product">
          ${escapeHtml(productName || "目前植株")}
        </p>

        <p class="copy-notice-description">
          植株資訊已複製。前往孤島 Instagram 聊天室後，
          請長按訊息輸入框並選擇「貼上」。
        </p>

        <button
          class="copy-notice-confirm"
          type="button"
        >
          前往 IG 私訊 ↗
        </button>
      </section>
    `;

    document.body.appendChild(notice);
    document.body.classList.add("copy-notice-open");

    const closeButton = notice.querySelector(
      ".copy-notice-close"
    );

    const confirmButton = notice.querySelector(
      ".copy-notice-confirm"
    );

    const backdrop = notice.querySelector(
      ".copy-notice-backdrop"
    );

    let isClosing = false;

    function closeAndOpenInstagram() {
      if (isClosing) {
        return;
      }

      isClosing = true;

      notice.classList.add("is-closing");

      window.setTimeout(() => {
        notice.remove();

        document.body.classList.remove(
          "copy-notice-open"
        );

        openInstagramMessage();
      }, 180);
    }

    closeButton?.addEventListener(
      "click",
      closeAndOpenInstagram
    );

    confirmButton?.addEventListener(
      "click",
      closeAndOpenInstagram
    );

    backdrop?.addEventListener(
      "click",
      closeAndOpenInstagram
    );

    confirmButton?.focus();
  }

  function openInstagramMessage() {
    window.location.href = IG_MESSAGE_URL;
  }

  const productGrid = document.querySelector(
    "#product-grid"
  );

  const eventGrid = document.querySelector(
    "#event-grid"
  );

  /*
    植株選購頁
  */
  if (productGrid) {
    const products = Array.isArray(
      window.GUDAO_PRODUCTS
    )
      ? window.GUDAO_PRODUCTS
      : [];

    const filters = document.querySelector(
      "#filters"
    );

    function drawProducts(category = "全部") {
      const filteredProducts = products.filter(
        (item) => {
          return (
            category === "全部" ||
            item.category === category
          );
        }
      );

      productGrid.innerHTML = filteredProducts.length
        ? filteredProducts
            .map((item, index) => {
              return createCard(
                item,
                "product",
                index
              );
            })
            .join("")
        : `
          <div class="empty-state">
            此分類目前尚無植株
          </div>
        `;

      productGrid
        .querySelectorAll(".product-inquiry")
        .forEach((button) => {
          button.addEventListener(
            "click",
            () => {
              const productIndex = Number(
                button.dataset.productIndex
              );

              const product =
                filteredProducts[productIndex];

              contactGudao(product, button);
            }
          );
        });
    }

    filters?.addEventListener(
      "click",
      (event) => {
        const button = event.target.closest(
          "button[data-f]"
        );

        if (!button) {
          return;
        }

        filters
          .querySelectorAll("button[data-f]")
          .forEach((filterButton) => {
            filterButton.classList.toggle(
              "active",
              filterButton === button
            );
          });

        drawProducts(button.dataset.f);
      }
    );

    drawProducts();
  }

  /*
    近期活動頁
  */
  if (eventGrid) {
    const events = Array.isArray(
      window.GUDAO_EVENTS
    )
      ? window.GUDAO_EVENTS
      : [];

    eventGrid.innerHTML = events.length
      ? events
          .map((item, index) => {
            return createCard(
              item,
              "event",
              index
            );
          })
          .join("")
      : `
        <div class="empty-state">
          目前尚無活動
        </div>
      `;
  }
})();
