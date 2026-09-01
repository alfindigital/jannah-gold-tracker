# Product Requirements Document (PRD) — Jannah Gold PWA Dashboard

## 1. Goals (Tujuan Produk)
- Menggantikan pencatatan manual berbasis spreadsheet Excel bagi pemilik toko emas (Jannah Gold) dengan aplikasi Web Progresif (PWA) mobile-first yang intuitif, cepat, dan otomatis.
- Menyediakan pelacakan modal beli, harga pasar live, dan perhitungan keuntungan bersih (Net Profit) secara otomatis dan presisi tanpa risiko salah rumus kalkulasi manual.
- Mengintegrasikan manajemen inventori stok emas (gramasi, kadar, model), database pelanggan (CRM) dengan shortcut chat WhatsApp, serta penjadwalan janji COD dan agenda kulakan dalam satu dasbor terpadu.

## 2. Scope (Ruang Lingkup)
### In-Scope (Yang Dikerjakan):
1. **Dasbor Finansial & Tracking Keuntungan**:
   - Total modal aktif tertanam di stok emas.
   - Total laba bersih (Net Profit) kumulatif & per periode (hari ini, minggu ini, bulan ini).
   - Widget harga acuan emas terkini (Antam, UBS, Galeri 24, Spot) dengan penyesuaian manual/otomatis.
   - Estimasi valuasi aset stok berdasarkan harga buyback/pasar hari ini.
2. **Manajemen Inventori & Stok Emas**:
   - Input pembelian emas baru: tanggal, supplier/toko beli, gramasi (0.1g s/d 100g+), jenis/model (batangan LM, koin, cincin, gelang, kalung), kadar (24K, 22K, 18K, 16K, dll.), modal beli satuan, biaya ongkos/cetak, total modal.
   - Status stok dinamis: `Ready` (Tersedia), `Booked` (DP/Janji), `Sold` (Terjual).
   - Filter & pencarian stok berdasarkan kategori, gramasi, status.
3. **CRM & Transaksi Penjualan**:
   - Pencatatan penjualan dengan memilih item ready dari inventori.
   - Database pelanggan (Nama, No WhatsApp, Domisili/Catatan).
   - Tombol instan klik chat WhatsApp (`https://wa.me/...`).
   - Otomatis menghitung laba kotor & laba bersih setelah dikurangi ongkos operasional/COD.
   - Export data transaksi & inventori ke file Excel (`.xlsx`) dan backup JSON.
4. **Jadwal Operasional & Agenda COD / Kulakan**:
   - Jadwal janji COD pengantaran emas: tanggal, jam, nama pelanggan, lokasi/alamat, nominal yang harus diterima (Cash/Transfer), status COD (`Menunggu`, `Jalan`, `Selesai`, `Reschedule`).
   - Integrasi link ke Google Maps untuk navigasi titik temu COD.
   - Jadwal agenda kulakan/restock emas ke supplier: tanggal, budget yang disiapkan, target gramasi.
   - Banner reminder agenda hari ini di halaman muka.
5. **Mobile PWA & Local-First**:
   - Installable ke layar utama HP (Add to Home Screen).
   - Offline-ready dengan IndexedDB (Dexie.js).
   - Tema elegan: *Clean Light & Champagne Gold*.

### Out-of-Scope (Non-Goals):
- Pembayaran payment gateway otomatis perbankan (karena transaksi emas berbasis COD & transfer manual).
- Sistem multi-cabang kompleks / multi-tenant SaaS.

## 3. MVP (Minimum Viable Product)
- [x] Tab 1: Ringkasan Finansial, Net Profit, Harga Emas Terkini, & Quick Reminder COD Hari Ini.
- [x] Tab 2: Katalog Inventori Stok Emas + Form Tambah Stok Modal Beli.
- [x] Tab 3: Form Penjualan + Database Customer CRM + Export Excel.
- [x] Tab 4: Kalender/Daftar Agenda Pengantaran COD & Jadwal Belanja Kulakan.
- [x] Database IndexedDB lokal dengan data inisial realistis + Import/Export JSON.

## 4. Tech Requirements
- **Platform**: Progressive Web App (PWA) berjalan lancar di Chrome Android, Safari iOS, dan Desktop.
- **Frontend Stack**: React 18, Vite, Tailwind CSS, Lucide Icons, Recharts, Canvas Confetti.
- **Database / Storage**: Local-First IndexedDB via `dexie` & `dexie-react-hooks`.
- **Export Engine**: `xlsx` (SheetJS) untuk download file spreadsheet `.xlsx`.
- **Offline & Caching**: Service Worker + Web App Manifest (`manifest.json`).

## 5. Success Metrics
- **Waktu Input Transaksi**: Kurang dari 20 detik untuk mencatat pembelian atau penjualan emas.
- **Akurasi Finansial**: 100% akurat dalam kalkulasi modal, margin laba per item, dan total net profit.
- **Kemudahan Akses**: 1-klik buka WhatsApp pembeli dan 1-klik rute Google Maps lokasi COD.
- **Data Safety**: 100% data tersimpan di penyimpanan lokal HP pengguna dengan fitur 1-klik backup Excel & JSON.
