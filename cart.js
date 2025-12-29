// ==========================
// KONFIGURASI
// ==========================
const CART_KEY = "rumahkue_cart";
// GANTI nomor WA di bawah ini (tanpa 0 di depan, tanpa +62)
// Contoh: 6281234567890
const WA_NUMBER = "6281234567890";

// ==========================
// FUNGSI UTIL
// ==========================
function getCart() {
  const raw = localStorage.getItem(CART_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (e) {
    console.error("Gagal parse cart dari localStorage", e);
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function formatRupiah(angka) {
  if (typeof angka !== "number") {
    angka = Number(String(angka).replace(/[^\d]/g, "")) || 0;
  }
  return "Rp " + angka.toLocaleString("id-ID");
}

/**
 * Update badge jumlah item di navbar (span#cart-count)
 */
function updateCartCount() {
  const el = document.getElementById("cart-count");
  if (!el) return;
  const cart = getCart();
  const totalQty = cart.reduce((sum, item) => sum + (item.qty || 0), 0);
  el.textContent = totalQty;
}

// ==========================
// FUNGSI KERANJANG
// ==========================

/**
 * Tambah ke keranjang.
 * Bisa dipanggil dari:
 * - produk.js (dinamis)
 * - tombol statis (attachStaticProductButtons)
 */
function addToCart(id, name, price, imageUrl) {
  if (!name) return;

  // Normalisasi id: kalau tidak ada, pakai nama
  const finalId = id || name.toLowerCase().replace(/\s+/g, "-");

  const cart = getCart();
  const existing = cart.find((item) => item.id === finalId);

  const numericPrice = Number(String(price).replace(/[^\d]/g, "")) || 0;

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: finalId,
      name: name,
      price: numericPrice,
      qty: 1,
      image_url: imageUrl || ""
    });
  }

  saveCart(cart);
  updateCartCount();

  try {
    alert(name + " ditambahkan ke keranjang.");
  } catch (e) {
    console.log(name + " ditambahkan ke keranjang.");
  }
}

function removeFromCart(id) {
  const cart = getCart().filter((item) => item.id !== id);
  saveCart(cart);
  renderCart();
  updateCartCount();
}

function changeQty(id, delta) {
  const cart = getCart();
  const item = cart.find((x) => x.id === id);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    const filtered = cart.filter((x) => x.id !== id);
    saveCart(filtered);
  } else {
    saveCart(cart);
  }
  renderCart();
  updateCartCount();
}

// ==========================
// RENDER TABEL DI cart.html
// ==========================
function renderCart() {
  const tbody = document.getElementById("cart-body");
  const totalEl = document.getElementById("cart-total");
  const emptyEl = document.getElementById("cart-empty");
  const wrapper = document.getElementById("cart-table-wrapper");

  // Kalau elemen-elemen ini nggak ada -> berarti bukan di cart.html
  if (!tbody || !totalEl || !emptyEl || !wrapper) return;

  const cart = getCart();

  tbody.innerHTML = "";

  if (!cart.length) {
    emptyEl.style.display = "block";
    wrapper.style.display = "none";
    totalEl.textContent = formatRupiah(0);
    return;
  }

  emptyEl.style.display = "none";
  wrapper.style.display = "block";

  let grandTotal = 0;

  cart.forEach((item) => {
    const subtotal = (item.price || 0) * (item.qty || 0);
    grandTotal += subtotal;

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${item.name || "-"}</td>
      <td>${formatRupiah(item.price || 0)}</td>
      <td>
        <button class="qty-btn" onclick="changeQty('${item.id}', -1)">-</button>
        <span class="qty-value">${item.qty || 0}</span>
        <button class="qty-btn" onclick="changeQty('${item.id}', 1)">+</button>
      </td>
      <td>${formatRupiah(subtotal)}</td>
      <td><button class="cart-remove" onclick="removeFromCart('${item.id}')">Hapus</button></td>
    `;

    tbody.appendChild(tr);
  });

  totalEl.textContent = formatRupiah(grandTotal);
}

// ==========================
// WHATSAPP CHECKOUT
// ==========================
function goToWhatsApp() {
  const cart = getCart();
  if (!cart.length) {
    alert("Keranjang masih kosong.");
    return;
  }

  let message = "Halo, saya mau pesan kue dari RumahKueNuraisah:%0A%0A";
  let grandTotal = 0;

  cart.forEach((item, index) => {
    const subtotal = (item.price || 0) * (item.qty || 0);
    grandTotal += subtotal;
    message += `${index + 1}. ${item.name} x${item.qty} = ${formatRupiah(subtotal)}%0A`;
  });

  message += `%0ATotal: ${formatRupiah(grandTotal)}%0A`;
  message += `%0ANama:%0AAlamat lengkap:%0AMetode pembayaran (Cash / Transfer):%0ACatatan tambahan:%0A`;

  const url = `https://wa.me/${WA_NUMBER}?text=${message}`;
  window.open(url, "_blank");
}

// ==========================
// HOOK TOMBOL DI HALAMAN
// ==========================
function attachStaticProductButtons() {
  // ====== 1) TOMBOL DI KARTU PRODUK (index, kue, dll) ======
  const buttons = document.querySelectorAll(".product-card .btn-round");

  buttons.forEach((btn, index) => {
    btn.addEventListener("click", function () {
      const card = btn.closest(".product-card");
      if (!card) return;

      const nameEl = card.querySelector(".product-name");
      const priceEl =
        card.querySelector(".product-price-new") ||
        card.querySelector(".product-price");

      const name = nameEl ? nameEl.textContent.trim() : "Produk " + (index + 1);
      const rawPrice = priceEl ? priceEl.textContent : "0";
      const priceNum = Number(String(rawPrice).replace(/[^\d]/g, "")) || 0;

      // ID unik = nama + index (biar tidak tabrakan)
      const id = name.toLowerCase().replace(/\s+/g, "-") + "-" + index;

      addToCart(id, name, priceNum, "");
    });
  });

  // ====== 2) TOMBOL DI HALAMAN DETAIL PRODUK ======
  const detailBtn = document.querySelector(".detail-layout .btn-round");
  if (detailBtn) {
    detailBtn.addEventListener("click", function () {
      const titleEl = document.querySelector(".detail-title");
      const priceEl = document.querySelector(".detail-price");
      const imgEl = document.querySelector(".detail-image-big img");

      const name = titleEl ? titleEl.textContent.trim() : "Produk";
      const rawPrice = priceEl ? priceEl.textContent : "0";
      const priceNum = Number(String(rawPrice).replace(/[^\d]/g, "")) || 0;
      const imageUrl = imgEl ? imgEl.getAttribute("src") : "";

      // ID unik khusus halaman detail
      const id = name.toLowerCase().replace(/\s+/g, "-") + "-detail";

      addToCart(id, name, priceNum, imageUrl);
    });
  }
}

// ==========================
// INISIALISASI SAAT HALAMAN LOAD
// ==========================
document.addEventListener("DOMContentLoaded", function () {
  // Update badge di navbar
  updateCartCount();

  // Aktifkan tombol + di kartu statis & halaman detail
  attachStaticProductButtons();

  // Render cart kalau lagi di cart.html
  renderCart();

  // Tombol WA di cart.html
  const waBtn = document.getElementById("btn-wa-checkout");
  if (waBtn) {
    waBtn.addEventListener("click", function (e) {
      e.preventDefault();
      goToWhatsApp();
    });
  }
});
