-- Seed data for RumahKue products
insert into public.products (name, slug, category, short_description, price, is_active, is_featured, sort_order)
values 
('Nastar Klasik', 'nastar-klasik', 'Kue Kering', 'Toples 500gr - Selai nanas homemade', 85000, true, true, 1),
('Kastengel Keju', 'kastengel-keju', 'Kue Kering', 'Toples 500gr - Full keju edam & cheddar', 95000, true, true, 2),
('Putri Salju', 'putri-salju', 'Kue Kering', 'Toples 500gr - Taburan gula halus dingin', 75000, true, false, 3),
('Roti Sisir Mentega', 'roti-sisir-mentega', 'Aneka Roti', 'Isi 6 pcs - Tekstur lembut & wangi butter', 35000, true, true, 4),
('Puding Coklat Lapis', 'puding-coklat-lapis', 'Aneka Puding', 'Loyang 20cm - Coklat Belgia & Vla Vanilla', 120000, true, false, 5),
('Risoles Smoked Beef', 'risoles-smoked-beef', 'Kue Asin', 'Box isi 10 - Isian melimpah & creamy', 50000, true, false, 6);
