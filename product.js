const API_BASE = "https://rumah-kue-api.mrzkyfh.workers.dev"; // sesuaikan

async function loadProdukGrid() {
  const grid = document.getElementById("produk-grid");
  if (!grid) return;

  grid.innerHTML = "Memuat produk...";

  try {
    const res = await fetch(API_BASE + "/api/products");
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      grid.innerHTML = "Belum ada produk.";
      return;
    }

    grid.innerHTML = data.map(p => `
      <article class="produk-card">
        <img src="${p.image_url}" alt="${p.name}">
        <div class="produk-card-title">${p.name}</div>
        <div class="produk-card-price">
          Rp ${Number(p.price).toLocaleString("id-ID")}
        </div>
        <button class="produk-card-btn"
          onclick="addToCart(${p.id}, '${p.name.replace(/'/g, "\\'")}', ${p.price}, '${p.image_url}')">
          Tambah ke Keranjang
        </button>
      </article>
    `).join("");
  } catch (err) {
    console.error(err);
    grid.innerHTML = "Gagal memuat produk.";
  }
}

document.addEventListener("DOMContentLoaded", loadProdukGrid);
