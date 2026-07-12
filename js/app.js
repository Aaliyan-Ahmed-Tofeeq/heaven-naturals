/* ==========================================================================
   HEAVEN NATURALS — APP.JS
   Navbar behavior, mobile menu, scroll reveal, WhatsApp link wiring,
   contact form, footer year, smooth nav active state.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("year").textContent = new Date().getFullYear();

  const [settings, homepage] = await Promise.all([
    HeavenCMS.load("settings"),
    HeavenCMS.load("homepage")
  ]);
  window.HeavenSettings = settings;

  wireWhatsappLinks(settings);
  wireSettingsContent(settings);
  wireHomepageContent(homepage);
  initNavbarScroll();
  initMobileMenu();
  initScrollReveal();
  initNavActiveState();
  initContactForm(settings);
});

function waMessage(text) {
  return encodeURIComponent(text);
}

function setTextIfPresent(id, value) {
  if (!value) return;
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

/* -------------------- Homepage hero/about content -------------------- */
function wireHomepageContent(homepage) {
  if (!homepage) return;
  setTextIfPresent("heroBadgeText", homepage.heroBadge);
  setTextIfPresent("heroTitleMain", homepage.heroTitle);
  setTextIfPresent("heroTitleAccent", homepage.heroSubtitle);
  setTextIfPresent("heroDescText", homepage.heroDescription);
  setTextIfPresent("aboutTextMain", homepage.aboutText);
}

/* -------------------- Settings-driven contact & social links -------------------- */
function wireSettingsContent(settings) {
  if (!settings) return;

  const email = document.getElementById("contactEmailLink");
  if (email && settings.email) {
    email.textContent = settings.email;
    email.setAttribute("href", `mailto:${settings.email}`);
  }

  setTextIfPresent("contactAddressText", settings.address);

  const instagram = document.getElementById("instagramLink");
  if (instagram && settings.instagram) instagram.setAttribute("href", settings.instagram);

  const facebook = document.getElementById("facebookLink");
  if (facebook && settings.facebook) facebook.setAttribute("href", settings.facebook);
}

function wireWhatsappLinks(settings) {
  const number = (settings && settings.whatsappNumber) || "923001234567";
  const defaultMsg = "Assalamu Alaikum, I'm interested in Heaven Naturals products.";
  const url = `https://wa.me/${number}?text=${waMessage(defaultMsg)}`;

  ["whatsappNavBtn", "whatsappMobileBtn", "whatsappHeroBtn", "whatsappFooterBtn", "whatsappContactLink"]
    .forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.setAttribute("href", url);
    });
}

/* -------------------- Navbar scroll state -------------------- */
function initNavbarScroll() {
  const navbar = document.getElementById("navbar");
  const onScroll = () => {
    if (window.scrollY > 24) {
      navbar.classList.add("is-scrolled");
    } else {
      navbar.classList.remove("is-scrolled");
    }
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

/* -------------------- Mobile menu -------------------- */
function initMobileMenu() {
  const menuToggle = document.getElementById("menuToggle");
  const mobileMenu = document.getElementById("mobileMenu");
  const overlay = document.getElementById("mobileMenuOverlay");

  const open = () => {
    mobileMenu.classList.add("is-open");
    overlay.classList.add("is-open");
    mobileMenu.setAttribute("aria-hidden", "false");
    menuToggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  };
  const close = () => {
    mobileMenu.classList.remove("is-open");
    overlay.classList.remove("is-open");
    mobileMenu.setAttribute("aria-hidden", "true");
    menuToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  };

  menuToggle.addEventListener("click", () => {
    mobileMenu.classList.contains("is-open") ? close() : open();
  });
  overlay.addEventListener("click", close);
  mobileMenu.querySelectorAll(".mobile-menu__link").forEach((link) => {
    link.addEventListener("click", close);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

/* -------------------- Scroll reveal (Intersection Observer) -------------------- */
function initScrollReveal() {
  const targets = document.querySelectorAll(".reveal-up");
  if (!("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  targets.forEach((el) => observer.observe(el));
}

/* Re-observe elements injected dynamically after initial load */
function observeNewReveals(container) {
  if (!("IntersectionObserver" in window)) return;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  container.querySelectorAll(".reveal-up:not(.is-visible)").forEach((el) => {
    el.classList.add("is-visible"); // dynamically injected cards animate in immediately via popIn
    observer.observe(el);
  });
}

/* -------------------- Nav active state on scroll -------------------- */
function initNavActiveState() {
  const sections = ["home", "products", "about", "contact"];
  const links = document.querySelectorAll(".navbar__link");
  if (!("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          links.forEach((link) => {
            link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
          });
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );

  sections.forEach((id) => {
    const section = document.getElementById(id);
    if (section) observer.observe(section);
  });
}

/* -------------------- Footer category filter links -------------------- */
document.addEventListener("click", (e) => {
  const link = e.target.closest("[data-filter-link]");
  if (!link) return;
  const filter = link.getAttribute("data-filter-link");
  const chip = document.querySelector(`.filter-chip[data-filter="${filter}"]`);
  if (chip) chip.click();
});

/* -------------------- Contact form -> WhatsApp -------------------- */
function initContactForm(settings) {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const name = document.getElementById("contactName").value.trim();
    const phone = document.getElementById("contactPhone").value.trim();
    const message = document.getElementById("contactMessage").value.trim();

    const text = `Assalamu Alaikum,\n\nMy name is ${name} (${phone}).\n\n${message}`;
    const number = (settings && settings.whatsappNumber) || "923001234567";
    window.open(`https://wa.me/${number}?text=${waMessage(text)}`, "_blank", "noopener");
    form.reset();
    if (window.HeavenToast) window.HeavenToast("Message ready — continue in WhatsApp");
  });
}

/* -------------------- Toast -------------------- */
window.HeavenToast = (function initToast() {
  const toast = document.getElementById("toast");
  const msgEl = document.getElementById("toastMessage");
  let timer = null;
  return function show(message) {
    msgEl.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(timer);
    timer = setTimeout(() => toast.classList.remove("is-visible"), 2400);
  };
})();

window.HeavenApp = { observeNewReveals, waMessage };
