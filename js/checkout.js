/* ==========================================================================
   HEAVEN NATURALS — CHECKOUT.JS
   Checkout form -> formatted WhatsApp order message -> wa.me redirect.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const drawer = document.getElementById("checkoutDrawer");
  const overlay = document.getElementById("checkoutOverlay");
  const closeBtn = document.getElementById("checkoutClose");
  const checkoutBtn = document.getElementById("checkoutBtn");
  const form = document.getElementById("checkoutForm");
  const summaryEl = document.getElementById("checkoutSummary");

  function open() {
    if (!window.HeavenCart.getItems().length) return;
    renderSummary();
    HeavenCart.close();
    setTimeout(() => {
      drawer.classList.add("is-open");
      overlay.classList.add("is-open");
      drawer.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }, 200);
  }

  function close() {
    drawer.classList.remove("is-open");
    overlay.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    if (!document.querySelector(".drawer.is-open")) document.body.style.overflow = "";
  }

  function renderSummary() {
    const items = HeavenCart.getItems();
    const currency = (window.HeavenSettings && window.HeavenSettings.currency) || "Rs.";
    const lines = items.map((i) => `${i.name} × ${i.qty}`).join("\n");
    summaryEl.textContent = `${lines}\n\nSubtotal: ${HeavenCMS.formatPrice(HeavenCart.getTotal(), currency)}`;
  }

  function buildMessage(formData) {
    const items = HeavenCart.getItems();
    const currency = (window.HeavenSettings && window.HeavenSettings.currency) || "Rs.";
    const productLines = items.map((i) => `- ${i.name} x ${i.qty} (${HeavenCMS.formatPrice(i.price * i.qty, currency)})`).join("\n");

    return [
      "Assalamu Alaikum,",
      "",
      "I would like to place an order.",
      "",
      `Customer Name: ${formData.name}`,
      `Phone: ${formData.phone}`,
      `Address: ${formData.address}, ${formData.city}`,
      formData.notes ? `Order Notes: ${formData.notes}` : null,
      "",
      "Products:",
      productLines,
      "",
      `Total Amount: ${HeavenCMS.formatPrice(HeavenCart.getTotal(), currency)}`,
      "",
      "Thank you."
    ]
      .filter((line) => line !== null)
      .join("\n");
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const formData = {
      name: document.getElementById("checkoutName").value.trim(),
      phone: document.getElementById("checkoutPhone").value.trim(),
      address: document.getElementById("checkoutAddress").value.trim(),
      city: document.getElementById("checkoutCity").value.trim(),
      notes: document.getElementById("checkoutNotes").value.trim()
    };

    const message = buildMessage(formData);
    const number = (window.HeavenSettings && window.HeavenSettings.whatsappNumber) || "923001234567";
    window.open(`https://wa.me/${number}?text=${window.HeavenApp.waMessage(message)}`, "_blank", "noopener");

    HeavenCart.clear();
    form.reset();
    close();
    window.HeavenToast?.("Order sent — continue in WhatsApp");
  });

  checkoutBtn.addEventListener("click", open);
  closeBtn.addEventListener("click", close);
  overlay.addEventListener("click", close);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer.classList.contains("is-open")) close();
  });
});
