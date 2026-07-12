/* ==========================================================================
   HEAVEN NATURALS — CMS DATA LOADER
   Fetches JSON content edited via Decap CMS from /content/*.json.
   Falls back to bundled defaults if fetch fails (e.g. opened via file://).
   ========================================================================== */

const HeavenCMS = (() => {
  const cache = {};

  // Minimal fallback so the site still renders if /content/*.json can't be fetched
  const FALLBACK = {
    settings: {
      whatsappNumber: "923001234567",
      email: "hello@heavennaturals.com",
      address: "Lahore, Pakistan",
      instagram: "#",
      facebook: "#",
      currency: "Rs."
    },
    homepage: {
      heroBadge: "100% Natural & Authentic",
      heroTitle: "Heaven Naturals",
      heroSubtitle: "Pure Goodness, Naturally Delivered",
      heroDescription: "Premium honey, desi ghee, dates and Islamic essentials crafted with quality and trust — for the home you cherish.",
      aboutText: "Heaven Naturals began with a simple belief — that what we bring into our homes should be pure, honest and worthy of our families. From raw honey harvested with patience to ghee churned the traditional way, every product is a quiet promise: nothing hidden, nothing rushed."
    },
    products: { products: [] },
    categories: { categories: [] },
    testimonials: { testimonials: [] },
    faqs: { faqs: [] }
  };

  async function load(name) {
    if (cache[name]) return cache[name];
    try {
      const res = await fetch(`content/${name}.json`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to load ${name}.json`);
      const data = await res.json();
      cache[name] = data;
      return data;
    } catch (err) {
      console.warn(`[HeavenCMS] Falling back to default data for "${name}":`, err.message);
      cache[name] = FALLBACK[name] || {};
      return cache[name];
    }
  }

  function formatPrice(amount, currency) {
    const cur = currency || (cache.settings && cache.settings.currency) || "Rs.";
    return `${cur} ${Number(amount).toLocaleString("en-PK")}`;
  }

  return { load, formatPrice };
})();
