async function loadAllProductsGrid() {
  const grid = document.getElementById("all-products-grid");
  if (!grid || !window.RumahKueProducts) return;

  grid.innerHTML = '<div class="product-empty-state">Memuat produk...</div>';

  try {
    const products = await window.RumahKueProducts.loadProducts();

    if (!products.length) {
      grid.innerHTML =
        '<div class="product-empty-state">Belum ada produk aktif yang bisa ditampilkan.</div>';
      return;
    }

    const { escapeHtml, formatRupiah } = window.RumahKueProducts;

    grid.innerHTML = products
      .map((product) => {
        const safeName = escapeHtml(product.name);
        const safeDescription = escapeHtml(
          product.short_description || product.category || "Kue fresh buatan rumahan"
        );
        const safeImage = escapeHtml(
          product.image_url || "images/Gemini_Generated_Image_t0txz3t0txz3t0tx.png"
        );
        const safeDetailUrl = escapeHtml(`/detail.html?slug=${product.slug}`);

        return `
          <article class="product-grid-card">
            <a class="product-grid-link" href="${safeDetailUrl}">
              <div class="product-grid-image">
                <img src="${safeImage}" alt="${safeName}" />
              </div>
            </a>
            <div class="product-grid-name">${safeName}</div>
            <div class="product-grid-size">${safeDescription}</div>
            <div class="product-grid-price">${formatRupiah(product.price)}</div>
            <div class="product-grid-actions">
              <a class="product-grid-link-btn" href="${safeDetailUrl}">Lihat detail</a>
              <button
                class="product-grid-btn"
                type="button"
                data-product-id="${escapeHtml(product.id)}"
                data-product-name="${safeName}"
                data-product-price="${escapeHtml(product.price)}"
                data-product-image="${safeImage}">
                Tambah
              </button>
            </div>
          </article>
        `;
      })
      .join("");

    grid.querySelectorAll(".product-grid-btn").forEach((button) => {
      button.addEventListener("click", () => {
        addToCart(
          button.dataset.productId,
          button.dataset.productName,
          Number(button.dataset.productPrice || 0),
          button.dataset.productImage
        );
      });
    });
  } catch (error) {
    console.error(error);
    grid.innerHTML =
      '<div class="product-empty-state">Gagal memuat produk. Cek config Supabase atau API lama.</div>';
  }
}

document.addEventListener("DOMContentLoaded", loadAllProductsGrid);
