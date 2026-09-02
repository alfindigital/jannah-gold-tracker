import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { 
  Users, 
  Search, 
  Plus, 
  MessageSquare, 
  MapPin, 
  ShoppingBag, 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  Edit3, 
  Phone
} from 'lucide-react';
import Modal from '../common/Modal';
import { 
  formatRupiah, 
  formatRupiahJuta, 
  formatGram, 
  formatDateIndo 
} from '../../services/calculationService';

export default function CrmTab() {
  const customersRaw = useLiveQuery(() => db.customers.toArray(), []);
  const transactionsRaw = useLiveQuery(() => db.transactions.toArray(), []);

  const customers = Array.isArray(customersRaw) ? customersRaw : [];
  const transactions = Array.isArray(transactionsRaw) ? transactionsRaw : [];

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'vip' | 'regular' | 'new'
  const [expandedCustId, setExpandedCustId] = useState(null);
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: ''
  });

  // 3s Auto-reset for delete confirmation
  React.useEffect(() => {
    if (confirmDeleteId !== null) {
      const timer = setTimeout(() => {
        setConfirmDeleteId(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [confirmDeleteId]);

  // Merge customer with their calculated transaction metrics
  const customerList = useMemo(() => {
    return customers.filter(Boolean).map(c => {
      // Find all transactions for this customer (by ID or normalized name)
      const custTxs = transactions.filter(t => 
        t && ((t.customerId && t.customerId === c.id) || 
        (t.customerName && t.customerName.trim().toLowerCase() === (c.name || '').trim().toLowerCase()))
      ).sort((a, b) => new Date(b.saleDate || 0) - new Date(a.saleDate || 0));

      const totalLtv = custTxs.reduce((acc, t) => acc + (Number(t.sellPrice) || 0), 0);
      const totalGrams = custTxs.reduce((acc, t) => acc + (Number(t.weight) || 0), 0);
      const totalOrders = custTxs.length;
      const lastOrderDate = custTxs[0]?.saleDate || null;
      const lastLocation = custTxs[0]?.deliveryLocation || custTxs[0]?.location || c.address || '-';

      return {
        ...c,
        txList: custTxs,
        ltv: totalLtv,
        totalGrams,
        totalOrders,
        lastOrderDate,
        lastLocation
      };
    });
  }, [customers, transactions]);

  // Filter & Search
  const filteredCustomers = useMemo(() => {
    return customerList.filter(c => {
      // Search
      const matchSearch = 
        (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.phone && c.phone.includes(searchQuery)) ||
        (c.address && c.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.notes && c.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchSearch) return false;

      // Filter pills
      if (filterType === 'vip') return c.totalOrders >= 3;
      if (filterType === 'regular') return c.totalOrders === 2;
      if (filterType === 'new') return c.totalOrders <= 1;

      return true;
    }).sort((a, b) => b.ltv - a.ltv); // Default: Highest LTV first
  }, [customerList, searchQuery, filterType]);

  const openWhatsApp = (phone, name = '') => {
    if (!phone) {
      alert('Nomor WhatsApp belum diisi');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '').replace(/^0/, '62');
    const greeting = encodeURIComponent(`Halo ${name || ''}, salam dari Jannah Gold...`);
    window.open(`https://wa.me/${cleanPhone}?text=${greeting}`, '_blank');
  };

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFormData({ name: '', phone: '', address: '', notes: '' });
    setShowAddModal(true);
  };

  const handleOpenEdit = (cust) => {
    setEditingCustomer(cust);
    setFormData({
      name: cust.name || '',
      phone: cust.phone || '',
      address: cust.address || '',
      notes: cust.notes || ''
    });
    setShowAddModal(true);
  };

  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingCustomer) {
      await db.customers.update(editingCustomer.id, {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        notes: formData.notes.trim()
      });
    } else {
      await db.customers.add({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        notes: formData.notes.trim(),
        totalTransactions: 0,
        totalGramsBought: 0,
        createdAt: new Date().toISOString()
      });
    }

    setShowAddModal(false);
    setEditingCustomer(null);
  };

  const handleDeleteCustomer = async (id) => {
    if (confirmDeleteId === id) {
      await db.customers.delete(id);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
    }
  };

  return (
    <div className="space-y-4 pb-2">
      {/* 1 Single Top Row: Filters on Left, + Button on Right */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: 'all', label: 'Semua' },
            { id: 'vip', label: 'VIP (≥3x)' },
            { id: 'regular', label: 'Langganan (2x)' },
            { id: 'new', label: 'Baru (1x)' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-display font-bold transition-all whitespace-nowrap ${
                filterType === f.id
                  ? 'bg-[#1B1814] text-[#E5C378] shadow-md ring-1 ring-[#D4AF37]/60'
                  : 'bg-[#FAF8F5] text-[#7A7264] border border-[#E5DFD3] hover:bg-[#F2EDE2]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleOpenAdd}
          className="w-8 h-8 rounded-xl bg-[#1B1814] text-[#E5C378] flex items-center justify-center hover:bg-[#2E2820] active-press transition-all shadow-xs ring-1 ring-[#D4AF37]/50 shrink-0"
          title="Tambah Pelanggan"
        >
          <Plus className="w-4 h-4 stroke-[2.8]" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#8A816F] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Cari nama, WhatsApp, kota/alamat..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF8F5] border border-[#E5DFD3] rounded-2xl text-xs text-[#1B1814] placeholder-[#8A816F] focus:outline-none focus:border-[#C59A3F] transition-colors shadow-xs"
        />
      </div>

      {/* Customer Cards List */}
      <div className="space-y-3">
        {filteredCustomers.length === 0 ? (
          <div className="p-8 text-center bg-[#FAF8F5] border border-[#E5DFD3] rounded-3xl space-y-2">
            <Users className="w-8 h-8 text-[#8A816F] mx-auto stroke-[1.5]" />
            <div className="text-xs font-display font-bold text-[#1B1814]">Belum Ada Data Pelanggan</div>
            <p className="text-[11px] text-[#8A816F]">
              Data pembeli akan otomatis tercatat saat Anda mencatat transaksi penjualan.
            </p>
          </div>
        ) : (
          filteredCustomers.map(c => {
            const isExpanded = expandedCustId === c.id;

            return (
              <div 
                key={c.id} 
                className="p-4 rounded-3xl bg-[#FAF8F5] border border-[#E5DFD3] space-y-3 shadow-xs hover:border-[#D4AF37]/50 transition-all"
              >
                {/* Header Row: Name & Badges & Actions */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display font-black text-sm text-[#1B1814] tracking-tight">
                        {c.name}
                      </h3>
                      {c.totalOrders >= 3 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FAF2DA] text-[#946F22] border border-[#E6CD85]">
                          ★ VIP Emas
                        </span>
                      ) : c.totalOrders === 2 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#EAF3EA] text-[#1E5C27] border border-[#C2E0C7]">
                          Langganan (2x)
                        </span>
                      ) : c.totalOrders === 1 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-[#7A7264] bg-[#F2EDE2] border border-[#E5DFD3]">
                          1x Beli
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] font-mono text-[#7A7264]">
                      {c.phone ? (
                        <span className="flex items-center gap-1 text-[#1B1814] font-bold">
                          <Phone className="w-3 h-3 text-[#A27B2C]" />
                          {c.phone}
                        </span>
                      ) : (
                        <span>Tanpa WhatsApp</span>
                      )}
                      {c.address && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 truncate max-w-[150px]">
                            <MapPin className="w-3 h-3 text-[#A27B2C] shrink-0" />
                            {c.address}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions: WA, Edit, Delete */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {c.phone && (
                      <button
                        onClick={() => openWhatsApp(c.phone, c.name)}
                        className="p-2 text-[#1E5C27] bg-[#EAF3EA] hover:bg-[#D8EBD9] border border-[#C2E0C7] rounded-xl active-press transition-all"
                        title="Chat WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5 stroke-[2.2]" />
                      </button>
                    )}

                    <button
                      onClick={() => handleOpenEdit(c)}
                      className="p-2 text-[#6E604A] bg-[#F2EDE2] hover:bg-[#EAE2D2] border border-[#E5DFD3] rounded-xl active-press transition-all"
                      title="Edit Data"
                    >
                      <Edit3 className="w-3.5 h-3.5 stroke-[2]" />
                    </button>

                    <button
                      onClick={() => handleDeleteCustomer(c.id)}
                      className={`p-2 rounded-xl active-press transition-all ${
                        confirmDeleteId === c.id
                          ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-400'
                          : 'text-rose-700 bg-[#FBEBEB] hover:bg-[#F8DADA] border border-[#F2C2C2]'
                      }`}
                      title={confirmDeleteId === c.id ? "Klik sekali lagi untuk menghapus" : "Hapus"}
                    >
                      <Trash2 className={`w-3.5 h-3.5 stroke-[2] ${confirmDeleteId === c.id ? 'fill-white' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Metrics Bento: LTV, Total Gramasi, Transaksi, Terakhir Beli */}
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#E5DFD3]">
                  <div className="p-2 rounded-2xl bg-[#F2EDE2] border border-[#E5DFD3] text-center">
                    <div className="text-[9px] font-mono text-[#8A816F] uppercase">Total Belanja (LTV)</div>
                    <div className="text-xs font-display font-black text-[#1B1814] tabular-nums mt-0.5">
                      {formatRupiahJuta(c.ltv)}
                    </div>
                  </div>

                  <div className="p-2 rounded-2xl bg-[#F2EDE2] border border-[#E5DFD3] text-center">
                    <div className="text-[9px] font-mono text-[#8A816F] uppercase">Gramasi</div>
                    <div className="text-xs font-display font-black text-[#1B1814] tabular-nums mt-0.5">
                      {formatGram(c.totalGrams)}
                    </div>
                  </div>

                  <div className="p-2 rounded-2xl bg-[#F2EDE2] border border-[#E5DFD3] text-center">
                    <div className="text-[9px] font-mono text-[#8A816F] uppercase">Transaksi</div>
                    <div className="text-xs font-display font-black text-[#1B1814] tabular-nums mt-0.5">
                      {c.totalOrders}x order
                    </div>
                  </div>
                </div>

                {/* Customer Notes */}
                {c.notes && (
                  <div className="p-2.5 rounded-2xl bg-[#F6F3EC] text-[11px] text-[#6E604A] border border-[#E5DFD3]">
                    <span className="font-bold text-[#1B1814]">Catatan: </span>
                    {c.notes}
                  </div>
                )}

                {/* Expandable Purchase History */}
                {c.txList.length > 0 && (
                  <div>
                    <button
                      onClick={() => setExpandedCustId(isExpanded ? null : c.id)}
                      className="w-full py-1.5 flex items-center justify-between text-xs font-mono font-bold text-[#876618] hover:text-[#1B1814] transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <ShoppingBag className="w-3.5 h-3.5 stroke-[2]" />
                        Riwayat Pembelian ({c.txList.length})
                      </span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isExpanded && (
                      <div className="space-y-2 pt-2 border-t border-[#E5DFD3]">
                        {c.txList.map((tx, idx) => (
                          <div 
                            key={tx.id || idx}
                            className="p-3 rounded-2xl bg-white border border-[#E5DFD3] space-y-1.5"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="font-display font-bold text-xs text-[#1B1814]">
                                  {tx.itemTitle || 'Emas'}
                                </div>
                                <div className="text-[10px] font-mono text-[#8A816F] flex items-center gap-2 mt-0.5">
                                  <span>{formatDateIndo(tx.saleDate)}</span>
                                  <span>•</span>
                                  <span>{formatGram(tx.weight)}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-display font-black text-xs text-[#1B1814] tabular-nums">
                                  {formatRupiahJuta(tx.sellPrice)}
                                </div>
                                <div className="text-[10px] font-mono text-[#1E5C27] font-bold">
                                  +{formatRupiah(tx.netProfit).replace('Rp', 'Untung ')}
                                </div>
                              </div>
                            </div>

                            {(tx.deliveryLocation || tx.location || tx.paymentMethod) && (
                              <div className="text-[10px] font-mono text-[#7A7264] pt-1 border-t border-[#F2EDE2] flex items-center justify-between">
                                <span className="truncate">
                                  {tx.deliveryLocation || tx.location || '-'}
                                </span>
                                <span className="capitalize text-[#1B1814] font-semibold">
                                  {tx.paymentMethod === 'cash' ? 'Tunai' : tx.paymentMethod === 'transfer' ? 'Transfer Bank' : tx.paymentMethod || '-'}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Tambah / Edit Pelanggan */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingCustomer(null);
        }}
        title={editingCustomer ? "Edit Pelanggan" : "Tambah Pelanggan Baru"}
      >
        <form onSubmit={handleSaveCustomer} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-[#1B1814] mb-1">Nama Pelanggan *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Bu Sri Wahyuni"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD3] rounded-xl text-[#1B1814] focus:outline-none focus:border-[#C59A3F] font-sans"
            />
          </div>

          <div>
            <label className="block font-bold text-[#1B1814] mb-1">Nomor WhatsApp *</label>
            <input
              type="tel"
              required
              placeholder="Contoh: 08123456789"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD3] rounded-xl text-[#1B1814] font-mono focus:outline-none focus:border-[#C59A3F]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#1B1814] mb-1">Alamat / Lokasi Langganan</label>
            <input
              type="text"
              placeholder="Contoh: Alun-alun Purbalingga / Kutasari"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD3] rounded-xl text-[#1B1814] focus:outline-none focus:border-[#C59A3F] font-sans"
            />
          </div>

          <div>
            <label className="block font-bold text-[#1B1814] mb-1">Catatan Khusus</label>
            <textarea
              rows="2"
              placeholder="Contoh: Langganan Antam pecahan 5g, bayar via transfer BCA..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD3] rounded-xl text-[#1B1814] focus:outline-none focus:border-[#C59A3F] font-sans resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-[#1B1814] text-[#FAF8F5] font-display font-bold rounded-2xl text-xs hover:bg-[#2E2820] transition-all mt-2 active-press ring-1 ring-[#C59A3F]/30"
          >
            {editingCustomer ? "Simpan Perubahan" : "Simpan Pelanggan"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
