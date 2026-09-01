import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import Modal from '../common/Modal';

export default function GoldPriceModal({ isOpen, onClose }) {
  const settings = useLiveQuery(() => db.settings.get('gold_price_live'), []);

  const [prices, setPrices] = useState({
    antam1g: 1455000,
    ubs1g: 1420000,
    galeri24_1g: 1415000,
    spotGram: 1380000,
    buyback1g: 1330000,
    lastUpdated: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (settings) {
      setPrices({
        antam1g: settings.antam1g || 1455000,
        ubs1g: settings.ubs1g || 1420000,
        galeri24_1g: settings.galeri24_1g || 1415000,
        spotGram: settings.spotGram || 1380000,
        buyback1g: settings.buyback1g || 1330000,
        lastUpdated: settings.lastUpdated || new Date().toISOString().split('T')[0]
      });
    }
  }, [settings]);

  const handleSave = async (e) => {
    e.preventDefault();
    await db.settings.put({
      key: 'gold_price_live',
      antam1g: Number(prices.antam1g),
      ubs1g: Number(prices.ubs1g),
      galeri24_1g: Number(prices.galeri24_1g),
      spotGram: Number(prices.spotGram),
      buyback1g: Number(prices.buyback1g),
      lastUpdated: prices.lastUpdated
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Benchmark Harga Emas">
      <form onSubmit={handleSave} className="space-y-3.5 text-xs">
        <p className="text-[#8A816F] text-[11px] leading-relaxed">
          Harga acuan per gram ini digunakan sebagai dasar kalkulasi valuasi stok aktif Anda.
        </p>

        <div className="space-y-3">
          <div>
            <label className="block font-bold text-[#1B1814] mb-1">Antam 1 Gram (Rp)</label>
            <input
              type="number"
              required
              value={prices.antam1g}
              onChange={(e) => setPrices({ ...prices, antam1g: parseFloat(e.target.value) || 0 })}
              className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD3] rounded-xl text-[#1B1814] font-mono font-bold focus:outline-none focus:border-[#C59A3F]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#1B1814] mb-1">UBS 1 Gram (Rp)</label>
            <input
              type="number"
              required
              value={prices.ubs1g}
              onChange={(e) => setPrices({ ...prices, ubs1g: parseFloat(e.target.value) || 0 })}
              className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD3] rounded-xl text-[#1B1814] font-mono font-bold focus:outline-none focus:border-[#C59A3F]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#1B1814] mb-1">Galeri 24 / Lainnya 1 Gram (Rp)</label>
            <input
              type="number"
              value={prices.galeri24_1g}
              onChange={(e) => setPrices({ ...prices, galeri24_1g: parseFloat(e.target.value) || 0 })}
              className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD3] rounded-xl text-[#1B1814] font-mono focus:outline-none focus:border-[#C59A3F]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#1B1814] mb-1">Harga Buyback Pasar (Rp)</label>
            <input
              type="number"
              value={prices.buyback1g}
              onChange={(e) => setPrices({ ...prices, buyback1g: parseFloat(e.target.value) || 0 })}
              className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD3] rounded-xl text-[#1B1814] font-mono focus:outline-none focus:border-[#C59A3F]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#1B1814] mb-1">Tanggal Terakhir Diperbarui</label>
            <input
              type="date"
              value={prices.lastUpdated}
              onChange={(e) => setPrices({ ...prices, lastUpdated: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD3] rounded-xl text-[#1B1814] focus:outline-none focus:border-[#C59A3F] font-sans"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 bg-[#1B1814] text-[#FAF8F5] font-display font-bold rounded-2xl text-xs hover:bg-[#2E2820] transition-all mt-2 active-press ring-1 ring-[#C59A3F]/30"
        >
          Simpan Acuan
        </button>
      </form>
    </Modal>
  );
}
