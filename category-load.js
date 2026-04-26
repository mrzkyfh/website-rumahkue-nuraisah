async function loadCategoryProducts() {
  const grid = document.getElementById("category-product-grid");
  const categoryName = window.CAT_NAME;
  
  if (!grid || !categoryName || !window.RumahKueProducts) {
    console.warn("Grid, Category Name, or RumahKueProducts missing.");
    return;
  }

  grid.innerHTML = '<div class="product-empty-state">Memuat produk ' + categoryName + '...</div>';

  try {
    const products = await window.RumahKueProducts.loadProducts({
      category: categoryName
    });

    if (!products.length) {
      grid.innerHTML =
        '<div class="product-empty-state">Belum ada produk di kategori ini.</div>';
      return;
    }

    const { escapeHtml, formatRupiah } = window.RumahKueProducts;

    grid.innerHTML = products
      .map((product) => {
        const safeName = escapeHtml(product.name);
        const safeDescription = escapeHtml(
          product.short_description || product.category || "Kue fresh"
        );
        const safeImage = escapeHtml(
          product.image_url || "../images/Gemini_Generated_Image_t0txz3t0txz3t0tx.png"
        );
        const safeDetailUrl = escapeHtml(`/detail.html?slug=${product.slug}`);

        return `
          <article class="product-card">
            <a href="${safeDetailUrl}">
              <div class="product-image">
                <img src="${safeImage}" alt="${safeName}" />
              </div>
            </a>
            <div class="product-info">
              <div class="product-name">${safeName}</div>
              <div class="product-size">${safeDescription}</div>
              <div class="product-price">${formatRupiah(product.price)}</div>
            </div>
            <div class="product-action">
              <button
                class="btn-round add-to-cart-btn"
                type="button"
                data-product-id="${escapeHtml(product.id)}"
                data-product-name="${safeName}"
                data-product-price="${escapeHtml(product.price)}"
                data-product-image="${safeImage}">
                +
              </button>
            </div>
          </article>
        `;
      })
      .join("");

    grid.querySelectorAll(".add-to-cart-btn").forEach((button) => {
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
      '<div class="product-empty-state">Gagal memuat produk.</div>';
  }
}

document.addEventListener("DOMContentLoaded", loadCategoryProducts);
