/* ==========================================================================
   HEAVEN NATURALS — MODAL.JS
   Product detail drawer: desktop right-side drawer, mobile bottom sheet.
   ========================================================================== */

const HeavenModal = (() => {
  const drawer = document.getElementById("productDrawer");
  const overlay = document.getElementById("productOverlay");
  const content = document.getElementById("productDrawerContent");
  const closeBtn = document.getElementById("productClose");

  let currentQty = 1;
  let currentProduct = null;

  function open(id) {
    const product = window.HeavenProductsAPI?.getProductById(id);
    if (!product) return;
    currentProduct = product;
    currentQty = 1;
    render(product);

    drawer.classList.add("is-open");
    overlay.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function close() {
    drawer.classList.remove("is-open");
    overlay.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    if (!document.querySelector(".drawer.is-open")) document.body.style.overflow = "";
  }

  function render(p) {
    const currency = (window.HeavenSettings && window.HeavenSettings.currency) || "Rs.";
    const outOfStock = Number(p.stock) <= 0;
    const benefits = (p.benefits || [])
      .map((b) => `<li><i class="ph-fill ph-check-circle"></i> ${escapeHtml(b)}</li>`)
      .join("");

    content.innerHTML = `
      <div class="product-drawer__image">
        <img src="${p.image}" alt="${escapeHtml(p.name)}" width="480" height="480">
      </div>
      <div class="product-drawer__body">
        <span class="product-drawer__cat">${escapeHtml(window.HeavenProductsAPI?.categoryLabel(p.category) || p.category)}</span>
        <h2 class="product-drawer__title">${escapeHtml(p.name)}</h2>
        <div class="product-drawer__price">
          <strong>${HeavenCMS.formatPrice(p.price, currency)}</strong>
          ${p.oldPrice ? `<del>${HeavenCMS.formatPrice(p.oldPrice, currency)}</del>` : ""}
        </div>
        <p class="product-drawer__desc">${escapeHtml(p.description || p.shortDescription || "")}</p>

        <div class="product-drawer__meta">
          ${p.weight ? `<span><i class="ph ph-scales"></i> ${escapeHtml(p.weight)}</span>` : ""}
          <span><i class="ph ph-seal-check"></i> Halal Certified</span>
          ${outOfStock ? `<span><i class="ph ph-x-circle"></i> Out of stock</span>` : `<span><i class="ph ph-check-circle"></i> In stock</span>`}
        </div>

        ${
          benefits
            ? `<div class="product-drawer__benefits">
                <h4>Why you'll love it</h4>
                <ul>${benefits}</ul>
              </div>`
            : ""
        }

        <div class="product-drawer__actions">
          ${
            outOfStock
              ? `<button class="btn btn--outline btn--block" disabled>Currently Out of Stock</button>`
              : `<div class="qty-selector">
                  <button type="button" id="modalQtyMinus" aria-label="Decrease quantity"><i class="ph ph-minus"></i></button>
                  <span id="modalQtyValue">${currentQty}</span>
                  <button type="button" id="modalQtyPlus" aria-label="Increase quantity"><i class="ph ph-plus"></i></button>
                </div>
                <button class="btn btn--primary btn--block" id="modalAddToCart">
                  <i class="ph ph-shopping-bag"></i> Add to Cart
                </button>`
          }
        </div>
      </div>
    `;

    if (!outOfStock) {
      document.getElementById("modalQtyMinus").addEventListener("click", () => changeQty(-1));
      document.getElementById("modalQtyPlus").addEventListener("click", () => changeQty(1));
      document.getElementById("modalAddToCart").addEventListener("click", (e) => {
        e.currentTarget.classList.add("is-clicked");
        window.HeavenCart.add(currentProduct, currentQty);
        setTimeout(close, 350);
      });
    }
  }

 function changeQty(delta) {
  const maxQty = currentProduct ? Math.max(1, Number(currentProduct.stock) || 1) : 1;
  currentQty = Math.min(maxQty, Math.max(1, currentQty + delta));
  const valEl = document.getElementById("modalQtyValue");
  if (valEl) valEl.textContent = currentQty;
}
  function escapeHtml(str) {
    if (str === undefined || str === null) return "";
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  document.addEventListener("DOMContentLoaded", () => {
    closeBtn.addEventListener("click", close);
    overlay.addEventListener("click", close);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && drawer.classList.contains("is-open")) close();
    });
  });

  return { open, close };
})();

window.HeavenModal = HeavenModal;
