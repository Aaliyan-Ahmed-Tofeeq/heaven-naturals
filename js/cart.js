/* ==========================================================================
   HEAVEN NATURALS — CART.JS
   LocalStorage-backed cart with drawer UI.
   ========================================================================== */

const HeavenCart = (() => {
  const STORAGE_KEY = "heaven_naturals_cart";
  let items = loadCart();

  const drawer = document.getElementById("cartDrawer");
  const overlay = document.getElementById("cartOverlay");
  const itemsEl = document.getElementById("cartItems");
  const emptyEl = document.getElementById("cartEmpty");
  const footerEl = document.getElementById("cartFooter");
  const totalEl = document.getElementById("cartTotal");
  const badgeEl = document.getElementById("cartBadge");

  function loadCart() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.warn("[HeavenCart] Could not read cart from storage:", err);
      return [];
    }
  }

  function saveCart() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.warn("[HeavenCart] Could not save cart to storage:", err);
    }
  }

  function add(product, qty = 1) {
    const existing = items.find((i) => i.id === product.id);
    if (existing) {
      existing.qty += qty;
    } else {
      items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        weight: product.weight,
        qty
      });
    }
    saveCart();
    render();
    pulseBadge();
    window.HeavenToast?.(`Added "${product.name}" to cart`);
  }

  function remove(id) {
    const el = itemsEl.querySelector(`[data-cart-id="${cssEscape(id)}"]`);
    if (el) {
      el.classList.add("is-removing");
      setTimeout(() => {
        items = items.filter((i) => i.id !== id);
        saveCart();
        render();
      }, 240);
    } else {
      items = items.filter((i) => i.id !== id);
      saveCart();
      render();
    }
  }

  function updateQty(id, delta) {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      remove(id);
      return;
    }
    saveCart();
    render();
  }

  function clear() {
    items = [];
    saveCart();
    render();
  }

  function getTotal() {
    return items.reduce((sum, i) => sum + i.price * i.qty, 0);
  }

  function getCount() {
    return items.reduce((sum, i) => sum + i.qty, 0);
  }

  function cssEscape(str) {
    return String(str).replace(/"/g, '\\"');
  }

  function render() {
    const count = getCount();
    if (count > 0) {
      badgeEl.hidden = false;
      badgeEl.textContent = count;
    } else {
      badgeEl.hidden = true;
    }

    if (!items.length) {
      emptyEl.style.display = "flex";
      itemsEl.style.display = "none";
      footerEl.hidden = true;
      itemsEl.innerHTML = "";
      return;
    }

    emptyEl.style.display = "none";
    itemsEl.style.display = "grid";
    footerEl.hidden = false;

    const currency = (window.HeavenSettings && window.HeavenSettings.currency) || "Rs.";

    itemsEl.innerHTML = items
      .map(
        (item) => `
        <li class="cart-item" data-cart-id="${item.id}">
          <div class="cart-item__image">
            <img src="${item.image}" alt="${item.name}" loading="lazy" width="72" height="72">
          </div>
          <div>
            <p class="cart-item__name">${item.name}</p>
            <p class="cart-item__price">${HeavenCMS.formatPrice(item.price, currency)}${item.weight ? ` · ${item.weight}` : ""}</p>
            <div class="cart-item__qty">
              <button type="button" data-qty="-1" aria-label="Decrease quantity"><i class="ph ph-minus"></i></button>
              <span>${item.qty}</span>
              <button type="button" data-qty="1" aria-label="Increase quantity"><i class="ph ph-plus"></i></button>
            </div>
          </div>
          <button type="button" class="cart-item__remove" aria-label="Remove ${item.name}"><i class="ph ph-trash"></i></button>
        </li>`
      )
      .join("");

    totalEl.textContent = HeavenCMS.formatPrice(getTotal(), currency);
  }

  function pulseBadge() {
    badgeEl.classList.remove("is-pulsing");
    void badgeEl.offsetWidth;
    badgeEl.classList.add("is-pulsing");
  }

  function open() {
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

  function initEvents() {
    document.getElementById("cartToggle").addEventListener("click", open);
    document.getElementById("cartClose").addEventListener("click", close);
    overlay.addEventListener("click", close);

    itemsEl.addEventListener("click", (e) => {
      const li = e.target.closest(".cart-item");
      if (!li) return;
      const id = li.getAttribute("data-cart-id");

      const qtyBtn = e.target.closest("[data-qty]");
      if (qtyBtn) {
        qtyBtn.classList.add("is-clicked");
        updateQty(id, Number(qtyBtn.getAttribute("data-qty")));
        return;
      }
      if (e.target.closest(".cart-item__remove")) {
        remove(id);
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && drawer.classList.contains("is-open")) close();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initEvents();
    render();
  });

  return { add, remove, updateQty, clear, getTotal, getCount, getItems: () => items, open, close };
})();

window.HeavenCart = HeavenCart;
