import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { Pencil, Check, X, ArrowLeft } from 'lucide-react';

const BRANDS = [
  { key: 'antam',       label: 'Antam',        jualKey: 'antam1g',         buybackKey: 'antam_buyback' },
  { key: 'ubs',         label: 'UBS',           jualKey: 'ubs1g',           buybackKey: 'ubs_buyback' },
  { key: 'galeri24',    label: 'Galeri 24',     jualKey: 'galeri24_1g',     buybackKey: 'galeri24_buyback' },
  { key: 'hartadinata', label: 'Hartadinata',   jualKey: 'hartadinata1g',   buybackKey: 'hartadinata_buyback' },
  { key: 'archi',       label: 'Lotus Archi',   jualKey: 'archi1g',         buybackKey: 'archi_buyback' },
];

const DEFAULT_PRICES = {
  antam1g: 1455000, antam_buyback: 1330000,
  ubs1g: 1420000, ubs_buyback: 1305000,
  galeri24_1g: 1415000, galeri24_buyback: 1300000,
  hartadinata1g: 1410000, hartadinata_buyback: 1295000,
  archi1g: 1412000, archi_buyback: 1298000,
  lastUpdated: new Date().toISOString().split('T')[0],
};

function fmt(val) {
  if (!val) return '-';
  return new Intl.NumberFormat('id-ID').format(val);
}

