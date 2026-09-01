import React from 'react';
import { Plus, ArrowRightLeft } from 'lucide-react';

export default function Header({ onAddStock, onSellGold }) {
  return (
    <header className="sticky top-0 z-30 bg-[#F6F3EC]/90 backdrop-blur-md border-b border-[#E5DFD3]">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="text-base font-display font-black tracking-wider text-[#1B1814] uppercase">
          Jannah Gold
        </h1>

        {/* Quick Action Icon Buttons at the Top */}
        <div className="flex items-center gap-2">
          <button
            onClick={onAddStock}
            className="w-8 h-8 rounded-xl bg-[#1B1814] text-[#E5C378] flex items-center justify-center hover:bg-[#2B2317] active-press shadow-xs ring-1 ring-[#D4AF37]/50 transition-all"
            title="Beli / Tambah Stok"
          >
            <Plus className="w-4 h-4 stroke-[2.8]" />
          </button>
          <button
            onClick={onSellGold}
            className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FAF3DE] to-[#F2E3B8] text-[#876618] border border-[#D4AF37]/70 flex items-center justify-center hover:bg-[#F2E3B8] active-press shadow-xs transition-all"
            title="Jual Emas"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 stroke-[2.8]" />
          </button>
        </div>
      </div>
    </header>
  );
}
