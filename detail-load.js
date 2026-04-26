async function initDetailPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get("slug");

  if (!slug) {
    window.location.href = "/kue.html";
    return;
  }

  const loadingState = document.getElementById("loading-state");
  const content = document.getElementById("detail-content");

  try {
    const products = await window.RumahKueProducts.loadProducts();
    const product = products.find((p) => p.slug === slug);

    if (!product) {
      loadingState.innerHTML = "<h2>Produk tidak ditemukan.</h2><p><a href='/kue.html'>Kembali ke Katalog</a></p>";
      return;
    }

    // Isi Data & SEO
    const pageTitle = `${product.name} - Rumah Kue Nuraisah`;
    document.title = pageTitle;
    
    // Update Meta Description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", product.short_description || `Jual ${product.name} fresh dan lezat di Rumah Kue Nuraisah.`);
    }

    document.getElementById("product-name").textContent = product.name;
    document.getElementById("product-category").textContent = product.category;
    document.getElementById("product-price").textContent = window.RumahKueProducts.formatRupiah(product.price);
    
    if (product.old_price > 0) {
      document.getElementById("product-old-price").textContent = window.RumahKueProducts.formatRupiah(product.old_price);
    }

    document.getElementById("product-short-desc").textContent = product.short_description || "Kue fresh berkualitas.";
    document.getElementById("product-full-desc").textContent = product.description || "Hubungi kami untuk informasi lebih lanjut mengenai produk ini.";

    // Galeri Foto
    const mainImg = document.getElementById("main-image");
    const thumbList = document.getElementById("thumb-list");
    const images = Array.isArray(product.images) && product.images.length > 0 
      ? product.images 
      : [product.image_url || "/images/Gemini_Generated_Image_t0txz3t0txz3t0tx.png"];

    mainImg.src = images[0];

    thumbList.innerHTML = images.map((url, idx) => `
      <div class="thumb-item ${idx === 0 ? 'active' : ''}" onclick="changeMainImage(this, '${url}')">
        <img src="${url}" alt="Thumbnail ${idx + 1}" />
      </div>
    `).join("");

    // Tombol Keranjang
    document.getElementById("add-to-cart-btn").onclick = () => {
      if (window.addToCart) {
        window.addToCart(product.id, product.name, product.price, images[0]);
        alert("Produk berhasil ditambahkan ke keranjang!");
      }
    };

    // Link WhatsApp
    const waMessage = `Halo RumahKue, saya ingin bertanya tentang produk: *${product.name}* (${window.location.href})`;
    document.getElementById("whatsapp-link").href = `https://wa.me/6281234567890?text=${encodeURIComponent(waMessage)}`;

    // Tampilkan Konten
    loadingState.hidden = true;
    content.hidden = false;

  } catch (error) {
    console.error(error);
    loadingState.innerHTML = "<h2>Gagal memuat data.</h2>";
  }
}

function changeMainImage(thumb, url) {
  document.getElementById("main-image").style.opacity = "0.5";
  setTimeout(() => {
    document.getElementById("main-image").src = url;
    document.getElementById("main-image").style.opacity = "1";
    
    document.querySelectorAll(".thumb-item").forEach(t => t.classList.remove("active"));
    thumb.classList.add("active");
  }, 200);
}

document.addEventListener("DOMContentLoaded", initDetailPage);
