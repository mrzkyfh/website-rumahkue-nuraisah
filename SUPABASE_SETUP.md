# Setup Admin RumahKue

## 1. Buat project Supabase

1. Buat project baru di Supabase.
2. Buka `SQL Editor`.
3. Jalankan isi file `supabase/schema.sql`.
4. (Opsional) Jalankan isi file `supabase/seed.sql` untuk mengisi data produk awal.

## 2. Buat user admin

1. Buka `Authentication > Users`.
2. Tambah user manual untuk admin.
3. Simpan email dan password yang nanti dipakai login ke `/admin`.

## 3. Isi config website

Edit file `site-config.js`.

Kalau mau lebih aman, copy dulu isi dari `site-config.example.js`, lalu isi value Supabase kamu:

```js
window.RUMAHKUE_CONFIG = {
  supabaseUrl: "https://YOUR-PROJECT.supabase.co",
  supabaseAnonKey: "YOUR_SUPABASE_ANON_KEY",
  supabaseProductsTable: "products",
  legacyProductsApiBase: "https://rumah-kue-api.mrzkyfh.workers.dev"
};
```

Kalau config Supabase diisi:
- website publik akan baca data produk dari Supabase
- `/admin` akan aktif untuk login dan CRUD

Kalau belum diisi:
- homepage tetap fallback ke API lama
- admin akan menampilkan peringatan setup

## 4. Hosting

- Website utama tetap bisa di Cloudflare Pages.
- Folder `/admin` ikut terdeploy sebagai `domainkamu.com/admin/`.
- Kalau ingin admin benar-benar terpisah, folder ini bisa dipindahkan ke repo lain lalu di-host ke `admin.domainkamu.com`.

## 5. Struktur data yang dikelola admin

Kolom utama:
- `name`
- `slug`
- `category`
- `short_description`
- `description`
- `price`
- `old_price`
- `image_url`
- `detail_url`
- `sort_order`
- `is_active`
- `is_featured`
