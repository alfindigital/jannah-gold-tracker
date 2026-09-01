import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, SCHEDULE_TYPE, SCHEDULE_STATUS } from '../../db/db';
import { formatRupiah, formatDateTimeIndo, getCleanPhoneNumber } from '../../services/calculationService';
import { 
  Plus, 
  MapPin, 
  Clock, 
  MessageSquare, 
  Calendar,
  Check,
  Trash2
} from 'lucide-react';
import Badge from '../common/Badge';
import Modal from '../common/Modal';

export default function ScheduleTab() {
  const [filterType, setFilterType] = useState('all');
  const [showModal, setShowModal] = useState(false);

  const schedules = useLiveQuery(() => db.schedules.toArray(), []) || [];

  const [formData, setFormData] = useState({
    title: '',
    type: SCHEDULE_TYPE.COD,
    date: new Date().toISOString().split('T')[0],
    time: '14:00',
    location: '',
    contactName: '',
    contactPhone: '',
    targetAmount: 0,
    notes: ''
  });

  const filteredSchedules = schedules.filter(item => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    return true;
  });

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    const cleanTitle = (formData.title || '').replace(/^Jadwal\s+/i, '');

    await db.schedules.add({
      title: cleanTitle,
      type: formData.type,
      date: formData.date,
      time: formData.time,
      location: formData.location,
      contactName: formData.contactName,
      contactPhone: formData.contactPhone,
      targetAmount: Number(formData.targetAmount) || 0,
      status: SCHEDULE_STATUS.PENDING,
      notes: formData.notes,
      createdAt: new Date().toISOString()
    });

    setShowModal(false);
    setFormData({
      title: '',
      type: SCHEDULE_TYPE.COD,
      date: new Date().toISOString().split('T')[0],
      time: '14:00',
      location: '',
      contactName: '',
      contactPhone: '',
      targetAmount: 0,
      notes: ''
    });
  };

  const handleUpdateStatus = async (id, currentStatus) => {
    let nextStatus = SCHEDULE_STATUS.ONGOING;
    if (currentStatus === SCHEDULE_STATUS.ONGOING) {
      nextStatus = SCHEDULE_STATUS.COMPLETED;
    } else if (currentStatus === SCHEDULE_STATUS.COMPLETED) {
      nextStatus = SCHEDULE_STATUS.PENDING;
    }
    await db.schedules.update(id, { status: nextStatus });
  };

  const handleDeleteSchedule = async (id) => {
    if (window.confirm('Hapus jadwal ini?')) {
      await db.schedules.delete(id);
    }
  };

  const openWhatsApp = (phone, name = '') => {
    const cleanPhone = getCleanPhoneNumber(phone);
    if (!cleanPhone) {
      alert('Nomor WhatsApp belum diisi');
      return;
    }
    const greeting = encodeURIComponent(
      `Halo ${name || ''}, salam dari Jannah Gold...`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${greeting}`, '_blank');
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-display font-extrabold text-[#1B1814] tracking-tight">
          Jadwal Agenda
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-[#1B1814] text-[#FAF8F5] px-3.5 py-2 rounded-2xl text-xs font-display font-bold hover:bg-[#2E2820] active-press transition-all shadow-sm ring-1 ring-[#C59A3F]/30"
        >
          <Plus className="w-4 h-4 stroke-[2.5] text-[#DFC28F]" />
          <span>Jadwal</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: 'Semua' },
          { id: SCHEDULE_TYPE.COD, label: 'Antar (COD)' },
          { id: SCHEDULE_TYPE.KULAKAN, label: 'Beli (Kulakan)' }
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilterType(f.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-display font-bold transition-all ${
              filterType === f.id
                ? 'bg-[#1B1814] text-[#E5C378] shadow-md ring-1 ring-[#D4AF37]/60'
                : 'bg-[#FAF8F5] text-[#7A7264] border border-[#E5DFD3] hover:bg-[#F2EDE2]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Schedule Items */}
      <div className="space-y-2.5">
        {filteredSchedules.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-[#FAF8F5] border border-[#E5DFD3] text-[#8A816F]">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-[#C7BC9F]" />
            <div className="text-xs font-mono">Belum ada jadwal aktif</div>
          </div>
        ) : (
          filteredSchedules.map((item) => {
            const displayTitle = (item.title || '').replace(/^Jadwal\s+/i, '');

            return (
              <div
                key={item.id}
                className="p-4 rounded-3xl bg-[#FAF8F5] border border-[#E5DFD3] space-y-3 shadow-xs"
              >
                {/* Header Row: Title on Left, Badge on Right */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-display font-bold text-[#1B1814] leading-snug">
                      {displayTitle}
                    </h3>
                  </div>
                  <div className="shrink-0">
                    <Badge status={item.status} />
                  </div>
                </div>

                {/* Info Row: Time, Location, and Target Budget */}
                <div className="flex items-center justify-between text-[11px] text-[#7A7264] font-mono gap-2 pt-0.5">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-[#1B1814] font-bold">
                      <Clock className="w-3.5 h-3.5 stroke-[2] text-[#A27B2C] shrink-0" />
                      <span>{formatDateTimeIndo(item.date, item.time)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#7A7264]">
                      <MapPin className="w-3.5 h-3.5 stroke-[2] text-[#A27B2C] shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>
                  </div>

                  {item.targetAmount > 0 && (
                    <div className="text-right shrink-0 bg-[#F2EDE2] px-2.5 py-1.5 rounded-xl border border-[#E5DFD3]">
                      <div className="text-[9px] text-[#8A816F] font-semibold">
                        {item.type === SCHEDULE_TYPE.KULAKAN ? 'BUDGET' : 'TOTAL COD'}
                      </div>
                      <div className="text-xs font-mono font-extrabold text-[#1B1814] tabular-nums">
                        {formatRupiah(item.targetAmount)}
                      </div>
                    </div>
                  )}
                </div>

                {item.notes && (
                  <div className="p-2.5 rounded-xl bg-[#F2EDE2] text-[11px] text-[#6B6355] border border-[#E5DFD3]">
                    {item.notes}
                  </div>
                )}

                {/* Action Toolbar */}
                <div className="pt-2 border-t border-[#E5DFD3] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {item.contactPhone && (
                      <button
                        onClick={() => openWhatsApp(item.contactPhone, item.contactName)}
                        className="p-2 text-[#1E5C27] bg-[#EAF3EA] hover:bg-[#D8EBD9] border border-[#C2E0C7] rounded-xl active-press transition-all"
                        title="Kirim WhatsApp"
                      >
                        <MessageSquare className="w-4 h-4 stroke-[2.2]" />
                      </button>
                    )}
                    {item.contactName && (
                      <span className="text-[11px] font-mono text-[#7A7264]">
                        {item.contactName}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleUpdateStatus(item.id, item.status)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold transition-all active-press flex items-center gap-1 ${
                        item.status === SCHEDULE_STATUS.COMPLETED
                          ? 'bg-[#1B1814] text-[#FAF8F5] border border-[#C59A3F]/40 shadow-xs'
                          : item.status === SCHEDULE_STATUS.ONGOING
                          ? 'bg-[#E8EFF8] text-[#1D4E89] border border-[#BDD3EC]'
                          : 'bg-[#F2EDE2] text-[#1B1814] border border-[#E5DFD3] hover:bg-[#EAE5D8]'
                      }`}
                    >
                      {item.status === SCHEDULE_STATUS.COMPLETED ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[2.5] text-[#DFC28F]" />
                          <span>Selesai</span>
                        </>
                      ) : item.status === SCHEDULE_STATUS.ONGOING ? (
                        <span>Proses</span>
                      ) : (
                        <span>Mulai</span>
                      )}
                    </button>

                    <button
                      onClick={() => handleDeleteSchedule(item.id)}
                      className="p-2 text-rose-700 bg-[#FBEBEB] hover:bg-[#F8DADA] border border-[#F2C2C2] rounded-xl active-press transition-all"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5 stroke-[2]" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Tambah Jadwal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Tambah Jadwal Baru"
      >
        <form onSubmit={handleSaveSchedule} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-[#1B1814] mb-1.5">Jenis Agenda</label>
            <div className="grid grid-cols-2 p-1 bg-[#EBE5D8] rounded-2xl font-display font-bold text-xs">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: SCHEDULE_TYPE.COD })}
                className={`py-2 rounded-xl transition-all ${
                  formData.type === SCHEDULE_TYPE.COD
                    ? 'bg-[#1B1814] text-[#FAF8F5] shadow-xs'
                    : 'text-[#7A7264] hover:text-[#1B1814]'
                }`}
              >
                Antar (COD)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: SCHEDULE_TYPE.KULAKAN })}
                className={`py-2 rounded-xl transition-all ${
                  formData.type === SCHEDULE_TYPE.KULAKAN
                    ? 'bg-[#1B1814] text-[#FAF8F5] shadow-xs'
                    : 'text-[#7A7264] hover:text-[#1B1814]'
                }`}
              >
                Beli (Kulakan)
              </button>
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#1B1814] mb-1">Judul Agenda *</label>
            <input
              type="text"
              required
              placeholder={formData.type === SCHEDULE_TYPE.COD ? "Contoh: COD Antam 2g Bu Siti" : "Contoh: Kulakan Butik Antam"}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD3] rounded-xl text-[#1B1814] focus:outline-none focus:border-[#C59A3F] font-sans"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-bold text-[#1B1814] mb-1">Tanggal *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2.5 bg-white border border-[#E5DFD3] rounded-xl text-[#1B1814] focus:outline-none focus:border-[#C59A3F] font-sans"
              />
            </div>

            <div>
              <label className="block font-bold text-[#1B1814] mb-1">Jam *</label>
              <input
                type="time"
                required
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3 py-2.5 bg-white border border-[#E5DFD3] rounded-xl text-[#1B1814] font-mono focus:outline-none focus:border-[#C59A3F]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#1B1814] mb-1">Lokasi Janjian *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Indomaret Point / Rumah Pembeli"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD3] rounded-xl text-[#1B1814] focus:outline-none focus:border-[#C59A3F] font-sans"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-bold text-[#1B1814] mb-1">Nama Kontak</label>
              <input
                type="text"
                placeholder="Contoh: Bu Sri"
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD3] rounded-xl text-[#1B1814] focus:outline-none focus:border-[#C59A3F] font-sans"
              />
            </div>

            <div>
              <label className="block font-bold text-[#1B1814] mb-1">WhatsApp Kontak</label>
              <input
                type="tel"
                placeholder="0812xxxx"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD3] rounded-xl text-[#1B1814] font-mono focus:outline-none focus:border-[#C59A3F]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#1B1814] mb-1">Estimasi Nominal (Rp)</label>
            <input
              type="number"
              value={formData.targetAmount}
              onChange={(e) => setFormData({ ...formData, targetAmount: parseFloat(e.target.value) || 0 })}
              className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD3] rounded-xl text-[#1B1814] font-mono font-bold focus:outline-none focus:border-[#C59A3F]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#1B1814] mb-1">Catatan Tambahan</label>
            <textarea
              rows="2"
              placeholder="Contoh: Bawa uang kembalian..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD3] rounded-xl text-[#1B1814] focus:outline-none focus:border-[#C59A3F] font-sans"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-[#1B1814] text-[#FAF8F5] font-display font-bold rounded-2xl text-xs hover:bg-[#2E2820] transition-all mt-2 active-press ring-1 ring-[#C59A3F]/30"
          >
            Simpan Jadwal
          </button>
        </form>
      </Modal>
    </div>
  );
}
