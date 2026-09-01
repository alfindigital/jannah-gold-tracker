import React, { useState, useEffect } from 'react';
import { seedInitialData } from './db/seed';

// Layout
import Header from './components/layout/Header';
import BottomNav from './components/layout/BottomNav';

// Tabs
import DashboardTab from './components/dashboard/DashboardTab';
import ScheduleTab from './components/schedule/ScheduleTab';
import InventoryTab from './components/inventory/InventoryTab';
import FinancialReportTab from './components/reports/FinancialReportTab';

// Modals
import GoldPriceModal from './components/dashboard/GoldPriceModal';

export default function App() {
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
      {/* Top Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 pt-4 pb-24">
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

        {/* 4. Laporan Keuangan (Financial Report & Sales/CRM) */}
        {activeTab === 'reports' && (
          <FinancialReportTab 
            quickSellItem={quickSellItem} 
            onClearQuickSell={() => setQuickSellItem(null)} 
          />
        )}
      </main>

      {/* Bottom Navigation: [ Dashboard | Jadwal | Stok | Laporan Keuangan ] */}
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
