import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, STATUS } from '../../db/db';
import { formatRupiah, formatGram, formatDateIndo } from '../../services/calculationService';
import { 
  Plus, 
  Search, 
  Layers, 
  Trash2, 
  ArrowRight
} from 'lucide-react';
import Badge from '../common/Badge';
import Modal from '../common/Modal';

export default function InventoryTab({ onQuickSell }) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    brand: 'Antam',
    type: 'Logam Mulia (LM)',
    weight: 1.0,
    purity: '24K / 99.99%',
    purchaseDate: new Date().toISOString().split('T')[0],
    supplier: '',
    buyPriceUnit: 1400000,
    buyCostExtra: 0,
    notes: ''
  });

  const inventory = useLiveQuery(() => db.inventory.toArray(), []) || [];

  const filteredItems = inventory.filter(item => {
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchSupplier = item.supplier?.toLowerCase().includes(q);
      const matchNotes = item.notes?.toLowerCase().includes(q);
      if (!matchTitle && !matchSupplier && !matchNotes) return false;
    }
    return true;
  });

  const handleSaveStock = async (e) => {
    e.preventDefault();
    const unitPrice = Number(formData.buyPriceUnit) || 0;
    const extra = Number(formData.buyCostExtra) || 0;
    const totalBuyPrice = unitPrice + extra;

    await db.inventory.add({
      title: formData.title || `${formData.brand} ${formData.weight} Gram`,
      brand: formData.brand,
      type: formData.type,
      weight: Number(formData.weight) || 1.0,
      purity: formData.purity,
      purchaseDate: formData.purchaseDate,
      supplier: formData.supplier,
      buyPriceUnit: unitPrice,
      buyCostExtra: extra,
      totalBuyPrice: totalBuyPrice,
      status: STATUS.READY,
      notes: formData.notes,
      createdAt: new Date().toISOString()
    });

    setShowAddModal(false);
    setFormData({
      title: '',
      brand: 'Antam',
      type: 'Logam Mulia (LM)',
      weight: 1.0,
      purity: '24K / 99.99%',
      purchaseDate: new Date().toISOString().split('T')[0],
      supplier: '',
      buyPriceUnit: 1400000,
      buyCostExtra: 0,
      notes: ''
    });
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm('Hapus stok emas ini dari inventaris?')) {
      await db.inventory.delete(id);
      setSelectedItem(null);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-display font-extrabold text-[#1B1814] tracking-tight">
          Inventaris Emas
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 bg-[#1B1814] text-[#FAF8F5] px-3.5 py-2 rounded-2xl text-xs font-display font-bold hover:bg-[#2E2820] active-press transition-all shadow-sm ring-1 ring-[#C59A3F]/30"
        >
          <Plus className="w-4 h-4 stroke-[2.5] text-[#DFC28F]" />
          <span>Tambah</span>
        </button>
      </div>

      {/* Search & Filter Pills */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-[#8A816F] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari gramasi, brand, certicard..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF8F5] border border-[#E5DFD3] rounded-2xl text-xs text-[#1B1814] placeholder-[#8A816F] focus:outline-none focus:border-[#C59A3F] transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: 'all', label: 'Semua' },
            { id: STATUS.READY, label: 'Ready' },
            { id: STATUS.BOOKED, label: 'Booked' },
            { id: STATUS.SOLD, label: 'Terjual' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-display font-bold transition-all ${
                filterStatus === f.id
                  ? 'bg-[#1B1814] text-[#E5C378] shadow-md ring-1 ring-[#D4AF37]/60'
                  : 'bg-[#FAF8F5] text-[#7A7264] border border-[#E5DFD3] hover:bg-[#F2EDE2]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Item List */}
      <div className="space-y-2.5">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-[#FAF8F5] border border-[#E5DFD3] text-[#8A816F]">
            <Layers className="w-8 h-8 mx-auto mb-2 text-[#C7BC9F]" />
            <div className="text-xs font-mono">Belum ada stok emas ditemukan</div>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="p-4 rounded-3xl bg-[#FAF8F5] border border-[#E5DFD3] hover:border-[#C59A3F]/60 transition-all cursor-pointer space-y-2.5 shadow-xs"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 bg-[#EFECE3] text-[#3D3528] rounded-md">
                      {item.brand}
                    </span>
                    <Badge status={item.status} />
                  </div>
                  <h3 className="text-xs font-display font-bold text-[#1B1814]">{item.title}</h3>
                  <div className="text-[11px] text-[#7A7264] flex items-center gap-2 font-mono">
                    <span className="font-bold text-[#1B1814]">
                      {formatGram(item.weight)}
                    </span>
                    <span>•</span>
                    <span>{item.type}</span>
                    <span>•</span>
                    <span>{formatDateIndo(item.purchaseDate)}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-[#8A816F] font-mono">MODAL</div>
                  <div className="text-xs font-mono font-bold text-[#1B1814] tabular-nums">
                    {formatRupiah(item.totalBuyPrice)}
                  </div>
                </div>
              </div>

              {/* Quick Action when Ready */}
              {item.status === STATUS.READY && (
                <div className="pt-2 border-t border-[#E5DFD3] flex items-center justify-between">
                  <span className="text-[11px] text-[#8A816F] font-mono line-clamp-1">
                    {item.supplier || 'Ready di Etalase'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuickSell(item);
                    }}
                    className="flex items-center gap-1.5 text-xs font-display font-bold text-[#1B1814] bg-[#F2EDE2] hover:bg-[#EAE5D8] px-3 py-1.5 rounded-xl transition-all active-press"
                  >
                    <span>Jual</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.2] text-[#A27B2C]" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal: Tambah Stok */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Input Stok Pembelian"
      >
        <form onSubmit={handleSaveStock} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-[#1B1814] mb-1">Nama Barang</label>
            <input
              type="text"
              required
              placeholder="Contoh: Antam 1 Gram Certicard 2026"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD3] rounded-xl text-[#1B1814] focus:outline-none focus:border-[#C59A3F] font-sans"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-bold text-[#1B1814] mb-1">Brand</label>
              <select
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-3 py-2.5 bg-white border border-[#E5DFD3] rounded-xl text-[#1B1814] focus:outline-none focus:border-[#C59A3F] font-sans"
              >
                <option value="Antam">Antam</option>
                <option value="UBS">UBS</option>
                <option value="Galeri 24">Galeri 24</option>
                <option value="Hartadinata">Hartadinata</option>
                <option value="Lotus Archi">Lotus Archi</option>
                <option value="Perhiasan">Perhiasan</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#1B1814] mb-1">Jenis</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2.5 bg-white border border-[#E5DFD3] rounded-xl text-[#1B1814] focus:outline-none focus:border-[#C59A3F] font-sans"
              >
                <option value="Logam Mulia (LM)">Logam Mulia (LM)</option>
                <option value="Koin Emas">Koin Emas</option>
                <option value="Cincin">Cincin</option>
                <option value="Gelang">Gelang</option>
                <option value="Kalung">Kalung</option>
                <option value="Anting">Anting</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-bold text-[#1B1814] mb-1">Berat (g)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD3] rounded-xl text-[#1B1814] font-mono font-bold focus:outline-none focus:border-[#C59A3F]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#1B1814] mb-1">Kadar</label>
              <input
                type="text"
                placeholder="24K / 99.99%"
                value={formData.purity}
                onChange={(e) => setFormData({ ...formData, purity: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD3] rounded-xl text-[#1B1814] focus:outline-none focus:border-[#C59A3F]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-bold text-[#1B1814] mb-1">Tanggal Beli</label>
              <input
                type="date"
                required
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                className="w-full px-3 py-2.5 bg-white border border-[#E5DFD3] rounded-xl text-[#1B1814] focus:outline-none focus:border-[#C59A3F]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#1B1814] mb-1">Supplier / Toko</label>
              <input
                type="text"
                placeholder="Butik Antam / Toko X"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD3] rounded-xl text-[#1B1814] focus:outline-none focus:border-[#C59A3F]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-bold text-[#1B1814] mb-1">Harga Beli per Unit (Rp)</label>
              <input
                type="number"
                required
                value={formData.buyPriceUnit}
                onChange={(e) => setFormData({ ...formData, buyPriceUnit: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD3] rounded-xl text-[#1B1814] font-mono font-bold focus:outline-none focus:border-[#C59A3F]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#1B1814] mb-1">Ongkos Cetak / Biaya Tambahan (Rp)</label>
              <input
                type="number"
                value={formData.buyCostExtra}
                onChange={(e) => setFormData({ ...formData, buyCostExtra: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD3] rounded-xl text-[#1B1814] font-mono focus:outline-none focus:border-[#C59A3F]"
              />
            </div>
          </div>

          <div className="p-3.5 bg-[#F2EDE2] rounded-2xl border border-[#E5DFD3] flex items-center justify-between">
            <span className="font-bold text-[#1B1814]">Total Modal:</span>
            <span className="font-mono font-extrabold text-sm text-[#1B1814] tabular-nums">
              {formatRupiah((Number(formData.buyPriceUnit) || 0) + (Number(formData.buyCostExtra) || 0))}
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-[#1B1814] text-[#FAF8F5] font-display font-bold rounded-2xl text-xs hover:bg-[#2E2820] transition-all mt-2 active-press ring-1 ring-[#C59A3F]/30"
          >
            Simpan ke Stok
          </button>
        </form>
      </Modal>

      {/* Modal: Detail Barang */}
      {selectedItem && (
        <Modal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          title={selectedItem.title}
        >
          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between p-3.5 bg-[#F2EDE2] rounded-2xl border border-[#E5DFD3]">
              <div>
                <div className="text-[#8A816F] font-mono text-[10px]">STATUS</div>
                <Badge status={selectedItem.status} />
              </div>
              <div className="text-right">
                <div className="text-[#8A816F] font-mono text-[10px]">TOTAL MODAL</div>
                <div className="font-mono font-bold text-sm text-[#1B1814] tabular-nums">{formatRupiah(selectedItem.totalBuyPrice)}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 font-mono">
              <div className="p-3 bg-[#FAF8F5] border border-[#E5DFD3] rounded-2xl">
                <div className="text-[10px] text-[#8A816F]">BRAND & JENIS</div>
                <div className="font-bold text-[#1B1814]">{selectedItem.brand} ({selectedItem.type})</div>
              </div>
              <div className="p-3 bg-[#FAF8F5] border border-[#E5DFD3] rounded-2xl">
                <div className="text-[10px] text-[#8A816F]">BERAT & KADAR</div>
                <div className="font-bold text-[#1B1814]">{formatGram(selectedItem.weight)} • {selectedItem.purity || '24K'}</div>
              </div>
              <div className="p-3 bg-[#FAF8F5] border border-[#E5DFD3] rounded-2xl">
                <div className="text-[10px] text-[#8A816F]">TANGGAL BELI</div>
                <div className="font-bold text-[#1B1814]">{formatDateIndo(selectedItem.purchaseDate)}</div>
              </div>
              <div className="p-3 bg-[#FAF8F5] border border-[#E5DFD3] rounded-2xl">
                <div className="text-[10px] text-[#8A816F]">SUPPLIER</div>
                <div className="font-bold text-[#1B1814]">{selectedItem.supplier || '-'}</div>
              </div>
            </div>

            {selectedItem.notes && (
              <div className="p-3 bg-[#FAF8F5] rounded-2xl text-[#6B6355] border border-[#E5DFD3]">
                <span className="font-bold text-[#1B1814]">Catatan: </span>
                {selectedItem.notes}
              </div>
            )}

            <div className="pt-2 flex gap-2">
              {selectedItem.status === STATUS.READY && (
                <button
                  onClick={() => {
                    const item = selectedItem;
                    setSelectedItem(null);
                    onQuickSell(item);
                  }}
                  className="flex-1 py-3.5 bg-[#1B1814] text-[#FAF8F5] font-display font-bold rounded-2xl text-center active-press transition-all ring-1 ring-[#C59A3F]/30"
                >
                  Jual Emas
                </button>
              )}
              <button
                onClick={() => handleDeleteItem(selectedItem.id)}
                className="p-3 text-rose-700 bg-[#FBEBEB] border border-[#F2C2C2] rounded-2xl active-press"
                title="Hapus Stok"
              >
                <Trash2 className="w-4 h-4 stroke-[2]" />
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
