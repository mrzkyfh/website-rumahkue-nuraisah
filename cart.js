// ----- UTILITAS KERANJANG -----
const CART_KEY = "rumahkue_cart";

function getCart() {
  const raw = localStorage.getItem(CART_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function formatRupiah(value) {
  return "Rp " + Number(value).toLocaleString("id-ID");
}

// ----- BADGE JUMLAH DI ICON -----
function updateCartCount() {
  const cart = getCart();
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  const el = document.getElementById("cart-count");
  if (el) el.textContent = totalQty;
}

// ----- TAMBAH KE KERANJANG -----
function addToCart(id, name, price) {
  let cart = getCart();
  const index = cart.findIndex((item) => item.id === id);

  if (index !== -1) {
    cart[index].qty += 1;
  } else {
    cart.push({ id, name, price, qty: 1 });
  }

  saveCart(cart);
  updateCartCount();
  alert(name + " ditambahkan ke keranjang.");
}

// ----- UBAH QTY / HAPUS -----
function changeQty(id, delta) {
  let cart = getCart();
  const index = cart.findIndex((item) => item.id === id);
  if (index === -1) return;

  cart[index].qty += delta;
  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
  }
  saveCart(cart);
  renderCart();
  updateCartCount();
}

function removeFromCart(id) {
  let cart = getCart().filter((item) => item.id !== id);
  saveCart(cart);
  renderCart();
  updateCartCount();
}

// ----- RENDER DI cart.html -----
function renderCart() {
  const tbody = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");
  const emptyEl = document.getElementById("cart-empty");

  if (!tbody || !totalEl || !emptyEl) return; // bukan di cart.html

  const cart = getCart();

  // kalau kosong
  if (cart.length === 0) {
    tbody.innerHTML = "";
    totalEl.textContent = formatRupiah(0);
    emptyEl.style.display = "block";
    return;
  }

  emptyEl.style.display = "none";
  tbody.innerHTML = "";

  let grandTotal = 0;

  cart.forEach((item) => {
    const subtotal = item.price * item.qty;
    grandTotal += subtotal;

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${item.name}</td>
      <td>${formatRupiah(item.price)}</td>
      <td>
        <button class="cart-qty-btn" onclick="changeQty('${item.id}', -1)">-</button>
        <span style="margin:0 8px;">${item.qty}</span>
        <button class="cart-qty-btn" onclick="changeQty('${item.id}', 1)">+</button>
      </td>
      <td>${formatRupiah(subtotal)}</td>
      <td><button class="cart-remove" onclick="removeFromCart('${item.id}')">Hapus</button></td>
    `;

    tbody.appendChild(tr);
  });

  totalEl.textContent = formatRupiah(grandTotal);
}

// Panggil saat halaman selesai di-load
document.addEventListener("DOMContentLoaded", function () {
  updateCartCount();
  renderCart(); // hanya jalan di cart.html
});
