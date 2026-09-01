import React, { useState, useEffect, Component } from 'react';
import { seedInitialData } from './db/seed';

// Layout
import Header from './components/layout/Header';
import BottomNav from './components/layout/BottomNav';

// Tabs
import DashboardTab from './components/dashboard/DashboardTab';
import ScheduleTab from './components/schedule/ScheduleTab';
import InventoryTab from './components/inventory/InventoryTab';
import CrmTab from './components/crm/CrmTab';
import FinancialReportTab from './components/reports/FinancialReportTab';
import GoldPricesTab from './components/goldprices/GoldPricesTab';

// Modals
import GoldPriceModal from './components/dashboard/GoldPriceModal';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = async () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(r => r.unregister()));
      }
    } catch (e) {
      console.error('Reset error:', e);
    }
    // Hard reload with cache bust query param
    window.location.href = window.location.pathname + '?refresh=' + Date.now();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F6F3EC] text-[#1B1814] flex items-center justify-center p-6">
          <div className="max-w-sm w-full bg-[#FAF8F5] border-2 border-[#D4AF37]/50 rounded-3xl p-6 shadow-xl text-center space-y-4">
            <div className="w-12 h-12 bg-[#FAF2DA] text-[#946F22] rounded-2xl flex items-center justify-center mx-auto text-xl font-bold">
              !
            </div>
            <h1 className="text-base font-display font-black text-[#1B1814]">Pembaruan Sistem Berhasil</h1>
            <p className="text-xs text-[#7A7264] leading-relaxed">
              Sistem telah diperbarui. Silakan klik tombol di bawah untuk menyegarkan data dan membuka dashboard.
            </p>
            <button
              onClick={this.handleReset}
              className="w-full py-3 bg-[#1B1814] text-[#E5C378] font-display font-bold text-xs rounded-2xl shadow-md active:scale-95 transition-all"
            >
              Buka Dashboard Sekarang
            </button>
            {this.state.error && (
              <details className="text-left text-[10px] font-mono text-[#8A816F] bg-[#F2EDE2] p-2.5 rounded-xl overflow-x-auto">
                <summary className="cursor-pointer font-bold text-[#6E604A]">Info Teknis</summary>
                <div className="mt-1 break-words">{this.state.error?.toString()}</div>
              </details>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const VALID_TABS = ['dashboard', 'schedule', 'inventory', 'crm', 'reports', 'gold-prices'];

function getTabFromHash() {
  try {
    const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
    return VALID_TABS.includes(hash) ? hash : 'dashboard';
  } catch (e) {
    return 'dashboard';
  }
}

function MainApp() {
  const [activeTab, setActiveTabState] = useState(() => getTabFromHash());
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [quickSellItem, setQuickSellItem] = useState(null);

  // Sync state -> URL Hash
  const setActiveTab = (tab) => {
    if (VALID_TABS.includes(tab)) {
      if (window.location.hash !== `#/${tab}`) {
        window.location.hash = `#/${tab}`;
      }
      setActiveTabState(tab);
    }
  };

  // Sync URL Hash (Browser Back / Forward / Refresh / Link) -> State
  useEffect(() => {
    const handleHashChange = () => {
      const tab = getTabFromHash();
      setActiveTabState(tab);
    };

    // Set initial hash if missing
    if (!window.location.hash || !VALID_TABS.includes(window.location.hash.replace(/^#\/?/, ''))) {
      window.location.hash = `#/${activeTab}`;
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activeTab]);

  // Initialize DB with seed data if fresh
  useEffect(() => {
    // Ensure clean light mode
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
    try { localStorage.removeItem('jannah_gold_theme'); } catch (e) {}

    seedInitialData().catch(err => console.error('Seed error:', err));
  }, []);

  const handleQuickSell = (item) => {
    setQuickSellItem(item);
    setActiveTab('reports');
  };

  return (
    <div className="min-h-screen bg-[#F6F3EC] text-[#1B1814] flex flex-col font-sans">
      {/* Top Header with Quick Action Buttons */}
      <Header 
        onAddStock={() => setActiveTab('inventory')}
        onSellGold={() => setActiveTab('reports')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 pt-3 pb-16">
        {/* 1. Dashboard */}
        {activeTab === 'dashboard' && (
          <DashboardTab 
            onNavigateTab={setActiveTab} 
            onOpenPriceModal={() => setShowPriceModal(true)} 
            onOpenGoldPrices={() => setActiveTab('gold-prices')}
          />
        )}

        {/* 2. Jadwal (Schedule) */}
        {activeTab === 'schedule' && (
          <ScheduleTab />
        )}

        {/* 3. Stok (Inventory) */}
        {activeTab === 'inventory' && (
          <InventoryTab onQuickSell={handleQuickSell} />
        )}

        {/* 4. Pelanggan (CRM) */}
        {activeTab === 'crm' && (
          <CrmTab />
        )}

        {/* 5. Laporan Keuangan (Financial Report & Sales) */}
        {activeTab === 'reports' && (
          <FinancialReportTab 
            quickSellItem={quickSellItem} 
            onClearQuickSell={() => setQuickSellItem(null)} 
          />
        )}

        {/* 6. Harga Emas Acuan (Full table, all brands) */}
        {activeTab === 'gold-prices' && (
          <GoldPricesTab onBack={() => setActiveTab('dashboard')} />
        )}
      </main>

      {/* Bottom Navigation: [ Dashboard | Jadwal | Stok | Pelanggan | Keuangan ] */}
      <BottomNav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      {/* Gold Price Config Modal */}
      <GoldPriceModal 
        isOpen={showPriceModal} 
        onClose={() => setShowPriceModal(false)} 
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}
