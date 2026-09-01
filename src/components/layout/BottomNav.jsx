import React from 'react';
import { LayoutDashboard, Calendar, Layers, Receipt } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab }) {
  // Urutan: Dashboard -> Jadwal -> Stok -> Laporan Keuangan
  const tabs = [
    {
      id: 'dashboard',
      icon: LayoutDashboard,
      title: 'Dashboard'
    },
    {
      id: 'schedule',
      icon: Calendar,
      title: 'Jadwal'
    },
    {
      id: 'inventory',
      icon: Layers,
      title: 'Stok'
    },
    {
      id: 'reports',
      icon: Receipt,
      title: 'Laporan Keuangan'
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#F6F3EC]/95 backdrop-blur-lg border-t border-[#E5DFD3] py-3 pb-safe transition-colors duration-150">
      <div className="max-w-xs mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              title={tab.title}
              aria-label={tab.title}
              className={`p-3 rounded-2xl transition-all active-press ${
                isActive
                  ? 'text-[#F6F3EC] bg-[#1B1814] shadow-md ring-1 ring-[#C59A3F]/30'
                  : 'text-[#8A8274] hover:text-[#1B1814]'
              }`}
            >
              <Icon 
                className={`w-6 h-6 ${
                  isActive 
                    ? 'stroke-[2.4] text-[#DFC28F]' 
                    : 'stroke-[1.75]'
                }`} 
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