export default function GoldPricesTab({ onBack }) {
  const settings = useLiveQuery(() => db.settings.get('gold_price_live'), []);
  const [prices, setPrices] = useState(DEFAULT_PRICES);
  const [editingBrand, setEditingBrand] = useState(null);
  const [editJual, setEditJual] = useState('');
  const [editBuyback, setEditBuyback] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setPrices({
        antam1g:             settings.antam1g             ?? DEFAULT_PRICES.antam1g,
        antam_buyback:       settings.antam_buyback       ?? DEFAULT_PRICES.antam_buyback,
        ubs1g:               settings.ubs1g               ?? DEFAULT_PRICES.ubs1g,
        ubs_buyback:         settings.ubs_buyback         ?? DEFAULT_PRICES.ubs_buyback,
        galeri24_1g:         settings.galeri24_1g         ?? DEFAULT_PRICES.galeri24_1g,
        galeri24_buyback:    settings.galeri24_buyback    ?? DEFAULT_PRICES.galeri24_buyback,
        hartadinata1g:       settings.hartadinata1g       ?? DEFAULT_PRICES.hartadinata1g,
        hartadinata_buyback: settings.hartadinata_buyback ?? DEFAULT_PRICES.hartadinata_buyback,
        archi1g:             settings.archi1g             ?? DEFAULT_PRICES.archi1g,
        archi_buyback:       settings.archi_buyback       ?? DEFAULT_PRICES.archi_buyback,
        lastUpdated:         settings.lastUpdated         ?? DEFAULT_PRICES.lastUpdated,
      });
    }
  }, [settings]);

  function startEdit(brand) {
    setEditingBrand(brand.key);
    setEditJual(String(prices[brand.jualKey] || ''));
    setEditBuyback(String(prices[brand.buybackKey] || ''));
  }

  function cancelEdit() {
    setEditingBrand(null);
  }

  async function saveEdit(brand) {
    setSaving(true);
    const today = new Date().toISOString().split('T')[0];
    const updated = {
      ...prices,
      [brand.jualKey]:    Number(editJual)    || 0,
      [brand.buybackKey]: Number(editBuyback) || 0,
      lastUpdated: today,
    };
    await db.settings.put({ key: 'gold_price_live', ...updated });
    setPrices(updated);
    setEditingBrand(null);
    setSaving(false);
  }

  const lastUpdated = prices.lastUpdated
    ? new Date(prices.lastUpdated).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: '2-digit' })
    : '-';

  return (
    <div className="space-y-4 pb-2">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-2xl bg-[#F2EDE2] border border-[#E5DFD3] hover:bg-[#EBE5D8] text-[#1B1814] transition-all active-press"
          title="Kembali"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
        </button>
        <div>
          <h1 className="text-sm font-display font-black text-[#1B1814] uppercase tracking-wide">Harga Emas Acuan</h1>
          <p className="text-[11px] font-mono text-[#8A816F]">Diperbarui: {lastUpdated} · Ketuk ✎ untuk ubah</p>
        </div>
      </div>

      <div className="rounded-3xl bg-[#FAF8F5] border border-[#E5DFD3] overflow-hidden shadow-xs">
        <div className="grid items-center px-4 py-2.5 bg-[#F2EDE2] border-b border-[#E5DFD3]" style={{gridTemplateColumns:'1fr 100px 100px 44px'}}>
          <span className="text-[10px] font-mono font-bold text-[#8A816F] uppercase tracking-wider">Brand</span>
          <span className="text-[10px] font-mono font-bold text-[#8A816F] uppercase tracking-wider text-right">Jual/g</span>
          <span className="text-[10px] font-mono font-bold text-[#8A816F] uppercase tracking-wider text-right">Buyback/g</span>
          <span />
        </div>

        {BRANDS.map((brand, idx) => {
          const isEditing = editingBrand === brand.key;
          const isLast = idx === BRANDS.length - 1;
          const rowBase = 'grid items-center px-4 py-3 transition-colors';
          const rowBorder = !isLast ? ' border-b border-[#EDE8DF]' : '';
          const rowBg = isEditing ? ' bg-[#FFFDF5]' : ' hover:bg-[#F7F4EE]';
          return (
            <div
              key={brand.key}
              className={rowBase + rowBorder + rowBg}
              style={{gridTemplateColumns:'1fr 100px 100px 44px'}}
            >
              <span className="text-xs font-display font-bold text-[#1B1814]">{brand.label}</span>

              {isEditing ? (
                <input
                  type="number"
                  value={editJual}
                  onChange={e => setEditJual(e.target.value)}
                  className="w-full px-2 py-1 text-right text-xs font-mono font-bold bg-white border border-[#D4AF37]/60 rounded-lg focus:outline-none tabular-nums"
                />
              ) : (
                <span className="text-right text-xs font-mono font-bold text-[#1B1814] tabular-nums">
                  {fmt(prices[brand.jualKey])}
                </span>
              )}

              {isEditing ? (
                <input
                  type="number"
                  value={editBuyback}
                  onChange={e => setEditBuyback(e.target.value)}
                  className="w-full px-2 py-1 text-right text-xs font-mono bg-white border border-[#D4AF37]/60 rounded-lg focus:outline-none tabular-nums"
                />
              ) : (
                <span className="text-right text-xs font-mono text-[#7A7264] tabular-nums">
                  {fmt(prices[brand.buybackKey])}
                </span>
              )}

              <div className="flex justify-end pl-1">
                {isEditing ? (
                  <div className="flex gap-1">
                    <button onClick={() => saveEdit(brand)} disabled={saving}
                      className="p-1 rounded-lg bg-[#1B1814] text-[#E5C378] hover:bg-[#2E2820] active-press transition-all">
                      <Check className="w-3 h-3 stroke-[2.5]" />
                    </button>
                    <button onClick={cancelEdit}
                      className="p-1 rounded-lg bg-[#EDE8DF] text-[#7A7264] hover:bg-[#E0D9CE] active-press transition-all">
                      <X className="w-3 h-3 stroke-[2.5]" />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => startEdit(brand)}
                    className="p-1.5 rounded-lg text-[#A27B2C] hover:bg-[#F2EDE2] active-press transition-all">
                    <Pencil className="w-3.5 h-3.5 stroke-[2]" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] font-mono text-[#8A816F] leading-relaxed px-1">
        Harga tersimpan lokal sebagai acuan valuasi stok. Perbarui setiap hari sesuai harga pasar.
      </p>
    </div>
  );
}
