import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { formatRupiah, formatRupiahJuta, formatGram, formatDateIndo, formatDateTimeIndo } from '../../services/calculationService';
import { exportFinancialReportToExcel } from '../../services/exportService';
import { 
  TrendingUp, 
  Layers, 
  Wallet, 
  ArrowUpRight, 
  ChevronRight, 
  MapPin, 
  Clock, 
  Plus, 
  ArrowRightLeft,
  Calendar,
  Receipt,
  Download,
  Scale,
  Coins
} from 'lucide-react';
import Badge from '../common/Badge';

export default function DashboardTab({ onNavigateTab, onOpenPriceModal }) {
  const [dashboardView, setDashboardView] = useState('summary'); // 'summary' | 'pnl' | 'balance'
  const [pnlPeriod, setPnlPeriod] = useState('all'); // 'all' | 'this_month'

  const inventory = useLiveQuery(() => db.inventory.toArray(), []) || [];
  const transactions = useLiveQuery(() => db.transactions.toArray(), []) || [];
  const schedules = useLiveQuery(() => db.schedules.toArray(), []) || [];
  const settings = useLiveQuery(() => db.settings.get('gold_price_live'), []) || {
    antam1g: 1455000,
    ubs1g: 1420000,
    buyback1g: 1330000
  };

  // 1. Ready Stock Metrics
  const readyInventory = inventory.filter(item => item.status === 'ready');
  const bookedInventory = inventory.filter(item => item.status === 'booked');
  const totalModalReady = readyInventory.reduce((acc, item) => acc + (Number(item.totalBuyPrice) || 0), 0);
  const totalGramasiReady = readyInventory.reduce((acc, item) => acc + (Number(item.weight) || 0), 0);

  // Market Valuation
  const avgMarketPrice = (Number(settings.antam1g || 1455000) + Number(settings.ubs1g || 1420000)) / 2;
  const estimasiValuasiPasar = totalGramasiReady * avgMarketPrice;

  // 2. Filtered Transactions for PnL
  const currentMonthPrefix = new Date().toISOString().slice(0, 7);
  const filteredTransactions = transactions.filter(tx => {
    if (pnlPeriod === 'this_month') {
      return tx.saleDate && tx.saleDate.startsWith(currentMonthPrefix);
    }
    return true;
  });

  // Waterfall Metrics for Filtered Period
  const totalOmset = filteredTransactions.reduce((acc, tx) => acc + (Number(tx.sellPrice) || 0), 0);
  const totalHpp = filteredTransactions.reduce((acc, tx) => acc + (Number(tx.costPrice) || 0), 0);
  const totalGrossProfit = filteredTransactions.reduce((acc, tx) => acc + (Number(tx.grossProfit) || 0), 0);
  const totalOperational = filteredTransactions.reduce((acc, tx) => acc + (Number(tx.operationalFee) || 0), 0);
  const totalNetProfit = filteredTransactions.reduce((acc, tx) => acc + (Number(tx.netProfit) || 0), 0);
  const totalGramsSold = filteredTransactions.reduce((acc, tx) => acc + (Number(tx.weight) || 0), 0);

  const avgProfitPerGram = totalGramsSold > 0 ? totalNetProfit / totalGramsSold : 0;
  const netMarginPercent = totalOmset > 0 ? ((totalNetProfit / totalOmset) * 100).toFixed(1) : 0;

  // 3. All-time Metrics (for Summary Bento Cards & Balance Sheet)
  const allTimeOmset = transactions.reduce((acc, tx) => acc + (Number(tx.sellPrice) || 0), 0);
  const allTimeOp = transactions.reduce((acc, tx) => acc + (Number(tx.operationalFee) || 0), 0);
  const allTimeNetProfit = transactions.reduce((acc, tx) => acc + (Number(tx.netProfit) || 0), 0);

  // Balance Sheet Metrics
  const totalKasTerkumpul = allTimeOmset - allTimeOp;
  const totalAsetUsaha = totalKasTerkumpul + totalModalReady;
  const totalEkuitas = totalModalReady + allTimeNetProfit;

  // 4. Recent Data for Display
  const latestInventory = [...inventory]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 3);

  const activeSchedules = schedules
    .filter(s => s.status !== 'completed')
    .slice(0, 2);

  const handleExportExcel = () => {
    exportFinancialReportToExcel({
      transactions,
      inventory,
      settings,
      reportType: dashboardView
    });
  };

  return (
    <div className="space-y-4 pb-2">
      {/* Top Segment Tabs: Ringkasan | Laba Rugi | Neraca */}
      <div className="grid grid-cols-3 p-1.5 bg-[#EAE2D2] rounded-2xl font-display font-bold text-xs border border-[#DDD3BF]">
        <button
          onClick={() => setDashboardView('summary')}
          className={`py-2 rounded-xl transition-all ${
            dashboardView === 'summary'
              ? 'bg-[#1B1814] text-[#E5C378] shadow-md ring-1 ring-[#D4AF37]/60'
              : 'text-[#6E604A] hover:text-[#1B1814]'
          }`}
        >
          Ringkasan
        </button>
        <button
          onClick={() => setDashboardView('pnl')}
          className={`py-2 rounded-xl transition-all ${
            dashboardView === 'pnl'
              ? 'bg-[#1B1814] text-[#E5C378] shadow-md ring-1 ring-[#D4AF37]/60'
              : 'text-[#6E604A] hover:text-[#1B1814]'
          }`}
        >
          Laba Rugi
        </button>
        <button
          onClick={() => setDashboardView('balance')}
          className={`py-2 rounded-xl transition-all ${
            dashboardView === 'balance'
              ? 'bg-[#1B1814] text-[#E5C378] shadow-md ring-1 ring-[#D4AF37]/60'
              : 'text-[#6E604A] hover:text-[#1B1814]'
          }`}
        >
          Neraca
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. VIEW: RINGKASAN DASHBOARD                                              */}
      {/* ========================================================================= */}
      {dashboardView === 'summary' && (
        <div className="space-y-3.5">
          {/* 1. Core Financial 2x2 Bento Cards (Branded Luxury Gold) */}
          <div className="grid grid-cols-2 gap-3">
            {/* Card 1: Net Profit (Royal Gold Signature) */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-[#FFFDF8] via-[#FAF3DE] to-[#F2E3B8] border-2 border-[#D4AF37]/60 space-y-2 shadow-[0_4px_20px_rgba(212,175,55,0.12)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-extrabold text-[#876618] uppercase tracking-wider">Laba Bersih</span>
                <div className="p-1.5 rounded-xl bg-[#E8C66B]/30 text-[#876618]">
                  <TrendingUp className="w-4 h-4 stroke-[2.8]" />
                </div>
              </div>
              <div className="text-2xl font-display font-black text-[#1A160F] tracking-tight tabular-nums">
                {formatRupiahJuta(allTimeNetProfit)}
              </div>
            </div>

            {/* Card 2: Total Ready Stock (Champagne Gold Bullion) */}
            <div 
              onClick={() => onNavigateTab('inventory')}
              className="p-4 rounded-3xl bg-gradient-to-br from-[#FFFDFB] via-[#FAF5EA] to-[#F3EAD7] border-2 border-[#D8BC86]/70 space-y-2 shadow-[0_4px_16px_rgba(197,154,63,0.10)] cursor-pointer hover:border-[#B88E33] transition-all active-press"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-extrabold text-[#946F22] uppercase tracking-wider">Stok Ready</span>
                <div className="p-1.5 rounded-xl bg-[#E8D1A0]/35 text-[#946F22]">
                  <Layers className="w-4 h-4 stroke-[2.8]" />
                </div>
              </div>
              <div className="text-2xl font-display font-black text-[#1A160F] tracking-tight tabular-nums">
                {formatGram(totalGramasiReady)}
              </div>
            </div>

            {/* Card 3: Capital Invested (Sand Gold Reserve) */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-[#FCFBF8] via-[#F6F2E7] to-[#EBE4D2] border-2 border-[#C9B996]/70 space-y-2 shadow-[0_4px_16px_rgba(138,114,64,0.08)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-extrabold text-[#756447] uppercase tracking-wider">Modal Beli</span>
                <div className="p-1.5 rounded-xl bg-[#DECFA9]/35 text-[#756447]">
                  <Wallet className="w-4 h-4 stroke-[2.8]" />
                </div>
              </div>
              <div className="text-2xl font-display font-black text-[#1A160F] tracking-tight tabular-nums">
                {formatRupiahJuta(totalModalReady)}
              </div>
            </div>

            {/* Card 4: Market Valuation (Imperial Gold Luster) */}
            <div 
              onClick={onOpenPriceModal}
              className="p-4 rounded-3xl bg-gradient-to-br from-[#FFFDF5] via-[#FCF2D2] to-[#F8E5A7] border-2 border-[#E8BF48]/80 space-y-2 shadow-[0_4px_20px_rgba(232,191,72,0.18)] cursor-pointer hover:border-[#C79718] transition-all active-press"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-extrabold text-[#8A5F0C] uppercase tracking-wider">Valuasi Pasar</span>
                <div className="p-1.5 rounded-xl bg-[#FCE389]/45 text-[#8A5F0C]">
                  <ArrowUpRight className="w-4 h-4 stroke-[2.8]" />
                </div>
              </div>
              <div className="text-2xl font-display font-black text-[#1A160F] tracking-tight tabular-nums">
                {formatRupiahJuta(estimasiValuasiPasar)}
              </div>
            </div>
          </div>

          {/* 2. Recent Stock */}
          <div className="p-4 rounded-3xl bg-[#FAF8F5] border border-[#E5DFD3] space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#A27B2C] stroke-[2.2]" />
                <h2 className="text-xs font-display font-bold uppercase tracking-wider text-[#1B1814]">
                  Stok Terbaru
                </h2>
              </div>
              <button
                onClick={() => onNavigateTab('inventory')}
                className="p-1 rounded-lg hover:bg-[#EBE5D8] transition-colors text-[#7A7264]"
                title="Lihat Semua Stok"
              >
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {latestInventory.length === 0 ? (
              <div className="py-2 text-center text-xs text-[#8A816F] font-mono">
                Belum ada stok tercatat
              </div>
            ) : (
              <div className="space-y-2">
                {latestInventory.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onNavigateTab('inventory')}
                    className="flex items-center justify-between p-3 rounded-2xl bg-[#F2EDE2] border border-[#E5DFD3] hover:border-[#C59A3F]/50 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#EBE5D8] flex items-center justify-center font-mono font-bold text-xs text-[#1B1814] border border-[#DDD5C5]">
                        {formatGram(item.weight)}
                      </div>
                      <div>
                        <div className="text-xs font-display font-bold text-[#1B1814] leading-tight">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-[#7A7264] font-mono">
                          {item.brand} • {formatDateIndo(item.purchaseDate)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge status={item.status} />
                      <div className="text-xs font-mono font-bold text-[#1B1814] mt-1 tabular-nums">
                        {formatRupiahJuta(item.totalBuyPrice)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Delivery Schedule */}
          <div className="p-4 rounded-3xl bg-[#FAF8F5] border border-[#E5DFD3] space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#A27B2C] stroke-[2.2]" />
                <h2 className="text-xs font-display font-bold uppercase tracking-wider text-[#1B1814]">
                  Jadwal Agenda
                </h2>
              </div>
              <button
                onClick={() => onNavigateTab('schedule')}
                className="p-1 rounded-lg hover:bg-[#EBE5D8] transition-colors text-[#7A7264]"
                title="Lihat Semua Jadwal"
              >
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {activeSchedules.length === 0 ? (
              <div className="py-2 text-center text-xs text-[#8A816F] font-mono">
                Belum ada jadwal aktif
              </div>
            ) : (
              <div className="space-y-2">
                {activeSchedules.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onNavigateTab('schedule')}
                    className="flex items-center justify-between p-3 rounded-2xl bg-[#F2EDE2] border border-[#E5DFD3] hover:border-[#C59A3F]/50 transition-all cursor-pointer"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-display font-bold text-[#1B1814]">
                          {(item.title || '').replace(/^Jadwal\s+/i, '').replace(/^COD\s+/i, '')}
                        </span>
                        <Badge status={item.status} />
                      </div>
                      <div className="text-[11px] text-[#7A7264] flex items-center gap-3 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 stroke-[2]" />
                          {formatDateTimeIndo(item.date, item.time)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 stroke-[2]" />
                          {item.location}
                        </span>
                      </div>
                    </div>

                    {item.targetAmount > 0 && (
                      <div className="text-right font-mono font-bold text-xs text-[#1B1814] tabular-nums">
                        {formatRupiahJuta(item.targetAmount)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. Gold Benchmark Price */}
          <div className="p-4 rounded-3xl bg-[#FAF8F5] border border-[#E5DFD3] space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-display font-bold uppercase tracking-wider text-[#1B1814]">
                Harga Emas
              </h2>
              <button
                onClick={onOpenPriceModal}
                className="text-[11px] font-mono font-semibold text-[#A27B2C] hover:underline"
              >
                Ubah
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-2xl bg-[#F2EDE2] border border-[#E5DFD3]">
                <div className="text-[10px] font-mono text-[#8A816F]">Antam 1g</div>
                <div className="text-xs font-mono font-bold text-[#1B1814] mt-0.5 tabular-nums">
                  {formatRupiah(settings.antam1g).replace('Rp', '')}
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-[#F2EDE2] border border-[#E5DFD3]">
                <div className="text-[10px] font-mono text-[#8A816F]">UBS 1g</div>
                <div className="text-xs font-mono font-bold text-[#1B1814] mt-0.5 tabular-nums">
                  {formatRupiah(settings.ubs1g).replace('Rp', '')}
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-[#F2EDE2] border border-[#E5DFD3]">
                <div className="text-[10px] font-mono text-[#8A816F]">Buyback</div>
                <div className="text-xs font-mono font-bold text-[#1B1814] mt-0.5 tabular-nums">
                  {formatRupiah(settings.buyback1g).replace('Rp', '')}
                </div>
              </div>
            </div>
          </div>

          {/* 5. Action Buttons (Branded Gold & Tactile) */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onNavigateTab('inventory')}
              className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#1B1814] to-[#2B2317] text-[#FAF8F5] text-xs font-display font-bold hover:from-[#2B2317] hover:to-[#382E1E] active-press transition-all shadow-sm ring-2 ring-[#D4AF37]/50"
            >
              <Plus className="w-4 h-4 stroke-[2.8] text-[#E5C378]" />
              <span className="text-[#FAF8F5]">Beli Stok</span>
            </button>

            <button
              onClick={() => onNavigateTab('reports')}
              className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-gradient-to-br from-[#FFFDF8] via-[#FAF3DE] to-[#F2E3B8] text-[#1B1814] border-2 border-[#D4AF37]/70 text-xs font-display font-bold hover:border-[#D4AF37] active-press transition-all shadow-sm"
            >
              <ArrowRightLeft className="w-4 h-4 stroke-[2.8] text-[#876618]" />
              <span>Jual Emas</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. VIEW: LABA RUGI (PROFIT & LOSS)                                        */}
      {/* ========================================================================= */}
      {dashboardView === 'pnl' && (
        <div className="space-y-3.5">
          {/* Period Filter & Excel Export */}
          <div className="flex items-center justify-between">
            <div className="flex bg-[#EBE5D8] p-1 rounded-2xl text-xs font-display font-bold">
              <button
                onClick={() => setPnlPeriod('all')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  pnlPeriod === 'all'
                    ? 'bg-[#1B1814] text-[#E5C378] shadow-xs'
                    : 'text-[#7A7264] hover:text-[#1B1814]'
                }`}
              >
                Semua Periode
              </button>
              <button
                onClick={() => setPnlPeriod('this_month')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  pnlPeriod === 'this_month'
                    ? 'bg-[#1B1814] text-[#E5C378] shadow-xs'
                    : 'text-[#7A7264] hover:text-[#1B1814]'
                }`}
              >
                Bulan Ini
              </button>
            </div>

            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#1B1814] text-[#DFC28F] rounded-2xl text-xs font-display font-bold hover:bg-[#2E2820] active-press shadow-xs ring-1 ring-[#C59A3F]/30"
              title="Unduh Laporan Excel"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Excel</span>
            </button>
          </div>

          {/* Highlight Net Profit Card */}
          <div className="p-5 rounded-3xl bg-[#1B1814] text-[#FAF8F5] space-y-1.5 shadow-md ring-1 ring-[#C59A3F]/30">
            <div className="text-[11px] font-mono tracking-wider uppercase text-[#DFC28F]">
              Laba Bersih ({pnlPeriod === 'this_month' ? 'Bulan Ini' : 'Semua Transaksi'})
            </div>
            <div className="text-3xl font-display font-extrabold tabular-nums tracking-tight text-[#FAF8F5]">
              +{formatRupiahJuta(totalNetProfit)}
            </div>
            <div className="text-xs font-mono text-[#B8AF9F] pt-1 flex items-center gap-3">
              <span>Margin: {netMarginPercent}%</span>
              <span>•</span>
              <span>{filteredTransactions.length} Transaksi</span>
            </div>
          </div>

          {/* Step-by-Step Waterfall Calculation */}
          <div className="p-4 rounded-3xl bg-[#FAF8F5] border border-[#E5DFD3] space-y-3 shadow-xs">
            <div className="flex items-center gap-2 border-b border-[#E5DFD3] pb-2.5">
              <Receipt className="w-4 h-4 text-[#A27B2C] stroke-[2.2]" />
              <h3 className="text-xs font-display font-bold uppercase tracking-wider text-[#1B1814]">
                Rincian Pendapatan
              </h3>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              {/* Revenue */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F2EDE2]">
                <div>
                  <div className="font-bold text-[#1B1814]">Total Penjualan (Omset)</div>
                  <div className="text-[10px] text-[#8A816F]">Penerimaan bruto dari pembeli</div>
                </div>
                <div className="font-bold text-[#1B1814] tabular-nums">
                  {formatRupiahJuta(totalOmset)}
                </div>
              </div>

              {/* COGS */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F2EDE2]">
                <div>
                  <div className="font-bold text-[#1B1814]">Harga Pokok Penjualan (HPP)</div>
                  <div className="text-[10px] text-[#8A816F]">Modal beli barang yang terjual</div>
                </div>
                <div className="font-bold text-rose-700 tabular-nums">
                  - {formatRupiahJuta(totalHpp)}
                </div>
              </div>

              {/* Gross Profit */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#EBE5D8] border border-[#DDD5C5] font-bold">
                <div className="text-[#1B1814]">
                  Laba Kotor
                </div>
                <div className="text-[#1B1814] tabular-nums">
                  {formatRupiahJuta(totalGrossProfit)}
                </div>
              </div>

              {/* Operational & Delivery Fee */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F2EDE2]">
                <div>
                  <div className="font-bold text-[#1B1814]">Biaya Operasional & Kurir</div>
                  <div className="text-[10px] text-[#8A816F]">Ongkir, bensin COD & admin</div>
                </div>
                <div className="font-bold text-rose-700 tabular-nums">
                  - {formatRupiah(totalOperational)}
                </div>
              </div>

              {/* Final Net Profit */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#EAF3EA] border border-[#C2E0C7] font-bold text-sm">
                <div className="text-[#1E5C27]">
                  Laba Bersih Akhir
                </div>
                <div className="text-[#1E5C27] tabular-nums font-extrabold">
                  +{formatRupiahJuta(totalNetProfit)}
                </div>
              </div>
            </div>
          </div>

          {/* Efficiency Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-3xl bg-[#FAF8F5] border border-[#E5DFD3] space-y-1 shadow-xs">
              <div className="text-[10px] font-mono text-[#8A816F] uppercase">Total Terjual</div>
              <div className="text-lg font-display font-extrabold text-[#1B1814] tabular-nums">
                {formatGram(totalGramsSold)}
              </div>
              <div className="text-[10px] text-[#8A816F] font-mono">Emas fisik keluar</div>
            </div>

            <div className="p-4 rounded-3xl bg-[#FAF8F5] border border-[#E5DFD3] space-y-1 shadow-xs">
              <div className="text-[10px] font-mono text-[#8A816F] uppercase">Rata-rata Laba / Gram</div>
              <div className="text-lg font-display font-extrabold text-[#1B1814] tabular-nums">
                {formatRupiah(avgProfitPerGram).replace('Rp', 'Rp ')}
              </div>
              <div className="text-[10px] text-[#8A816F] font-mono">Margin per 1 gram</div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. VIEW: NERACA (BALANCE SHEET & POSISI KEUANGAN)                          */}
      {/* ========================================================================= */}
      {dashboardView === 'balance' && (
        <div className="space-y-3.5">
          {/* Header & Export Excel */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-[#7A7264]">
              Posisi Keuangan Usaha
            </span>
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#1B1814] text-[#DFC28F] rounded-2xl text-xs font-display font-bold hover:bg-[#2E2820] active-press shadow-xs ring-1 ring-[#C59A3F]/30"
              title="Unduh Laporan Excel"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Excel</span>
            </button>
          </div>

          {/* Total Net Worth Card */}
          <div className="p-5 rounded-3xl bg-[#1B1814] text-[#FAF8F5] space-y-1.5 shadow-md ring-1 ring-[#C59A3F]/30">
            <div className="text-[11px] font-mono tracking-wider uppercase text-[#DFC28F]">
              Total Ekuitas Bisnis (Aset Bersih)
            </div>
            <div className="text-3xl font-display font-extrabold tabular-nums tracking-tight text-[#FAF8F5]">
              {formatRupiahJuta(totalAsetUsaha)}
            </div>
            <div className="text-xs font-mono text-[#B8AF9F] pt-1">
              Kas Hasil Penjualan + Modal Stok Aktif
            </div>
          </div>

          {/* Section 1: Aset Lancar */}
          <div className="p-4 rounded-3xl bg-[#FAF8F5] border border-[#E5DFD3] space-y-3 shadow-xs">
            <div className="flex items-center gap-2 border-b border-[#E5DFD3] pb-2.5">
              <Coins className="w-4 h-4 text-[#A27B2C] stroke-[2.2]" />
              <h3 className="text-xs font-display font-bold uppercase tracking-wider text-[#1B1814]">
                1. Aset Lancar
              </h3>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-[#F2EDE2] flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#1B1814]">Kas Terkumpul dari Penjualan</div>
                  <div className="text-[10px] text-[#8A816F]">Total omset diterima - biaya kurir</div>
                </div>
                <div className="font-bold text-[#1B1814] tabular-nums">
                  {formatRupiahJuta(totalKasTerkumpul)}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#F2EDE2] flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#1B1814]">Nilai Persediaan (Sesuai Modal)</div>
                  <div className="text-[10px] text-[#8A816F]">{readyInventory.length} item ({formatGram(totalGramasiReady)})</div>
                </div>
                <div className="font-bold text-[#1B1814] tabular-nums">
                  {formatRupiahJuta(totalModalReady)}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#F2EDE2] flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#1B1814]">Nilai Pasar Emas Saat Ini</div>
                  <div className="text-[10px] text-[#8A816F]">Jika seluruh stok dijual di harga hari ini</div>
                </div>
                <div className="font-bold text-[#1B1814] tabular-nums">
                  {formatRupiahJuta(estimasiValuasiPasar)}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#EBE5D8] border border-[#DDD5C5] flex items-center justify-between font-bold">
                <span className="text-[#1B1814]">Total Aset Lancar (Kas + Modal Stok):</span>
                <span className="text-[#1B1814] text-sm tabular-nums">
                  {formatRupiahJuta(totalAsetUsaha)}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Ekuitas & Modal */}
          <div className="p-4 rounded-3xl bg-[#FAF8F5] border border-[#E5DFD3] space-y-3 shadow-xs">
            <div className="flex items-center gap-2 border-b border-[#E5DFD3] pb-2.5">
              <Scale className="w-4 h-4 text-[#A27B2C] stroke-[2.2]" />
              <h3 className="text-xs font-display font-bold uppercase tracking-wider text-[#1B1814]">
                2. Ekuitas & Pertumbuhan Bisnis
              </h3>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-[#F2EDE2] flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#1B1814]">Modal Stok Aktif</div>
                  <div className="text-[10px] text-[#8A816F]">Modal yang tertanam pada emas ready</div>
                </div>
                <div className="font-bold text-[#1B1814] tabular-nums">
                  {formatRupiahJuta(totalModalReady)}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#F2EDE2] flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#1B1814]">Akumulasi Laba Bersih</div>
                  <div className="text-[10px] text-[#8A816F]">Total profit yang telah dihasilkan</div>
                </div>
                <div className="font-bold text-[#1E5C27] tabular-nums">
                  +{formatRupiahJuta(allTimeNetProfit)}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#EBE5D8] border border-[#DDD5C5] flex items-center justify-between font-bold">
                <span className="text-[#1B1814]">Total Ekuitas Bersih:</span>
                <span className="text-[#1B1814] text-sm tabular-nums">
                  {formatRupiahJuta(totalEkuitas)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
