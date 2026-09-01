import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { formatRupiah, formatRupiahJuta, formatGram, formatDateIndo, calculateNetProfit, getCleanPhoneNumber } from '../../services/calculationService';
import { exportFinancialReportToExcel } from '../../services/exportService';
import { 
  Download, 
  Receipt, 
  Scale, 
  Coins, 
  ArrowRightLeft, 
  Users, 
  MessageSquare,
  Plus,
  UserPlus
} from 'lucide-react';
import Modal from '../common/Modal';

export default function FinancialReportTab({ quickSellItem, onClearQuickSell }) {
  const [reportSubTab, setReportSubTab] = useState('pnl'); // 'pnl' | 'balance' | 'sales' | 'customers'
  const [pnlPeriod, setPnlPeriod] = useState('all'); // 'all' | 'this_month'
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  const inventory = useLiveQuery(() => db.inventory.toArray(), []) || [];
  const transactions = useLiveQuery(() => db.transactions.toArray(), []) || [];
  const customers = useLiveQuery(() => db.customers.toArray(), []) || [];
  const settings = useLiveQuery(() => db.settings.get('gold_price_live'), []) || {
    antam1g: 1455000,
    ubs1g: 1420000,
    buyback1g: 1330000
  };

  const readyInventory = inventory.filter(item => item.status === 'ready');
  const totalModalReady = readyInventory.reduce((acc, item) => acc + (Number(item.totalBuyPrice) || 0), 0);
  const totalGramasiReady = readyInventory.reduce((acc, item) => acc + (Number(item.weight) || 0), 0);
  const avgMarketPrice = (Number(settings.antam1g || 1455000) + Number(settings.ubs1g || 1420000)) / 2;
  const estimasiValuasiPasar = totalGramasiReady * avgMarketPrice;

  // Filtered Transactions for PnL
  const currentMonthPrefix = new Date().toISOString().slice(0, 7);
  const filteredTransactions = transactions.filter(tx => {
    if (pnlPeriod === 'this_month') {
      return tx.saleDate && tx.saleDate.startsWith(currentMonthPrefix);
    }
    return true;
  });

  const totalOmset = filteredTransactions.reduce((acc, tx) => acc + (Number(tx.sellPrice) || 0), 0);
  const totalHpp = filteredTransactions.reduce((acc, tx) => acc + (Number(tx.costPrice) || 0), 0);
  const totalGrossProfit = filteredTransactions.reduce((acc, tx) => acc + (Number(tx.grossProfit) || 0), 0);
  const totalOperational = filteredTransactions.reduce((acc, tx) => acc + (Number(tx.operationalFee) || 0), 0);
  const totalNetProfit = filteredTransactions.reduce((acc, tx) => acc + (Number(tx.netProfit) || 0), 0);
  const totalGramsSold = filteredTransactions.reduce((acc, tx) => acc + (Number(tx.weight) || 0), 0);

  const avgProfitPerGram = totalGramsSold > 0 ? totalNetProfit / totalGramsSold : 0;
  const netMarginPercent = totalOmset > 0 ? ((totalNetProfit / totalOmset) * 100).toFixed(1) : 0;

  // Balance Sheet Metrics
  const allTimeOmset = transactions.reduce((acc, tx) => acc + (Number(tx.sellPrice) || 0), 0);
  const allTimeOp = transactions.reduce((acc, tx) => acc + (Number(tx.operationalFee) || 0), 0);
  const allTimeNetProfit = transactions.reduce((acc, tx) => acc + (Number(tx.netProfit) || 0), 0);
  const totalKasTerkumpul = allTimeOmset - allTimeOp;
  const totalAsetUsaha = totalKasTerkumpul + totalModalReady;
  const totalEkuitas = totalModalReady + allTimeNetProfit;

  // Sale & Customer Form State
  const [saleForm, setSaleForm] = useState({
    inventoryId: '',
    customerId: '',
    customerName: '',
    customerPhone: '',
    saleDate: new Date().toISOString().split('T')[0],
    sellPrice: 0,
    operationalFee: 0,
    paymentMethod: 'Cash COD',
    notes: ''
  });

  const [custForm, setCustForm] = useState({
    name: '',
    phone: '',
    address: '',
    notes: ''
  });

  const selectedInventoryItem = inventory.find(i => i.id === Number(saleForm.inventoryId));
  const currentCost = selectedInventoryItem ? Number(selectedInventoryItem.totalBuyPrice) : 0;
  const currentWeight = selectedInventoryItem ? Number(selectedInventoryItem.weight) : 0;
  const profitMetrics = calculateNetProfit(saleForm.sellPrice, currentCost, saleForm.operationalFee);

  const handleSaveSale = async (e) => {
    e.preventDefault();
    if (!selectedInventoryItem) {
      alert('Silakan pilih stok emas yang akan dijual');
      return;
    }

    let customerId = saleForm.customerId ? Number(saleForm.customerId) : null;
    let customerName = saleForm.customerName;
    let customerPhone = saleForm.customerPhone;

    if (customerId) {
      const cust = customers.find(c => c.id === customerId);
      if (cust) {
        customerName = cust.name;
        customerPhone = cust.phone;
        await db.customers.update(customerId, {
          totalTransactions: (cust.totalTransactions || 0) + 1,
          totalGramsBought: (cust.totalGramsBought || 0) + currentWeight
        });
      }
    } else if (customerName) {
      customerId = await db.customers.add({
        name: customerName,
        phone: customerPhone || '',
        address: '',
        totalTransactions: 1,
        totalGramsBought: currentWeight,
        notes: 'Dibuat otomatis dari transaksi penjualan',
        createdAt: new Date().toISOString()
      });
    }

    await db.transactions.add({
      inventoryId: selectedInventoryItem.id,
      itemTitle: selectedInventoryItem.title,
      weight: currentWeight,
      customerId: customerId,
      customerName: customerName || 'Pembeli',
      customerPhone: customerPhone || '',
      saleDate: saleForm.saleDate,
      costPrice: currentCost,
      sellPrice: Number(saleForm.sellPrice),
      operationalFee: Number(saleForm.operationalFee) || 0,
      grossProfit: profitMetrics.grossProfit,
      netProfit: profitMetrics.netProfit,
      paymentMethod: saleForm.paymentMethod,
      notes: saleForm.notes,
      createdAt: new Date().toISOString()
    });

    await db.inventory.update(selectedInventoryItem.id, {
      status: 'sold'
    });

    setShowSaleModal(false);
  };

  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    await db.customers.add({
      name: custForm.name,
      phone: custForm.phone,
      address: custForm.address,
      totalTransactions: 0,
      totalGramsBought: 0,
      notes: custForm.notes,
      createdAt: new Date().toISOString()
    });
    setCustForm({ name: '', phone: '', address: '', notes: '' });
    setShowCustomerModal(false);
  };

  const openWhatsApp = (phone, name = '') => {
    const cleanPhone = getCleanPhoneNumber(phone);
    if (!cleanPhone) {
      alert('Nomor WhatsApp belum diisi');
      return;
    }
    const greeting = encodeURIComponent(`Halo ${name || ''}, salam dari Jannah Gold...`);
    window.open(`https://wa.me/${cleanPhone}?text=${greeting}`, '_blank');
  };

  const handleExportExcel = () => {
    exportFinancialReportToExcel({
      transactions,
      inventory,
      settings,
      reportType: reportSubTab
    });
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-display font-extrabold text-[#1B1814] tracking-tight">
          Laporan Keuangan
        </h2>
        <button
          onClick={handleExportExcel}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#1B1814] text-[#DFC28F] rounded-2xl text-xs font-display font-bold hover:bg-[#2E2820] active-press shadow-xs ring-1 ring-[#C59A3F]/30"
          title="Unduh Laporan Excel"
        >
          <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Excel</span>
        </button>
      </div>

      {/* Segment Tabs: Laba Rugi | Neraca | Penjualan | Pelanggan */}
      <div className="grid grid-cols-4 p-1.5 bg-[#EAE2D2] rounded-2xl font-display font-bold text-xs border border-[#DDD3BF]">
        <button
          onClick={() => setReportSubTab('pnl')}
          className={`py-2 rounded-xl transition-all ${
            reportSubTab === 'pnl'
              ? 'bg-[#1B1814] text-[#E5C378] shadow-md ring-1 ring-[#D4AF37]/60'
              : 'text-[#6E604A] hover:text-[#1B1814]'
          }`}
        >
          Laba Rugi
        </button>
        <button
          onClick={() => setReportSubTab('balance')}
          className={`py-2 rounded-xl transition-all ${
            reportSubTab === 'balance'
              ? 'bg-[#1B1814] text-[#E5C378] shadow-md ring-1 ring-[#D4AF37]/60'
              : 'text-[#6E604A] hover:text-[#1B1814]'
          }`}
        >
          Neraca
        </button>
        <button
          onClick={() => setReportSubTab('sales')}
          className={`py-2 rounded-xl transition-all ${
            reportSubTab === 'sales'
              ? 'bg-[#1B1814] text-[#E5C378] shadow-md ring-1 ring-[#D4AF37]/60'
              : 'text-[#6E604A] hover:text-[#1B1814]'
          }`}
        >
          Penjualan
        </button>
        <button
          onClick={() => setReportSubTab('customers')}
          className={`py-2 rounded-xl transition-all ${
            reportSubTab === 'customers'
              ? 'bg-[#1B1814] text-[#E5C378] shadow-md ring-1 ring-[#D4AF37]/60'
              : 'text-[#6E604A] hover:text-[#1B1814]'
          }`}
        >
          Pelanggan
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. VIEW: LABA RUGI (PROFIT & LOSS)                                        */}
      {/* ========================================================================= */}
      {reportSubTab === 'pnl' && (
        <div className="space-y-3.5">
          {/* Period Filter */}
          <div className="flex bg-[#EBE5D8] p-1 rounded-2xl text-xs font-display font-bold max-w-fit">
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
      {/* 2. VIEW: NERACA (BALANCE SHEET)                                           */}
      {/* ========================================================================= */}
      {reportSubTab === 'balance' && (
        <div className="space-y-3.5">
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

          {/* Section 2: Ekuitas & Pertumbuhan */}
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

      {/* ========================================================================= */}
      {/* 3. VIEW: RIWAYAT PENJUALAN                                                */}
      {/* ========================================================================= */}
      {reportSubTab === 'sales' && (
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-display font-bold text-[#7A7264]">
              Total Transaksi: {transactions.length}
            </span>
            <button
              onClick={() => setShowSaleModal(true)}
              className="flex items-center gap-1.5 bg-[#1B1814] text-[#FAF8F5] px-3.5 py-2 rounded-2xl text-xs font-display font-bold hover:bg-[#2E2820] active-press transition-all shadow-sm ring-1 ring-[#C59A3F]/30"
            >
              <Plus className="w-4 h-4 stroke-[2.5] text-[#DFC28F]" />
              <span>Catat Penjualan</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {transactions.length === 0 ? (
              <div className="p-8 text-center rounded-3xl bg-[#FAF8F5] border border-[#E5DFD3] text-[#8A816F]">
                <ArrowRightLeft className="w-8 h-8 mx-auto mb-2 text-[#C7BC9F]" />
                <div className="text-xs font-mono">Belum ada riwayat transaksi</div>
              </div>
            ) : (
              transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-4 rounded-3xl bg-[#FAF8F5] border border-[#E5DFD3] space-y-2.5 shadow-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-display font-bold text-[#1B1814]">{tx.itemTitle}</span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#EFECE3] text-[#3D3528] rounded-md">
                          {formatGram(tx.weight)}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#7A7264] mt-1 flex items-center gap-2 font-mono">
                        <span className="font-bold text-[#1B1814]">{tx.customerName}</span>
                        <span>•</span>
                        <span>{formatDateIndo(tx.saleDate)}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-mono font-extrabold text-[#1E5C27] tabular-nums">
                        +{formatRupiahJuta(tx.netProfit)}
                      </div>
                      <div className="text-[10px] text-[#8A816F] font-mono">Laba Bersih</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E5DFD3] flex items-center justify-between text-xs">
                    <div className="text-[11px] text-[#7A7264] font-mono tabular-nums">
                      Terjual: {formatRupiahJuta(tx.sellPrice)} | Modal: {formatRupiahJuta(tx.costPrice)}
                    </div>
                    {tx.customerPhone && (
                      <button
                        onClick={() => openWhatsApp(tx.customerPhone, tx.customerName)}
                        className="p-2 text-[#1E5C27] bg-[#EAF3EA] hover:bg-[#D8EBD9] border border-[#C2E0C7] rounded-xl active-press transition-all"
                        title="Kirim WhatsApp"
                      >
                        <MessageSquare className="w-4 h-4 stroke-[2.2]" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. VIEW: DATABASE PELANGGAN (CRM)                                         */}
      {/* ========================================================================= */}
      {reportSubTab === 'customers' && (
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-display font-bold text-[#7A7264]">
              Total Pelanggan: {customers.length}
            </span>
            <button
              onClick={() => setShowCustomerModal(true)}
              className="flex items-center gap-1.5 bg-[#1B1814] text-[#FAF8F5] px-3.5 py-2 rounded-2xl text-xs font-display font-bold hover:bg-[#2E2820] active-press transition-all shadow-sm ring-1 ring-[#C59A3F]/30"
            >
              <UserPlus className="w-4 h-4 stroke-[2.5] text-[#DFC28F]" />
              <span>Tambah Pelanggan</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {customers.length === 0 ? (
              <div className="p-8 text-center rounded-3xl bg-[#FAF8F5] border border-[#E5DFD3] text-[#8A816F]">
                <Users className="w-8 h-8 mx-auto mb-2 text-[#C7BC9F]" />
                <div className="text-xs font-mono">Belum ada data pelanggan</div>
              </div>
            ) : (
              customers.map((cust) => (
                <div
                  key={cust.id}
                  className="p-4 rounded-3xl bg-[#FAF8F5] border border-[#E5DFD3] flex items-center justify-between shadow-xs"
                >
                  <div className="space-y-1">
                    <h3 className="text-xs font-display font-bold text-[#1B1814]">{cust.name}</h3>
                    <div className="text-[11px] text-[#7A7264] font-mono">{cust.phone || '-'}</div>
                    <div className="text-[10px] text-[#8A816F] font-mono">
                      Pernah beli: <span className="font-bold text-[#1B1814]">{cust.totalTransactions || 0}x</span> ({formatGram(cust.totalGramsBought || 0)})
                      {cust.address ? ` • ${cust.address}` : ''}
                    </div>
                  </div>

                  {cust.phone && (
                    <button
                      onClick={() => openWhatsApp(cust.phone, cust.name)}
                      className="p-2 text-[#1E5C27] bg-[#EAF3EA] hover:bg-[#D8EBD9] border border-[#C2E0C7] rounded-xl active-press transition-all"
                      title="Kirim WhatsApp"
                    >
                      <MessageSquare className="w-4 h-4 stroke-[2.2]" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal: Catat Penjualan */}
      <Modal
        isOpen={showSaleModal}
        onClose={() => setShowSaleModal(false)}
        title="Catat Penjualan Emas"
      >
        <form onSubmit={handleSaveSale} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-[#1B1814] mb-1">Pilih Stok Emas *</label>
            <select
              required
              value={saleForm.inventoryId}
              onChange={(e) => {
                const invId = Number(e.target.value);
                const inv = inventory.find(i => i.id === invId);
                setSaleForm({
                  ...saleForm,
                  inventoryId: invId,
                  sellPrice: inv ? inv.totalBuyPrice + 75000 : 0
                });
              }}
              className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD3] rounded-xl text-[#1B1814] focus:outline-none focus:border-[#C59A3F] font-sans"
            >
              <option value="">-- Pilih Stok Ready --</option>
              {readyInventory.map(item => (
                <option key={item.id} value={item.id}>
                  {item.title} ({formatGram(item.weight)}) — Modal: {formatRupiah(item.totalBuyPrice)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-bold text-[#1B1814] mb-1">Nama Pembeli *</label>
              <input
                type="text"
                required
                placeholder="Contoh: Bu Sri / Mbak Nurul"
                value={saleForm.customerName}
                onChange={(e) => {
                  const val = e.target.value;
                  const exist = customers.find(c => c.name.toLowerCase() === val.toLowerCase());
                  if (exist) {
                    setSaleForm({ ...saleForm, customerId: exist.id, customerName: exist.name, customerPhone: exist.phone });
                  } else {
                    setSaleForm({ ...saleForm, customerId: '', customerName: val });
                  }
                }}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD3] rounded-xl text-[#1B1814] focus:outline-none focus:border-[#C59A3F] font-sans"
              />
            </div>

            <div>
              <label className="block font-bold text-[#1B1814] mb-1">Nomor WhatsApp</label>
              <input
                type="tel"
                placeholder="0812xxxx"
                value={saleForm.customerPhone}
                onChange={(e) => setSaleForm({ ...saleForm, customerPhone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD3] rounded-xl text-[#1B1814] font-mono focus:outline-none focus:border-[#C59A3F]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-bold text-[#1B1814] mb-1">Tanggal Jual *</label>
              <input
                type="date"
                required
                value={saleForm.saleDate}
                onChange={(e) => setSaleForm({ ...saleForm, saleDate: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD3] rounded-xl text-[#1B1814] focus:outline-none focus:border-[#C59A3F] font-sans"
              />
            </div>

            <div>
              <label className="block font-bold text-[#1B1814] mb-1">Metode Pembayaran</label>
              <select
                value={saleForm.paymentMethod}
                onChange={(e) => setSaleForm({ ...saleForm, paymentMethod: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD3] rounded-xl text-[#1B1814] focus:outline-none focus:border-[#C59A3F] font-sans"
              >
                <option value="Tunai">Tunai Langsung</option>
                <option value="Transfer Bank">Transfer Bank</option>
                <option value="DP + Pelunasan">DP + Pelunasan</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-bold text-[#1B1814] mb-1">Harga Jual (Rp) *</label>
              <input
                type="number"
                required
                value={saleForm.sellPrice}
                onChange={(e) => setSaleForm({ ...saleForm, sellPrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD3] rounded-xl text-[#1B1814] font-mono font-bold focus:outline-none focus:border-[#C59A3F]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#1B1814] mb-1">Biaya Ongkir / Kurir (Rp)</label>
              <input
                type="number"
                value={saleForm.operationalFee}
                onChange={(e) => setSaleForm({ ...saleForm, operationalFee: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD3] rounded-xl text-[#1B1814] font-mono focus:outline-none focus:border-[#C59A3F]"
              />
            </div>
          </div>

          {/* Profit Preview */}
          <div className="p-3.5 bg-[#F2EDE2] rounded-2xl border border-[#E5DFD3] space-y-1 font-mono">
            <div className="flex justify-between text-[#8A816F]">
              <span>Modal Beli:</span>
              <span className="tabular-nums">{formatRupiah(currentCost)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-[#1B1814] pt-1 border-t border-[#E5DFD3]">
              <span>Laba Bersih:</span>
              <span className="text-[#1E5C27] tabular-nums">
                +{formatRupiah(profitMetrics.netProfit)} ({profitMetrics.marginPercent}%)
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-[#1B1814] text-[#FAF8F5] font-display font-bold rounded-2xl text-xs hover:bg-[#2E2820] transition-all mt-2 active-press ring-1 ring-[#C59A3F]/30"
          >
            Simpan Transaksi Penjualan
          </button>
        </form>
      </Modal>

      {/* Modal: Tambah Pelanggan */}
      <Modal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        title="Tambah Pelanggan Baru"
      >
        <form onSubmit={handleSaveCustomer} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-[#1B1814] mb-1">Nama Pelanggan *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Bu Sri Wahyuni"
              value={custForm.name}
              onChange={(e) => setCustForm({ ...custForm, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD3] rounded-xl text-[#1B1814] focus:outline-none focus:border-[#C59A3F] font-sans"
            />
          </div>

          <div>
            <label className="block font-bold text-[#1B1814] mb-1">Nomor WhatsApp *</label>
            <input
              type="tel"
              required
              placeholder="0812xxxx"
              value={custForm.phone}
              onChange={(e) => setCustForm({ ...custForm, phone: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD3] rounded-xl text-[#1B1814] font-mono focus:outline-none focus:border-[#C59A3F]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#1B1814] mb-1">Alamat / Domisili</label>
            <input
              type="text"
              placeholder="Kecamatan / Patokan"
              value={custForm.address}
              onChange={(e) => setCustForm({ ...custForm, address: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD3] rounded-xl text-[#1B1814] focus:outline-none focus:border-[#C59A3F] font-sans"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-[#1B1814] text-[#FAF8F5] font-display font-bold rounded-2xl text-xs hover:bg-[#2E2820] transition-all mt-2 active-press ring-1 ring-[#C59A3F]/30"
          >
            Simpan Pelanggan
          </button>
        </form>
      </Modal>
    </div>
  );
}
