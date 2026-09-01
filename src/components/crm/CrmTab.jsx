import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, STATUS } from '../../db/db';
import { formatRupiah, formatGram, formatDateIndo, calculateNetProfit, getCleanPhoneNumber } from '../../services/calculationService';
import { 
  Plus, 
  MessageSquare, 
  ArrowRightLeft, 
  Users,
  UserPlus
} from 'lucide-react';
import Modal from '../common/Modal';

export default function CrmTab({ quickSellItem, onClearQuickSell }) {
  const [subTab, setSubTab] = useState('sales');
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  const transactions = useLiveQuery(() => db.transactions.toArray(), []) || [];
  const customers = useLiveQuery(() => db.customers.toArray(), []) || [];
  const inventory = useLiveQuery(() => db.inventory.toArray(), []) || [];

  const readyItems = inventory.filter(item => item.status === STATUS.READY);

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

  useEffect(() => {
    if (quickSellItem) {
      setSaleForm({
        inventoryId: quickSellItem.id,
        customerId: '',
        customerName: '',
        customerPhone: '',
        saleDate: new Date().toISOString().split('T')[0],
        sellPrice: (quickSellItem.totalBuyPrice || 0) + 75000,
        operationalFee: 15000,
        paymentMethod: 'Cash COD',
        notes: ''
      });
      setShowSaleModal(true);
      onClearQuickSell();
    }
  }, [quickSellItem]);

  const selectedInventoryItem = inventory.find(i => i.id === Number(saleForm.inventoryId));
  const currentCost = selectedInventoryItem ? Number(selectedInventoryItem.totalBuyPrice) : 0;
  const currentWeight = selectedInventoryItem ? Number(selectedInventoryItem.weight) : 0;
  const profitMetrics = calculateNetProfit(saleForm.sellPrice, currentCost, saleForm.operationalFee);

  const handleSaveSale = async (e) => {
    e.preventDefault();
    if (!selectedInventoryItem) {
      alert('Please select a gold item to sell');
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
        notes: 'Created automatically from sale',
        createdAt: new Date().toISOString()
      });
    }

    await db.transactions.add({
      inventoryId: selectedInventoryItem.id,
      itemTitle: selectedInventoryItem.title,
      weight: currentWeight,
      customerId: customerId,
      customerName: customerName || 'Customer',
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
      status: STATUS.SOLD
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
      alert('WhatsApp number is empty');
      return;
    }
    const greeting = encodeURIComponent(
      `Hello ${name || ''}, greetings from Jannah Gold...`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${greeting}`, '_blank');
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Subnav & Action */}
      <div className="flex items-center justify-between">
        <div className="flex bg-[#EBE5D8] p-1 rounded-2xl">
          <button
            onClick={() => setSubTab('sales')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-display font-bold transition-all ${
              subTab === 'sales'
                ? 'bg-[#1B1814] text-[#FAF8F5] shadow-xs'
                : 'text-[#7A7264] hover:text-[#1B1814]'
            }`}
          >
            Sales ({transactions.length})
          </button>
          <button
            onClick={() => setSubTab('customers')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-display font-bold transition-all ${
              subTab === 'customers'
                ? 'bg-[#1B1814] text-[#FAF8F5] shadow-xs'
                : 'text-[#7A7264] hover:text-[#1B1814]'
            }`}
          >
            Customers ({customers.length})
          </button>
        </div>

        <div>
          {subTab === 'sales' ? (
            <button
              onClick={() => setShowSaleModal(true)}
              className="flex items-center gap-1.5 bg-[#1B1814] text-[#FAF8F5] px-3.5 py-2 rounded-2xl text-xs font-display font-bold hover:bg-[#2E2820] active-press transition-all shadow-sm ring-1 ring-[#C59A3F]/30"
            >
              <Plus className="w-4 h-4 stroke-[2.5] text-[#DFC28F]" />
              <span>Sell</span>
            </button>
          ) : (
            <button
              onClick={() => setShowCustomerModal(true)}
              className="flex items-center gap-1.5 bg-[#1B1814] text-[#FAF8F5] px-3.5 py-2 rounded-2xl text-xs font-display font-bold hover:bg-[#2E2820] active-press transition-all shadow-sm ring-1 ring-[#C59A3F]/30"
            >
              <UserPlus className="w-4 h-4 stroke-[2.5] text-[#DFC28F]" />
              <span>Customer</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. Sales Transactions */}
      {subTab === 'sales' && (
        <div className="space-y-2.5">
          {transactions.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-[#FAF8F5] border border-[#E5DFD3] text-[#8A816F]">
              <ArrowRightLeft className="w-8 h-8 mx-auto mb-2 text-[#C7BC9F]" />
              <div className="text-xs font-mono">No transaction history yet</div>
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
                      +{formatRupiah(tx.netProfit)}
                    </div>
                    <div className="text-[10px] text-[#8A816F] font-mono">Net Profit</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E5DFD3] flex items-center justify-between text-xs">
                  <div className="text-[11px] text-[#7A7264] font-mono tabular-nums">
                    Sold: {formatRupiah(tx.sellPrice)} | Cost: {formatRupiah(tx.costPrice)}
                  </div>
                  {tx.customerPhone && (
                    <button
                      onClick={() => openWhatsApp(tx.customerPhone, tx.customerName)}
                      className="p-2 text-[#1E5C27] bg-[#EAF3EA] hover:bg-[#D8EBD9] border border-[#C2E0C7] rounded-xl active-press transition-all"
                      title="Send WhatsApp"
                    >
                      <MessageSquare className="w-4 h-4 stroke-[2.2]" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 2. Customers List */}
      {subTab === 'customers' && (
        <div className="space-y-2.5">
          {customers.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-[#FAF8F5] border border-[#E5DFD3] text-[#8A816F]">
              <Users className="w-8 h-8 mx-auto mb-2 text-[#C7BC9F]" />
              <div className="text-xs font-mono">No customers yet</div>
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
                    Bought: <span className="font-bold text-[#1B1814]">{cust.totalTransactions || 0}x</span> ({formatGram(cust.totalGramsBought || 0)})
                    {cust.address ? ` • ${cust.address}` : ''}
                  </div>
                </div>

                {cust.phone && (
                  <button
                    onClick={() => openWhatsApp(cust.phone, cust.name)}
                    className="p-2 text-[#1E5C27] bg-[#EAF3EA] hover:bg-[#D8EBD9] border border-[#C2E0C7] rounded-xl active-press transition-all"
                    title="Send WhatsApp"
                  >
                    <MessageSquare className="w-4 h-4 stroke-[2.2]" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal: Record Sale */}
      <Modal
        isOpen={showSaleModal}
        onClose={() => setShowSaleModal(false)}
        title="Record Gold Sale"
      >
        <form onSubmit={handleSaveSale} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-[#1B1814] mb-1">Select Gold Item *</label>
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
              <option value="">-- Select Ready Stock --</option>
              {readyItems.map(item => (
                <option key={item.id} value={item.id}>
                  {item.title} ({formatGram(item.weight)}) — Cost: {formatRupiah(item.totalBuyPrice)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-bold text-[#1B1814] mb-1">Customer Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Bu Sri / Mbak Nurul"
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
              <label className="block font-bold text-[#1B1814] mb-1">WhatsApp Number</label>
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
              <label className="block font-bold text-[#1B1814] mb-1">Sale Date *</label>
              <input
                type="date"
                required
                value={saleForm.saleDate}
                onChange={(e) => setSaleForm({ ...saleForm, saleDate: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD3] rounded-xl text-[#1B1814] focus:outline-none focus:border-[#C59A3F] font-sans"
              />
            </div>

            <div>
              <label className="block font-bold text-[#1B1814] mb-1">Payment Method</label>
              <select
                value={saleForm.paymentMethod}
                onChange={(e) => setSaleForm({ ...saleForm, paymentMethod: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD3] rounded-xl text-[#1B1814] focus:outline-none focus:border-[#C59A3F] font-sans"
              >
                <option value="Cash COD">Cash COD</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="DP + Settlement">DP + Settlement</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-bold text-[#1B1814] mb-1">Sale Price (Rp) *</label>
              <input
                type="number"
                required
                value={saleForm.sellPrice}
                onChange={(e) => setSaleForm({ ...saleForm, sellPrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD3] rounded-xl text-[#1B1814] font-mono font-bold focus:outline-none focus:border-[#C59A3F]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#1B1814] mb-1">COD / Delivery Fee (Rp)</label>
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
              <span>Cost:</span>
              <span className="tabular-nums">{formatRupiah(currentCost)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-[#1B1814] pt-1 border-t border-[#E5DFD3]">
              <span>Net Profit:</span>
              <span className="text-[#1E5C27] tabular-nums">
                +{formatRupiah(profitMetrics.netProfit)} ({profitMetrics.marginPercent}%)
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-[#1B1814] text-[#FAF8F5] font-display font-bold rounded-2xl text-xs hover:bg-[#2E2820] transition-all mt-2 active-press ring-1 ring-[#C59A3F]/30"
          >
            Save Sale Transaction
          </button>
        </form>
      </Modal>

      {/* Modal: Add Customer */}
      <Modal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        title="Add Customer"
      >
        <form onSubmit={handleSaveCustomer} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-[#1B1814] mb-1">Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Bu Sri Wahyuni"
              value={custForm.name}
              onChange={(e) => setCustForm({ ...custForm, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD3] rounded-xl text-[#1B1814] focus:outline-none focus:border-[#C59A3F] font-sans"
            />
          </div>

          <div>
            <label className="block font-bold text-[#1B1814] mb-1">WhatsApp *</label>
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
            <label className="block font-bold text-[#1B1814] mb-1">Address</label>
            <input
              type="text"
              placeholder="District / Landmark"
              value={custForm.address}
              onChange={(e) => setCustForm({ ...custForm, address: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD3] rounded-xl text-[#1B1814] focus:outline-none focus:border-[#C59A3F] font-sans"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-[#1B1814] text-[#FAF8F5] font-display font-bold rounded-2xl text-xs hover:bg-[#2E2820] transition-all mt-2 active-press ring-1 ring-[#C59A3F]/30"
          >
            Save Customer
          </button>
        </form>
      </Modal>
    </div>
  );
}
