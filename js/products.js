/* ==========================================================================
   HEAVEN NATURALS — PRODUCTS.JS
   Loads products/categories/testimonials from CMS JSON and renders them.
   Handles category filtering.
   ========================================================================== */

let HeavenProducts = [];
let HeavenSettingsCache = null;

document.addEventListener("DOMContentLoaded", async () => {
  const [productsData, categoriesData, testimonialsData, faqsData, settings] = await Promise.all([
    HeavenCMS.load("products"),
    HeavenCMS.load("categories"),
    HeavenCMS.load("testimonials"),
    HeavenCMS.load("faqs"),
    HeavenCMS.load("settings")
  ]);

  HeavenProducts = productsData.products || [];
  HeavenSettingsCache = settings;

  renderCategories(categoriesData.categories || []);
  renderProducts(HeavenProducts);
  renderTestimonials(testimonialsData.testimonials || []);
  renderFAQs(faqsData.faqs || []);
  initFilterBar();
});

/* -------------------- Categories -------------------- */
function renderCategories(categories) {
  if (!categories.length) return; // keep static fallback markup already in HTML
  const grid = document.getElementById("categoryGrid");
  grid.innerHTML = categories
    .map(
      (cat, i) => `
      <a href="#products" class="category-card reveal-up ${i ? `reveal-delay-${Math.min(i, 3)}` : ""}" data-category="${cat.id}">
        <div class="category-card__image">
          <img src="${cat.image}" alt="${escapeHtml(cat.name)}" loading="lazy" width="400" height="480">
        </div>
        <div class="category-card__body">
          <h3>${escapeHtml(cat.name)}</h3>
          <p>${escapeHtml(cat.tagline || "")}</p>
        </div>
      </a>`
    )
    .join("");

  grid.querySelectorAll(".category-card").forEach((card) => {
    card.addEventListener("click", () => {
      const cat = card.getAttribute("data-category");
      setTimeout(() => {
        const chip = document.querySelector(`.filter-chip[data-filter="${cat}"]`);
        if (chip) chip.click();
      }, 300);
    });
  });

  window.HeavenApp?.observeNewReveals(grid);
}

/* -------------------- Products -------------------- */
function renderProducts(products, filter = "all") {
  const grid = document.getElementById("productGrid");
  const emptyEl = document.getElementById("productEmpty");
  const loadingEl = document.getElementById("productLoading");
  if (loadingEl) loadingEl.remove();

  const filtered = filter === "all" ? products : products.filter((p) => p.category === filter);

  if (!filtered.length) {
    grid.innerHTML = "";
    emptyEl.hidden = false;
    return;
  }
  emptyEl.hidden = true;

  grid.classList.add("is-filtering");
  const currency = (HeavenSettingsCache && HeavenSettingsCache.currency) || "Rs.";

  grid.innerHTML = filtered
    .map((p) => {
      const outOfStock = Number(p.stock) <= 0;
      const discount = p.oldPrice ? Math.round(100 - (p.price / p.oldPrice) * 100) : null;
      return `
      <article class="product-card" data-id="${p.id}">
        <div class="product-card__image-wrap" data-action="open-product" data-id="${p.id}">
          <span class="product-card__badge">${escapeHtml(categoryLabel(p.category))}</span>
          ${discount ? `<span class="product-card__discount">-${discount}%</span>` : ""}
          <img src="${p.image}" alt="${escapeHtml(p.name)}" loading="lazy" width="400" height="400">
        </div>
        <div class="product-card__body">
          <span class="product-card__cat">${escapeHtml(p.weight || "")}</span>
          <h3 class="product-card__name" data-action="open-product" data-id="${p.id}">${escapeHtml(p.name)}</h3>
          <p class="product-card__desc">${escapeHtml(p.shortDescription || "")}</p>
          <div class="product-card__footer">
            <div class="product-card__price">
              <strong>${HeavenCMS.formatPrice(p.price, currency)}</strong>
              ${p.oldPrice ? `<del>${HeavenCMS.formatPrice(p.oldPrice, currency)}</del>` : ""}
            </div>
            ${
              outOfStock
                ? `<span class="product-card__out">Out of stock</span>`
                : `<button class="product-card__add" data-action="quick-add" data-id="${p.id}" aria-label="Add ${escapeHtml(p.name)} to cart"><i class="ph ph-plus"></i></button>`
            }
          </div>
        </div>
      </article>`;
    })
    .join("");

  window.HeavenApp?.observeNewReveals(grid);
}

