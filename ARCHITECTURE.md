# Architecture Document — Jannah Gold PWA Tracker

> **Status**: Verified Production Live  
> **Production URL**: https://alfindigital.github.io/jannah-gold-tracker/  
> **Repository**: https://github.com/alfindigital/jannah-gold-tracker (branch: main)

---

## 1. Tech Stack
- **Frontend Core**: React 18 (SPA with hooks & functional components), Vite v6.4+ dengan Rollup `manualChunks` code-splitting.
- **Styling & UI**: Tailwind CSS 3.4, PostCSS, Lucide React (featherweight luxury icon set).
- **Routing**: Hash-based URL routing (`window.location.hash`) tanpa overhead library eksternal, mendukung tombol browser back/forward dan refresh aman di GitHub Pages.
- **State & Database**: Dexie.js (IndexedDB wrapper) dengan `dexie-react-hooks` untuk reaktifitas instan (`useLiveQuery`).
- **Visual Micro-Interactions**: Canvas Confetti saat pencatatan transaksi berhasil.
- **Data Export & Portability**: XLSX (SheetJS) untuk ekspor 4-sheet Excel & JSON import/export utuh.
- **PWA Ecosystem**: Service Worker (`public/sw.js`, Network-First caching `jannah-gold-v3`), Web App Manifest (`public/manifest.json`), viewport meta tags responsif.

---

## 2. Arsitektur Komponen & Alur Kerja

```
+-------------------------------------------------------------------------+
|                         📱 USER INTERFACE LAYER                         |
|   - Header: Quick Action Buttons (Tambah Stok, Jual Emas)               |
|   - Bottom Navigation Bar (5 Tab: Dashboard, Jadwal, Stok, CRM, Laporan)|
|   - Dedicated Sub-Page: Harga Emas Acuan (/#/gold-prices)               |
|   - Reusable UI Components: Modal.jsx, Badge.jsx                        |
+------------------------------------+------------------------------------+
                                     | (Reactive hooks: useLiveQuery)
+------------------------------------v------------------------------------+
|                      🧠 BUSINESS LOGIC & SERVICE LAYER                  |
|   - calculationService.js (Net Profit, Margin %, Format, WA Receipt)    |
|   - exportService.js (4-Sheet XLSX Generator, JSON Backup & Restore)    |
|   - Inventory Lifecycle (Ready -> Booked -> Sold)                       |
|   - Schedule Dispatcher (COD Workflow, Auto Convert to Sale)            |
|   - Online Price Ingestion (prices.json + GitHub Actions Cron)          |
+------------------------------------+------------------------------------+
                                     | (IndexedDB Transaction APIs)
+------------------------------------v------------------------------------+
|                       💾 LOCAL DATABASE LAYER (DEXIE.JS)                |
|   - Table: inventory (stok, gramasi, modal beli HPP, status)            |
|   - Table: transactions (penjualan, customer, harga jual, laba bersih)  |
|   - Table: customers (nama, nomor WA, alamat, LTV, total gram)          |
|   - Table: schedules (janji COD, belanja kulakan, status)               |
|   - Table: settings (acuan harga 5 brand, preferensi)                   |
+-------------------------------------------------------------------------+
```

---

## 3. Struktur Berkas Sebenarnya (Codebase Structure)

```
pwa-gold-tracker/
├── HANDOVER.md                 # Salinan lokal master handover & hindsight
├── ARCHITECTURE.md             # Dokumen arsitektur sistem terkini
├── PRD.md                      # Product Requirements Document
├── SCHEMA.md                   # Database Table Schemas & Indexes
├── RULES.md                    # Engineering Standards & Guardrails
├── index.html                  # PWA Entry HTML with viewport & manifest links
├── package.json                # Node dependencies and build scripts
├── vite.config.js              # Vite configuration with Rollup code-splitting
├── tailwind.config.js          # Tailwind luxury gold theme tokens
├── postcss.config.js           # PostCSS configuration
├── vercel.json                 # Optional SPA rewrite configuration
├── public/
│   ├── manifest.json           # Web App Manifest for mobile installation
│   ├── sw.js                   # Service Worker (Network-First jannah-gold-v3)
│   ├── logo.png                # App icon 512px
│   └── prices.json             # Acuan harga pasar benchmark harian
└── src/
    ├── main.jsx                # React root bootstrap
    ├── App.jsx                 # Main App layout, Hash Router, & State Bus
    ├── index.css               # Global CSS & luxury typography styling
    ├── db/
    │   ├── db.js               # Dexie database instance & table definitions
    │   └── seed.js             # Realistic Indonesian sample seed data
    ├── services/
    │   ├── calculationService.js # Financial math, formatting, WA receipt
    │   └── exportService.js      # 4-sheet Excel generator & JSON backup/restore
    └── components/
        ├── common/
        │   ├── Badge.jsx       # Status badge (Ready, Sold, Pending, dll.)
        │   └── Modal.jsx       # Reusable accessible slide-up modal
        ├── layout/
        │   ├── Header.jsx      # Top header with quick action buttons
        │   └── BottomNav.jsx   # 5-tab thumb-friendly bottom navigation
        ├── dashboard/
        │   └── DashboardTab.jsx # 4 Bento cards, stok terbaru, jadwal, mini price table
        ├── goldprices/
        │   └── GoldPricesTab.jsx # 5-brand prices table with inline edit & online sync
        ├── schedule/
        │   └── ScheduleTab.jsx   # COD & restock agenda with auto-convert to sale
        ├── inventory/
        │   └── InventoryTab.jsx  # Inventory catalog, filters, add stock modal, quick sell
        ├── crm/
        │   └── CrmTab.jsx        # Customer CRM, LTV, order history, resend WA receipt
        └── reports/
            └── FinancialReportTab.jsx # PnL, sales list, WA receipt, Excel/JSON backup
```

---

## 4. Code Splitting & Performa Bundling

Dikonfigurasi pada `vite.config.js`:
- `vendor-react`: `['react', 'react-dom']`
- `vendor-db`: `['dexie', 'dexie-react-hooks']`
- `vendor-icons`: `['lucide-react']`
- `vendor-xlsx`: `['xlsx']` (dipisahkan khusus ~283 kB)

**Ukuran Hasil Build**:
- `index-*.js`: **95.01 kB** (gzip: **21.73 kB**) ➔ First-paint instan di HP!
- `vendor-slRwBf2R.js`: **255.65 kB** (React + Dexie + Lucide)
- `vendor-xlsx-*.js`: **283.10 kB** (SheetJS di-load hanya saat laporan diakses)
