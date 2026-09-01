import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { formatRupiah, formatRupiahJuta, formatGram, formatDateIndo, formatDateTimeIndo } from '../../services/calculationService';
import { 
  TrendingUp, 
  Layers, 
  Wallet, 
  ArrowUpRight, 
  ChevronRight, 
  MapPin, 
  Clock, 
  Calendar
} from 'lucide-react';
import Badge from '../common/Badge';

export default function DashboardTab({ onNavigateTab, onOpenPriceModal }) {
  const inventoryRaw = useLiveQuery(() => db.inventory.toArray(), []);
  const transactionsRaw = useLiveQuery(() => db.transactions.toArray(), []);
  const schedulesRaw = useLiveQuery(() => db.schedules.toArray(), []);
  const settingsRaw = useLiveQuery(() => db.settings.get('gold_price_live'), []);

  const inventory = Array.isArray(inventoryRaw) ? inventoryRaw : [];
  const transactions = Array.isArray(transactionsRaw) ? transactionsRaw : [];
  const schedules = Array.isArray(schedulesRaw) ? schedulesRaw : [];
  const settings = settingsRaw || {
    antam1g: 1455000,
    ubs1g: 1420000,
    buyback1g: 1330000
  };

  // 1. Ready Stock Metrics
  const readyInventory = inventory.filter(item => item && item.status === 'ready');
  const totalModalReady = readyInventory.reduce((acc, item) => acc + (Number(item?.totalBuyPrice) || 0), 0);
  const totalGramasiReady = readyInventory.reduce((acc, item) => acc + (Number(item?.weight) || 0), 0);

  // Market Valuation
  const avgMarketPrice = (Number(settings?.antam1g || 1455000) + Number(settings?.ubs1g || 1420000)) / 2;
  const estimasiValuasiPasar = totalGramasiReady * avgMarketPrice;

  // 2. All-time Net Profit
  const allTimeNetProfit = transactions.reduce((acc, tx) => acc + (Number(tx?.netProfit) || 0), 0);

  // 3. Recent Data for Display
  const latestInventory = [...inventory]
    .sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0))
    .slice(0, 3);

  const activeSchedules = schedules
    .filter(s => s && s.status !== 'completed')
    .slice(0, 2);

  return (
    <div className="space-y-4 pb-2">
      <div className="space-y-3.5">
        {/* 1. Core Financial 2x2 Bento Cards (Branded Luxury Gold) */}
          <div className="grid grid-cols-2 gap-3">
            {/* Card 1: Net Profit (Royal Gold Signature) */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-[#FFFDF8] via-[#FAF3DE] to-[#F2E3B8] border-2 border-[#D4AF37]/60 space-y-2 shadow-[0_4px_20px_rgba(212,175,55,0.12)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-extrabold text-[#876618] uppercase tracking-wider">Profit</span>
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
                <span className="text-xs font-mono font-extrabold text-[#946F22] uppercase tracking-wider">Stok</span>
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
                <span className="text-xs font-mono font-extrabold text-[#756447] uppercase tracking-wider">Modal</span>
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
                <span className="text-xs font-mono font-extrabold text-[#8A5F0C] uppercase tracking-wider">Valuasi</span>
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
                  Stok
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
                    <div className="space-y-0.5">
                      <div className="text-xs font-display font-bold text-[#1B1814] leading-tight">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-[#7A7264] font-mono">
                        {item.brand} • {formatGram(item.weight)} • {formatDateIndo(item.purchaseDate)}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
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
                  Jadwal
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
                  {formatRupiah(settings?.antam1g || 1455000).replace('Rp', '')}
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-[#F2EDE2] border border-[#E5DFD3]">
                <div className="text-[10px] font-mono text-[#8A816F]">UBS 1g</div>
                <div className="text-xs font-mono font-bold text-[#1B1814] mt-0.5 tabular-nums">
                  {formatRupiah(settings?.ubs1g || 1420000).replace('Rp', '')}
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-[#F2EDE2] border border-[#E5DFD3]">
                <div className="text-[10px] font-mono text-[#8A816F]">Buyback</div>
                <div className="text-xs font-mono font-bold text-[#1B1814] mt-0.5 tabular-nums">
                  {formatRupiah(settings?.buyback1g || 1330000).replace('Rp', '')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