function categoryLabel(cat) {
  const map = { honey: "Honey", ghee: "Desi Ghee", dates: "Dates", islamic: "Islamic Decor", gifts: "Gift Collection" };
  return map[cat] || cat;
}

function initFilterBar() {
  const bar = document.getElementById("filterBar");
  bar.addEventListener("click", (e) => {
    const chip = e.target.closest(".filter-chip");
    if (!chip) return;
    bar.querySelectorAll(".filter-chip").forEach((c) => {
      c.classList.remove("is-active");
      c.setAttribute("aria-selected", "false");
    });
    chip.classList.add("is-active");
    chip.setAttribute("aria-selected", "true");
    renderProducts(HeavenProducts, chip.getAttribute("data-filter"));
    document.getElementById("products").scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

/* -------------------- Testimonials -------------------- */
function renderTestimonials(testimonials) {
  const grid = document.getElementById("testimonialGrid");
  if (!testimonials.length) {
    grid.closest(".section").style.display = "none";
    return;
  }
  grid.innerHTML = testimonials
    .map(
      (t, i) => `
      <div class="testimonial-card reveal-up ${i ? `reveal-delay-${Math.min(i, 3)}` : ""}">
        <div class="testimonial-card__stars">${"★".repeat(t.rating || 5)}</div>
        <p>"${escapeHtml(t.quote)}"</p>
        <div class="testimonial-card__author">
          <span class="testimonial-card__avatar">${escapeHtml((t.name || "?").charAt(0))}</span>
          <div>
            <strong>${escapeHtml(t.name)}</strong>
            <span>${escapeHtml(t.location || "")}</span>
          </div>
        </div>
      </div>`
    )
    .join("");
  window.HeavenApp?.observeNewReveals(grid);
}

/* -------------------- FAQs -------------------- */
function renderFAQs(faqs) {
  const list = document.getElementById("faqList");
  if (!list) return;
  if (!faqs.length) {
    list.closest(".section").style.display = "none";
    return;
  }
  list.innerHTML = faqs
    .map(
      (f, i) => `
      <div class="faq-item reveal-up ${i ? `reveal-delay-${Math.min(i, 3)}` : ""}">
        <button type="button" class="faq-item__question" aria-expanded="false">
          <span>${escapeHtml(f.question)}</span>
          <i class="ph ph-plus"></i>
        </button>
        <div class="faq-item__answer">
          <div class="faq-item__answer-inner">
            <p>${escapeHtml(f.answer)}</p>
          </div>
        </div>
      </div>`
    )
    .join("");
  window.HeavenApp?.observeNewReveals(list);
}

document.addEventListener("click", (e) => {
  const question = e.target.closest(".faq-item__question");
  if (!question) return;
  const item = question.closest(".faq-item");
  const isOpen = item.classList.contains("is-open");
  item.classList.toggle("is-open", !isOpen);
  question.setAttribute("aria-expanded", String(!isOpen));
});

/* -------------------- Helpers -------------------- */
function escapeHtml(str) {
  if (str === undefined || str === null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getProductById(id) {
  return HeavenProducts.find((p) => p.id === id);
}

window.HeavenProductsAPI = { getProductById, categoryLabel };

/* -------------------- Delegated clicks: open product / quick add -------------------- */
document.addEventListener("click", (e) => {
  const openBtn = e.target.closest('[data-action="open-product"]');
  if (openBtn && window.HeavenModal) {
    window.HeavenModal.open(openBtn.getAttribute("data-id"));
    return;
  }
  const addBtn = e.target.closest('[data-action="quick-add"]');
  if (addBtn && window.HeavenCart) {
    addBtn.classList.add("is-clicked");
    setTimeout(() => addBtn.classList.remove("is-clicked"), 300);
    const product = getProductById(addBtn.getAttribute("data-id"));
    if (product) window.HeavenCart.add(product, 1);
  }
});
