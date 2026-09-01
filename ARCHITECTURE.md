# Architecture Document — Jannah Gold PWA Tracker

## 1. Tech Stack
- **Frontend Core**: React 18 (SPA with hooks & functional components), Vite (High-speed build tool & HMR).
- **Styling & UI**: Tailwind CSS 3.4, PostCSS, Lucide React (featherweight luxury icon set).
- **State & Database**: Dexie.js (IndexedDB wrapper) with `dexie-react-hooks` for reactive, zero-latency local queries.
- **Charts & Visuals**: Recharts (smooth financial trend lines) + Canvas Confetti (celebration feedback on sales recorded).
- **Data Export & Reporting**: XLSX (SheetJS) for seamless Excel export & JSON import/export.
- **PWA Ecosystem**: Service Worker (`sw.js`), Web App Manifest (`manifest.json`), responsive viewport meta tags.

## 2. Architecture & Layering Flow
```
+-------------------------------------------------------------------------+
|                         📱 USER INTERFACE LAYER                         |
|   - Bottom Navigation Bar (4 Tab: Finansial, Inventori, CRM, COD)        |
|   - Reusable UI Components (Stat Cards, Modals, Forms, Badges, Tables)   |
+------------------------------------+------------------------------------+
                                     | (Reactive hooks: useLiveQuery)
+------------------------------------v------------------------------------+
|                      🧠 BUSINESS LOGIC & SERVICE LAYER                  |
|   - Financial Calculations (Net Profit, ROI, Inventory Valuation)       |
|   - Gold Price Estimator (Antam/UBS/Spot vs Buyback Margin)             |
|   - Inventory Status Lifecycle (Ready -> Booked -> Sold)                |
|   - Schedule Dispatcher (Today's COD alert, Kulakan planner)            |
|   - Export Service (XLSX generator, JSON Backup/Restore)                |
+------------------------------------+------------------------------------+
                                     | (IndexedDB Transaction APIs)
+------------------------------------v------------------------------------+
|                       💾 LOCAL DATABASE LAYER (DEXIE.JS)                |
|   - Table: inventory (items, grammage, buy_price, status)               |
|   - Table: transactions (sales, customer_id, sell_price, profit)        |
|   - Table: customers (name, phone, address, total_grams_bought)         |
|   - Table: schedules (cod_appointments, restocking_trips)              |
|   - Table: settings (live_gold_price, app_preferences)                  |
+-------------------------------------------------------------------------+
```

## 3. Folder Structure
```
pwa-gold-tracker/
├── PRD.md                  # Product Requirements Document
├── ARCHITECTURE.md         # System Architecture & Flow
├── DESIGN.md               # Design System, Tokens, Component Specs
├── SCHEMA.md               # Database Table Schemas & Indexes
├── RULES.md                # Engineering Standards & Guardrails
├── index.html              # PWA Entry HTML with viewport & manifest links
├── manifest.json           # Web App Manifest for mobile installation
├── package.json            # Node dependencies and scripts
├── vite.config.js          # Vite configuration with PWA bundling
├── tailwind.config.js      # Tailwind theme tokens (Gold/Champagne/Sand)
├── postcss.config.js       # PostCSS plugins
├── public/
│   ├── icon-192.png        # Mobile home screen icon (192px)
│   ├── icon-512.png        # Splash screen icon (512px)
│   └── sw.js               # Service Worker for offline asset caching
└── src/
    ├── main.jsx            # React root bootstrap
    ├── App.jsx             # Main App layout & Tab Router
    ├── db/
    │   ├── db.js           # Dexie database instance & table definitions
    │   └── seed.js         # Realistic initial sample data
    ├── components/
    │   ├── layout/
    │   │   ├── Header.jsx           # App top bar with Live Gold Price ticker
    │   │   └── BottomNav.jsx        # Mobile thumb-friendly bottom nav
    │   ├── dashboard/
    │   │   ├── MetricCards.jsx      # Net profit, active modal, valuation
    │   │   ├── GoldPriceWidget.jsx  # Today's gold price editor & reference
    │   │   ├── TodayAgendaAlert.jsx # Urgent COD tasks for today
    │   │   └── ProfitChart.jsx      # Visual trend chart
    │   ├── inventory/
    │   │   ├── InventoryList.jsx    # Stock cards with filter & search
    │   │   ├── AddStockModal.jsx    # Form for adding gold stock
    │   │   └── StockDetailModal.jsx # Detail card & Quick-sell trigger
    │   ├── crm/
    │   │   ├── SalesList.jsx        # Sales transactions table/cards
    │   │   ├── RecordSaleModal.jsx  # Sell item form with profit calculator
    │   │   ├── CustomerList.jsx     # CRM database + WhatsApp direct chat
    │   │   └── ExportButton.jsx     # 1-click Excel export trigger
    │   ├── schedule/
    │   │   ├── CodScheduleList.jsx  # COD Delivery tasks + Maps shortcut
    │   │   ├── AddCodModal.jsx      # New COD schedule form
    │   │   ├── RestockList.jsx      # Kulakan shopping planner
    │   │   └── AddRestockModal.jsx  # New restocking schedule form
    │   └── common/
    │       ├── Badge.jsx            # Status badges (Ready, Sold, Pending)
    │       ├── Modal.jsx            # Reusable slide-up sheet / modal
    │       └── Toast.jsx            # Notification alerts
    ├── services/
    │   ├── exportService.js         # XLSX builder & downloader
    │   └── calculationService.js    # Financial math, FIFO margin, totals
    └── styles/
        └── index.css                # Global CSS & luxury typography styling
```

## 4. Third-Party Tools & Libraries
- **Lucide-React**: Elegant, minimal vector icons.
- **Dexie**: High-performance indexedDB browser engine.
- **SheetJS (xlsx)**: Client-side Excel binary generation.
- **Recharts**: Responsive SVG charts for financial trend analysis.
- **Canvas-Confetti**: Haptic/visual delight reward when sales are recorded.
