# Design System & UI/UX Guidelines — Jannah Gold PWA Tracker

## 1. Aesthetic Direction: Clean Light & Champagne Gold
- **Vibe & Atmosphere**: Clean, prestigious, trust-inspiring, luxurious yet modern (seperti private banking and boutique fine jewelry).
- **Core Principle**: Anti-clutter, high legibility, large touch targets (minimum 44x44px for thumb accessibility on mobile), elegant contrast.

## 2. Color Palette & Tokens
```css
:root {
  /* Neutral / Background */
  --bg-primary: #FDFBF7;       /* Warm Alabaster / Ivory White */
  --bg-surface: #FFFFFF;       /* Pure Crisp White for Cards */
  --bg-surface-elevated: #F8F5EE; /* Soft Warm Cream */
  
  /* Gold Accent & Primary */
  --gold-50: #FFFDF5;
  --gold-100: #FFF9E5;
  --gold-200: #FCECB8;
  --gold-400: #E6B84D;
  --gold-500: #D4A017;         /* Champagne / Sovereign Gold */
  --gold-600: #B8860B;         /* Dark Goldenrod */
  --gold-800: #785204;
  
  /* Text & Foreground */
  --text-primary: #1C1917;     /* Deep Warm Obsidian */
  --text-secondary: #57534E;   /* Muted Warm Stone */
  --text-tertiary: #A8A29E;    /* Soft Placeholder Gray */
  
  /* Semantic Status */
  --success-bg: #ECFDF5;
  --success-text: #047857;     /* Emerald (Laba / Ready / Selesai) */
  --warning-bg: #FFFBEB;
  --warning-text: #B45309;     /* Amber (Booked / On-Going) */
  --danger-bg: #FEF2F2;
  --danger-text: #B91C1C;      /* Crimson (Biaya / Cancelled) */
  --info-bg: #EFF6FF;
  --info-text: #1D4ED8;        /* Sapphire (Kulakan / Info) */
}
```

## 3. Typography & Hierarchy
- **Font Family**: Modern Clean Sans (`Inter`, `Plus Jakarta Sans`, system-ui).
- **Numbers & Currency**: Monospace-aligned tabular figures (`font-variant-numeric: tabular-nums`) to ensure price columns and grammage line up cleanly.
- **Scale**:
  - Display Metric: `text-2xl font-bold tracking-tight text-stone-900`
  - Section Header: `text-lg font-semibold text-stone-800`
  - Body Text: `text-sm text-stone-600`
  - Microcopy / Tag: `text-xs font-medium uppercase tracking-wider`

## 4. Spacing, Radius, & Elevation
- **Border Radius**:
  - Cards: `rounded-2xl` (16px) for smooth modern mobile aesthetic.
  - Buttons & Inputs: `rounded-xl` (12px).
  - Badges & Pills: `rounded-full`.
- **Elevation / Shadows**:
  - Card Shadow: `shadow-sm hover:shadow-md border border-stone-200/70 bg-white`
  - Bottom Bar: `shadow-[0_-4px_20px_rgba(0,0,0,0.05)] border-t border-stone-100 bg-white/95 backdrop-blur-md`
  - Modal Backdrop: `bg-black/40 backdrop-blur-sm`

## 5. UI Interaction Flows & Mobile Ergonomics
1. **Bottom Navigation**: 4 easily accessible tabs:
   - 📊 Finansial (Dashboard overview, Net Profit, Harga Emas, Reminder)
   - 💎 Stok Emas (Daftar inventori, filter berat/brand, tambah stok)
   - 🛒 Penjualan (Catat jual, riwayat, CRM pelanggan, download Excel)
   - 🛵 Jadwal COD (Agenda antar hari ini/besok, navigasi Maps, agenda kulakan)
2. **Action Sheet Modals**: Form pengisian muncul sebagai slide-up sheet dari bawah layar dengan tombol "Simpan" yang besar dan jelas.
3. **Instant WA & Maps Triggers**:
   - Klik nomor pelanggan langsung membuka WhatsApp dengan draft teks otomatis ("Halo Bu/Kak [Nama], pesanan emasnya sudah siap kami kirim...").
   - Klik alamat COD langsung membuka Google Maps di smartphone.
