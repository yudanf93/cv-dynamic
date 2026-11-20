# Dynamic CV Studio (Vanilla JS + Supabase PostgreSQL)

Aplikasi CV dinamis berbasis **HTML5/CSS3/JavaScript murni (Vanilla)** tanpa build tool / bundler, mendukung **multi-layout**, **bilingual (EN/ID)**, **focus toggle (Frontend / Fullstack)**, dan **CRUD database PostgreSQL via Supabase**.

---

## 📁 Struktur File & Folder
- `index.html` — Halaman utama, toolbar pengaturan layout CV, serta UI modal manajemen database Supabase.
- `cv-data.js` — Data default/fallback berformat objek JavaScript (menggunakan data dummy: Alex Pratama).
- `supabase-schema.sql` — Skrip DDL PostgreSQL lengkap untuk Supabase (Opsi B: Relasional Ternormalisasi), mencakup pembuatan tabel, foreign keys, indeks, Row Level Security (RLS), dan seed data awal.
- `supabase-client.js` — Adapter client Supabase (Vanilla JS) untuk fetch relasional, login/logout auth, dan fungsi CRUD (Create, Read, Delete, Update).
- `app.js` — Logika rendering template CV, pergantian layout, density, print/PDF, dan integrasi modal Supabase.
- `styles.css` — Styling 3 layout (ATS Classic, Modern Accent, Clean Sidebar), modal database, dan optimasi cetak PDF A4 (`@media print`).
- `assets/profile.jpg` — Foto profil untuk layout dengan foto.

---

## ⚡ Panduan Menghubungkan Supabase (Opsi B: Relasional)

### Langkah 1: Eksekusi SQL di Supabase
1. Buka dashboard [Supabase](https://supabase.com) dan buat project baru (atau gunakan project yang sudah ada).
2. Masuk ke menu **SQL Editor** di dashboard Supabase.
3. Salin seluruh isi file [`supabase-schema.sql`](supabase-schema.sql), tempelkan ke SQL Editor, lalu klik **Run**.
4. Skrip ini akan membuat tabel-tabel relasional:
   - `cv_profiles`
   - `cv_titles`
   - `cv_summaries`
   - `cv_skills`
   - `cv_experiences` & `cv_experience_bullets`
   - `cv_projects`
   - `cv_educations`
   Beserta indeks performa, aturan Row Level Security (RLS), dan data dummy awal.

### Langkah 2: Hubungkan di Aplikasi Browser
1. Buka file `index.html` langsung di browser (Chrome / Edge / Firefox).
2. Di toolbar atas, klik tombol **`⚡ Database Supabase`**.
3. Di tab **Koneksi & Auth**:
   - Masukkan **Project URL** (misal: `https://xyzproject.supabase.co`).
   - Masukkan **Anon / Public API Key**.
   - Klik **Simpan & Tarik Data**.
4. Status akan berubah menjadi **● Status: Terhubung ke Supabase PostgreSQL**. Data CV akan langsung termuat secara dinamis dari tabel Supabase.

---

## 🛠️ Fitur CRUD (Create, Read, Update, Delete)

1. **Read (Otomatis):**
   - Data CV ditarik langsung dari Supabase saat aplikasi dibuka.
   - Jika Supabase belum dihubungkan atau perangkat offline, aplikasi secara otomatis fallback membaca data lokal dari `cv-data.js`.
2. **Create (Tambah Data Baru):**
   - Klik tombol **`⚡ Database Supabase`**.
   - Buka tab **+ Pengalaman**, **+ Proyek**, atau **+ Skill & Edu**.
   - Isi formulir lalu klik simpan. Data akan langsung di-insert ke tabel Supabase dan CV otomatis di-refresh.
3. **Delete (Hapus Data):**
   - Aktifkan tombol **`Edit Text: ON`** di toolbar.
   - Tombol merah `🗑 Hapus` akan muncul di samping setiap item pengalaman, proyek, skill, dan pendidikan.
   - Klik tombol tersebut untuk menghapus baris data secara permanen dari Supabase.
4. **Update (Ubah Data):**
   - Dengan **`Edit Text: ON`**, Anda dapat mengedit teks apa pun secara visual langsung di halaman CV.
5. **Keamanan (RLS & Supabase Auth):**
   - Recruiter atau pengunjung umum dapat melihat CV tanpa perlu login (Read-only via RLS Policy).
   - Operasi penulisan/penghapusan data (Insert/Update/Delete) diamankan dengan Row Level Security dan akun admin.

---

## 🖨️ Export ke PDF (Cetak Siap ATS)
1. Klik **`Print / Save PDF`** di toolbar atau tekan `Ctrl + P`.
2. Pilih printer **Save as PDF**.
3. Atur **Paper size: A4** dan **Margins: Default**.
4. Hilangkan centang **Headers & Footers**.
5. Centang **Background graphics** agar aksen visual sidebar dan badge ikut tercetak sempurna.
