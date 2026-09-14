const IG = "https://www.instagram.com/gudao.team/";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function card(item, type) {
  const isProduct = type === "product";

  const badgeText = isProduct
    ? item.status
    : item.date;

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
        ${escapeHtml(item.image)}"
          loading="lazy"
          onerror="this.hidden=true"
        >

        <span>${escapeHtml(badgeText)}</span>
      </div>

      <div class="card-body">
        <small>${escapeHtml(item.code || "GUDAO EVENT")}</small>

        ${
          isProduct && item.category
            ? `<p class="product-category">${escapeHtml(item.category)}</p>`
            : ""
        }

        <h2>${escapeHtml(item.name)}</h2>
        <p>${escapeHtml(item.description)}</p>

        ${productMeta}

        ${IG}
          INSTAGRAM 私訊 ↗
        </a>
      </div>
    </article>
  `;
}

const productGrid 
