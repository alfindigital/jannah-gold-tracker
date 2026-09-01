# Database Schema — Jannah Gold PWA Tracker

## 1. Database Overview
- **Storage Engine**: Dexie.js (Client-side IndexedDB with Reactive Hooks).
- **Database Name**: `JannahGoldDB`
- **Schema Version**: `1`

## 2. Table Definitions & Relational Integrity

### Table: `inventory`
Menyimpan data stok emas dan modal awal pembelian.
- **Indexed Fields**: `++id, brand, type, weight, status, purchaseDate, createdAt`

| Nama Kolom | Tipe Data | Constraint | Deskripsi |
| :--- | :--- | :--- | :--- |
| `id` | Integer | Auto-Increment PK | ID unik barang |
| `title` | String | Required | Nama barang (misal: "Antam 1 Gram Certicard 2026") |
| `brand` | String | Required | Merk/Produsen: `Antam`, `UBS`, `Galeri 24`, `Hartadinata`, `Perhiasan`, `Lainnya` |
| `type` | String | Required | Jenis: `Batangan (LM)`, `Koin Emas`, `Cincin`, `Gelang`, `Kalung`, `Anting` |
| `weight` | Number | Required | Berat dalam gram (e.g. 0.5, 1, 2, 5, 10, 25, 50, 100) |
| `purity` | String | Optional | Kadar karat (misal: "24K / 99.99%", "22K / 916", "16K") |
| `purchaseDate` | String (ISO) | Required | Tanggal pembelian modal emas |
| `supplier` | String | Optional | Tempat/toko/agen asal beli |
| `buyPriceUnit` | Number | Required | Harga beli per gram / harga per satuan |
| `buyCostExtra` | Number | Default 0 | Ongkos cetak / biaya tambahan |
| `totalBuyPrice`| Number | Required | Total modal uang yang dikeluarkan (`buyPriceUnit + buyCostExtra`) |
| `status` | String | Default 'ready' | `ready` (Tersedia), `booked` (DP/Ditahan), `sold` (Terjual) |
| `notes` | String | Optional | Seri certicard, kondisi kemasan, dll. |
| `createdAt` | String (ISO) | Required | Timestamp pencatatan awal |

---

### Table: `transactions`
Menyimpan riwayat transaksi penjualan dan kalkulasi laba.
- **Indexed Fields**: `++id, inventoryId, customerId, saleDate, createdAt`

| Nama Kolom | Tipe Data | Constraint | Deskripsi |
| :--- | :--- | :--- | :--- |
| `id` | Integer | Auto-Increment PK | ID transaksi penjualan |
| `inventoryId` | Integer | FK to `inventory` | Barang yang dijual |
| `itemTitle` | String | Required | Snapshot nama barang saat dijual |
| `weight` | Number | Required | Berat gramasi item yang terjual |
| `customerId` | Integer | Optional FK | Pelanggan pembeli |
| `customerName`| String | Required | Nama pembeli |
| `customerPhone`| String| Optional | No WhatsApp pembeli |
| `saleDate` | String (ISO) | Required | Tanggal penjualan |
| `costPrice` | Number | Required | Modal awal barang (diambil dari `inventory.totalBuyPrice`) |
| `sellPrice` | Number | Required | Harga jual ke pembeli |
| `operationalFee`| Number| Default 0 | Biaya operasional/bensin/COD fee |
| `grossProfit` | Number | Calculated | `sellPrice - costPrice` |
| `netProfit` | Number | Calculated | `sellPrice - costPrice - operationalFee` |
| `paymentMethod`| String| Default 'Cash COD'| `Cash COD`, `Transfer Bank`, `DP + Pelunasan` |
| `notes` | String | Optional | Catatan transaksi |
| `createdAt` | String (ISO) | Required | Timestamp dibuat |

---

### Table: `customers`
Database direktori pelanggan (CRM).
- **Indexed Fields**: `++id, name, phone, createdAt`

| Nama Kolom | Tipe Data | Constraint | Deskripsi |
| :--- | :--- | :--- | :--- |
| `id` | Integer | Auto-Increment PK | ID unik customer |
| `name` | String | Required | Nama lengkap / panggilan |
| `phone` | String | Required | Nomor WhatsApp (format: 08xx / 62xx) |
| `address` | String | Optional | Alamat pengantaran / domisili |
| `totalTransactions`| Number| Default 0 | Total berapa kali beli |
| `totalGramsBought`| Number | Default 0 | Total gramasi yang pernah dibeli |
| `notes` | String | Optional | Catatan preferensi (suka Antam 1g, dll.) |
| `createdAt` | String (ISO) | Required | Timestamp registrasi |

---

### Table: `schedules`
Manajemen agenda pengantaran COD dan jadwal belanja (kulakan).
- **Indexed Fields**: `++id, type, date, status, customerId, createdAt`

| Nama Kolom | Tipe Data | Constraint | Deskripsi |
| :--- | :--- | :--- | :--- |
| `id` | Integer | Auto-Increment PK | ID unik jadwal |
| `type` | String | Required | `cod_delivery` (Antar COD) atau `restock_trip` (Jadwal Kulakan) |
| `title` | String | Required | Judul agenda (misal: "COD Antam 5g ke Bu Rahma") |
| `date` | String (YYYY-MM-DD)| Required | Tanggal pelaksanaan |
| `time` | String (HH:MM)| Optional | Jam janji temu |
| `location` | String | Required | Titik temu / Nama toko supplier |
| `targetAmount` | Number | Optional | Uang yang harus ditagih (COD) atau budget belanja (Kulakan) |
| `relatedInventoryId`| Integer| Optional FK | Barang yang akan dibawa COD |
| `customerId` | Integer | Optional FK | Customer terkait |
| `status` | String | Default 'pending' | `pending` (Menunggu), `ongoing` (Dalam Perjalanan), `completed` (Selesai), `cancelled` (Batal) |
| `notes` | String | Optional | Detail patokan tempat, instruksi COD |
| `createdAt` | String (ISO) | Required | Timestamp dibuat |

---

### Table: `settings`
Menyimpan konfigurasi aplikasi dan harga acuan pasar emas.
- **Indexed Fields**: `key`

| Key | Tipe Data | Deskripsi |
| :--- | :--- | :--- |
| `gold_price_live` | Object | `{ antam1g: 1450000, ubs1g: 1420000, spotGram: 1380000, buyback1g: 1320000, lastUpdated: '2026-09-01' }` |
| `store_info` | Object | `{ storeName: 'Jannah Gold', ownerName: 'Istri Tercinta', city: 'Purbalingga' }` |
