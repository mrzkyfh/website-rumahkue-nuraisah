(function () {
  const config = window.RUMAHKUE_CONFIG || {};

  function hasSupabaseConfig() {
    return Boolean(config.supabaseUrl && config.supabaseAnonKey);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeJsString(value) {
    return String(value ?? "")
      .replace(/\\/g, "\\\\")
      .replace(/'/g, "\\'")
      .replace(/\r/g, "\\r")
      .replace(/\n/g, "\\n");
  }

  function formatRupiah(value) {
    const numericValue = Number(value) || 0;
    return "Rp " + numericValue.toLocaleString("id-ID");
  }

  function toNumber(value) {
    if (value === null || value === undefined || value === "") return 0;
    return Number(value) || 0;
  }

  function normalizeProduct(rawProduct) {
    return {
      id: rawProduct.id,
      name: rawProduct.name || "Tanpa nama",
      slug: rawProduct.slug || "",
      category: rawProduct.category || "",
      short_description:
        rawProduct.short_description ||
        rawProduct.description ||
        rawProduct.size ||
        "",
      description: rawProduct.description || "",
      price: toNumber(rawProduct.price),
      old_price: toNumber(rawProduct.old_price),
      image_url: rawProduct.image_url || "",
      detail_url: rawProduct.detail_url || "",
      is_active:
        typeof rawProduct.is_active === "boolean" ? rawProduct.is_active : true,
      is_featured: Boolean(rawProduct.is_featured),
      sort_order: Number.isFinite(Number(rawProduct.sort_order))
        ? Number(rawProduct.sort_order)
        : 9999,
      created_at: rawProduct.created_at || ""
    };
  }

  function sortProducts(products) {
    return [...products].sort((left, right) => {
      if (left.sort_order !== right.sort_order) {
        return left.sort_order - right.sort_order;
      }
      return left.name.localeCompare(right.name, "id");
    });
  }

  async function fetchProductsFromSupabase(category = "") {
    const baseUrl = String(config.supabaseUrl || "").replace(/\/$/, "");
    const table = config.supabaseProductsTable || "products";
    const params = {
      select:
        "id,name,slug,category,short_description,description,price,old_price,image_url,detail_url,is_active,is_featured,sort_order,created_at",
      is_active: "eq.true"
    };

    if (category) {
      params.category = `eq.${category}`;
    }

    const query = new URLSearchParams(params);

    const response = await fetch(
      baseUrl + "/rest/v1/" + table + "?" + query.toString(),
      {
        headers: {
          apikey: config.supabaseAnonKey,
          Authorization: "Bearer " + config.supabaseAnonKey
        }
      }
    );

    if (!response.ok) {
      throw new Error("Supabase request gagal: " + response.status);
    }

    const data = await response.json();
    return Array.isArray(data) ? data.map(normalizeProduct) : [];
  }

  async function fetchProductsFromLegacyApi(category = "") {
    const legacyBase = String(config.legacyProductsApiBase || "").replace(/\/$/, "");
    if (!legacyBase) return [];

    const url = category 
      ? `${legacyBase}/api/products?category=${encodeURIComponent(category)}`
      : `${legacyBase}/api/products`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Legacy API request gagal: " + response.status);
    }

    const data = await response.json();
    return Array.isArray(data) ? data.map(normalizeProduct) : [];
  }

  async function loadProducts(options = {}) {
    const { featuredOnly = false, category = "", limit = 0 } = options;
    const products = hasSupabaseConfig()
      ? await fetchProductsFromSupabase(category)
      : await fetchProductsFromLegacyApi(category);

    const sortedProducts = sortProducts(products);
    const featuredProducts = sortedProducts.filter((product) => product.is_featured);
    const selectedProducts = featuredOnly
      ? featuredProducts.length
        ? featuredProducts
        : sortedProducts
      : sortedProducts;

    return limit > 0 ? selectedProducts.slice(0, limit) : selectedProducts;
  }

  window.RumahKueProducts = {
    config,
    hasSupabaseConfig,
    loadProducts,
    normalizeProduct,
    formatRupiah,
    escapeHtml,
    escapeJsString
  };
})();
