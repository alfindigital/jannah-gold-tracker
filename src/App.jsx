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

  handleReset = () => {
    try {
      localStorage.clear();
      window.location.reload();
    } catch (e) {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F6F3EC] text-[#1B1814] flex items-center justify-center p-6">
          <div className="max-w-sm w-full bg-[#FAF8F5] border-2 border-[#D4AF37]/50 rounded-3xl p-6 shadow-xl text-center space-y-4">
            <div className="w-12 h-12 bg-[#FAF2DA] text-[#946F22] rounded-2xl flex items-center justify-center mx-auto text-xl font-bold">
              !
            </div>
            <h1 className="text-base font-display font-black text-[#1B1814]">Terjadi Kendala Teknis</h1>
            <p className="text-xs text-[#7A7264] leading-relaxed">
              Aplikasi mengalami pembaruan sistem. Silakan klik tombol di bawah untuk memuat ulang aplikasi.
            </p>
            <button
              onClick={this.handleReset}
              className="w-full py-3 bg-[#1B1814] text-[#E5C378] font-display font-bold text-xs rounded-2xl shadow-md active:scale-95 transition-all"
            >
              Muat Ulang Aplikasi
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function MainApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [quickSellItem, setQuickSellItem] = useState(null);

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
