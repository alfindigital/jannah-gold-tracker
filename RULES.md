# Engineering Rules & Guidelines — Jannah Gold PWA Tracker

## 1. Core Engineering Standards
- **Clean & Idiomatic React**: Gunakan functional components, standard hooks (`useState`, `useEffect`, `useMemo`, `useCallback`), dan `useLiveQuery` dari `dexie-react-hooks`.
- **Single Responsibility Principle**: Pecah komponen UI kompleks menjadi subkomponen berukuran di bawah 150-200 baris.
- **Formatting Currency & Numbers**: Selalu gunakan helper `formatRupiah(num)` dan `formatGram(num)` terpusat. Gunakan `tabular-nums` pada font untuk data finansial.
- **No Hardcoded Magic Strings**: Ekstrak status (`STATUS_READY`, `STATUS_SOLD`, `STATUS_BOOKED`) dan tipe emas ke konstanta terpusat.

## 2. Business Logic & Calculation Integrity
- **Laba Kotor (Gross Profit)** = `sellPrice - costPrice`
- **Laba Bersih (Net Profit)** = `sellPrice - costPrice - operationalFee`
- **Valuasi Inventori Saat Ini** = $\sum (\text{weight} \times \text{currentGoldPricePerGram})$
- **Modal Tertanam** = $\sum (\text{totalBuyPrice})$ untuk semua item dengan `status === 'ready'`.

## 3. Resilience & Error Handling
- **Database Operations**: Selalu bungkus operasi Dexie dalam async/await dengan try/catch dan berikan toast notification user-friendly.
- **Input Validation**: Pastikan angka gramasi dan nominal rupiah divalidasi (`> 0`) sebelum disimpan ke database.
- **Offline Reliability**: Pastikan aplikasi tetap dapat membaca dan menulis data ke IndexedDB saat offline.

## 4. UI & Ergonomics
- **Thumb-Friendly**: Tombol aksi utama ditempatkan di area jangkauan jempol bawah layar.
- **Direct WA Integration**: Tombol WhatsApp mengonversi nomor lokal `08...` ke format internasional `628...` untuk URL `https://wa.me/628...`.
- **Direct Maps Integration**: Tombol lokasi membuka `https://www.google.com/maps/search/?api=1&query={encoded_address}`.
