(function () {
  const config = window.RUMAHKUE_CONFIG || {};
  const tableName = config.supabaseProductsTable || "products";
  const setupAlert = document.getElementById("setup-alert");
  const statusAlert = document.getElementById("status-alert");
  const authView = document.getElementById("auth-view");
  const appView = document.getElementById("app-view");
  const sessionEmail = document.getElementById("session-email");
  const loginForm = document.getElementById("login-form");
  const loginButton = document.getElementById("login-button");
  const logoutButton = document.getElementById("logout-button");
  const refreshButton = document.getElementById("refresh-products");
  const resetButton = document.getElementById("reset-form");
  const productForm = document.getElementById("product-form");
  const formTitle = document.getElementById("form-title");
  const tableBody = document.getElementById("products-table-body");
  const totalProducts = document.getElementById("total-products");
  const activeProducts = document.getElementById("active-products");
  const featuredProducts = document.getElementById("featured-products");

  const formFields = {
    id: document.getElementById("product-id"),
    name: document.getElementById("product-name"),
    slug: document.getElementById("product-slug"),
    category: document.getElementById("product-category"),
    price: document.getElementById("product-price"),
    oldPrice: document.getElementById("product-old-price"),
    sortOrder: document.getElementById("product-sort-order"),
    shortDescription: document.getElementById("product-short-description"),
    description: document.getElementById("product-description"),
    imageUrl: document.getElementById("product-image-url"),
    detailUrl: document.getElementById("product-detail-url"),
    isActive: document.getElementById("product-is-active"),
    isFeatured: document.getElementById("product-is-featured")
  };

  let supabaseClient = null;
  let currentProducts = [];
  let currentImages = []; // Menyimpan daftar URL gambar untuk produk yang sedang diedit

  function hasSupabaseConfig() {
    return Boolean(config.supabaseUrl && config.supabaseAnonKey);
  }

  function showStatus(message, type) {
    statusAlert.textContent = message;
    statusAlert.className = "admin-alert";
    statusAlert.hidden = false;
    statusAlert.classList.add(
      type === "error"
        ? "admin-alert-error"
        : type === "success"
          ? "admin-alert-success"
          : "admin-alert-warning"
    );
  }

  function hideStatus() {
    statusAlert.hidden = true;
  }

  function slugify(value) {
    return String(value || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  function formatRupiah(value) {
    return "Rp " + (Number(value) || 0).toLocaleString("id-ID");
  }

  function resetForm() {
    productForm.reset();
    formFields.id.value = "";
    formFields.isActive.checked = true;
    formFields.isFeatured.checked = false;
    formFields.sortOrder.value = "0";
    formTitle.textContent = "Tambah produk baru";
    currentImages = [];
    renderImagePreviews();
  }

  function renderImagePreviews() {
    const container = document.getElementById("image-previews");
    if (!container) return;
    
    container.innerHTML = currentImages.map((url, index) => `
      <div class="preview-item">
        <img src="${url}" alt="Preview" />
        <button type="button" class="preview-remove" data-index="${index}">×</button>
      </div>
    `).join("");

    container.querySelectorAll(".preview-remove").forEach(btn => {
      btn.onclick = () => {
        const index = parseInt(btn.dataset.index);
        currentImages.splice(index, 1);
        if (currentImages.length > 0) {
          formFields.imageUrl.value = currentImages[0];
        } else {
          formFields.imageUrl.value = "";
        }
        renderImagePreviews();
      };
    });
  }

  function fillForm(product) {
    formFields.id.value = product.id;
    formFields.name.value = product.name || "";
    formFields.slug.value = product.slug || "";
    formFields.category.value = product.category || "";
    formFields.price.value = product.price || 0;
    formFields.oldPrice.value = product.old_price || "";
    formFields.sortOrder.value = product.sort_order ?? 0;
    formFields.shortDescription.value = product.short_description || "";
    formFields.description.value = product.description || "";
    formFields.imageUrl.value = product.image_url || "";
    formFields.detailUrl.value = product.detail_url || "";
    formFields.isActive.checked = Boolean(product.is_active);
    formFields.isFeatured.checked = Boolean(product.is_featured);
    
    currentImages = Array.isArray(product.images) ? product.images : (product.image_url ? [product.image_url] : []);
    renderImagePreviews();
    
    formTitle.textContent = "Edit produk";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function buildPayload() {
    const name = formFields.name.value.trim();
    return {
      name,
      slug: slugify(formFields.slug.value || name),
      category: formFields.category.value.trim(),
      price: Number(formFields.price.value || 0),
      old_price: Number(formFields.oldPrice.value || 0),
      sort_order: Number(formFields.sortOrder.value || 0),
      short_description: formFields.shortDescription.value.trim(),
      description: formFields.description.value.trim(),
      image_url: formFields.imageUrl.value.trim(),
      detail_url: formFields.detailUrl.value.trim(),
      is_active: formFields.isActive.checked,
      is_featured: formFields.isFeatured.checked,
      images: currentImages
    };
  }

  function renderRows(products) {
    if (!products.length) {
      tableBody.innerHTML =
        '<tr><td colspan="5" class="table-empty">Belum ada produk di database.</td></tr>';
      return;
    }

    tableBody.innerHTML = products
      .map((product) => {
        const productStatus = product.is_active
          ? '<span class="status-pill status-active">Aktif</span>'
          : '<span class="status-pill status-draft">Disembunyikan</span>';
        const featuredStatus = product.is_featured
          ? '<div><span class="status-pill status-featured">Unggulan</span></div>'
          : "";

        return `
          <tr>
            <td>
              <div class="product-meta">
                <strong>${product.name}</strong>
                <small>${product.short_description || "-"}</small>
              </div>
            </td>
            <td>${product.category || "-"}</td>
            <td>${formatRupiah(product.price)}</td>
            <td>${productStatus}${featuredStatus}</td>
            <td>
              <div class="row-actions">
                <button class="table-button table-button-edit" type="button" data-action="edit" data-id="${product.id}">Edit</button>
                <button class="table-button table-button-delete" type="button" data-action="delete" data-id="${product.id}">Hapus</button>
              </div>
            </td>
          </tr>
        `;
      })
      .join("");
  }

  function renderStats(products) {
    totalProducts.textContent = String(products.length);
    activeProducts.textContent = String(products.filter((item) => item.is_active).length);
    featuredProducts.textContent = String(products.filter((item) => item.is_featured).length);
  }

  async function loadProducts() {
    hideStatus();
    tableBody.innerHTML =
      '<tr><td colspan="5" class="table-empty">Memuat data produk...</td></tr>';

    const { data, error } = await supabaseClient
      .from(tableName)
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      showStatus("Gagal mengambil data produk dari Supabase.", "error");
      return;
    }

    currentProducts = Array.isArray(data) ? data : [];
    renderStats(currentProducts);
    renderRows(currentProducts);
  }

  async function saveProduct(event) {
    event.preventDefault();
    hideStatus();

    const payload = buildPayload();
    if (!payload.name) {
      showStatus("Nama produk wajib diisi.", "error");
      return;
    }

    const currentId = formFields.id.value;
    const query = currentId
      ? supabaseClient.from(tableName).update(payload).eq("id", currentId)
      : supabaseClient.from(tableName).insert(payload);

    const { error } = await query;
    if (error) {
      console.error(error);
      showStatus("Produk gagal disimpan. Cek policy dan struktur tabel Supabase.", "error");
      return;
    }

    showStatus("Produk berhasil disimpan.", "success");
    resetForm();
    loadProducts(); // Jangan pakai await di sini supaya tidak nge-lag
  }

  async function deleteProduct(id) {
    const selected = currentProducts.find((product) => String(product.id) === String(id));
    const productName = selected ? '"' + selected.name + '"' : "produk ini";
    if (!window.confirm("Hapus " + productName + "?")) return;

    const { error } = await supabaseClient.from(tableName).delete().eq("id", id);
    if (error) {
      console.error(error);
      showStatus("Produk gagal dihapus.", "error");
      return;
    }

    showStatus("Produk berhasil dihapus.", "success");
    if (String(formFields.id.value) === String(id)) {
      resetForm();
    }
    await loadProducts();
  }

  async function signOut() {
    await supabaseClient.auth.signOut();
    authView.hidden = false;
    appView.hidden = true;
    resetForm();
  }

  function attachTableEvents() {
    tableBody.addEventListener("click", async (event) => {
      const button = event.target.closest("button[data-action]");
      if (!button) return;

      const productId = button.dataset.id;
      const action = button.dataset.action;
      const selected = currentProducts.find((product) => String(product.id) === String(productId));
      if (!selected) return;

      if (action === "edit") {
        fillForm(selected);
      }

      if (action === "delete") {
        await deleteProduct(productId);
      }
    });
  }

  async function handleSession(session) {
    if (!session) {
      authView.hidden = false;
      appView.hidden = true;
      sessionEmail.textContent = "";
      return;
    }

    authView.hidden = true;
    appView.hidden = false;
    sessionEmail.textContent = "Login sebagai " + (session.user.email || "admin");
    
    // Gunakan try-catch agar jika loading produk gagal, dashboard tetap terbuka
    try {
      loadProducts();
    } catch (e) {
      console.error("Gagal load produk awal:", e);
    }
  }

  async function init() {
    if (!hasSupabaseConfig()) {
      setupAlert.hidden = false;
      loginButton.disabled = true;
      loginButton.textContent = "Isi Config Dulu";
      return;
    }

    supabaseClient = window.supabase.createClient(
      config.supabaseUrl,
      config.supabaseAnonKey
    );

    attachTableEvents();

    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      hideStatus();

      loginButton.disabled = true;
      loginButton.textContent = "Sedang login...";

      const { error } = await supabaseClient.auth.signInWithPassword({
        email: document.getElementById("login-email").value.trim(),
        password: document.getElementById("login-password").value
      });

      loginButton.disabled = false;
      loginButton.textContent = "Login Admin";

      if (error) {
        console.error(error);
        showStatus("Login gagal. Cek email dan password admin Supabase.", "error");
        return;
      }

      showStatus("Login berhasil.", "success");
      
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (session) {
        handleSession(session);
      }
    });

    logoutButton.addEventListener("click", signOut);
    refreshButton.addEventListener("click", loadProducts);
    resetButton.addEventListener("click", resetForm);
    productForm.addEventListener("submit", saveProduct);

    document.getElementById("product-image-file").addEventListener("change", async (event) => {
      const files = Array.from(event.target.files);
      if (!files.length) return;

      const uploadBtn = event.target.closest(".file-upload-btn");
      const originalText = uploadBtn.textContent;

      try {
        uploadBtn.textContent = "Uploading...";
        uploadBtn.style.pointerEvents = "none";
        
        for (const file of files) {
          const fileExt = file.name.split(".").pop();
          const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
          const filePath = `products/${fileName}`;

          const { error } = await supabaseClient.storage
            .from("products")
            .upload(filePath, file);

          if (error) throw error;

          const { data: publicData } = supabaseClient.storage
            .from("products")
            .getPublicUrl(filePath);

          currentImages.push(publicData.publicUrl);
        }

        // Set gambar pertama sebagai gambar utama jika URL utama masih kosong
        if (!formFields.imageUrl.value && currentImages.length > 0) {
          formFields.imageUrl.value = currentImages[0];
        }
        
        renderImagePreviews();
        showStatus(`${files.length} Foto berhasil diupload!`, "success");
      } catch (err) {
        console.error(err);
        showStatus("Gagal upload foto: " + err.message, "error");
      } finally {
        uploadBtn.textContent = originalText;
        uploadBtn.style.pointerEvents = "auto";
        event.target.value = ""; 
      }
    });

    supabaseClient.auth.onAuthStateChange(async (_event, session) => {
      await handleSession(session);
    });

    const {
      data: { session }
    } = await supabaseClient.auth.getSession();
    await handleSession(session);
  }

  init();
})();
