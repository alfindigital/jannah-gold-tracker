import * as XLSX from 'xlsx';

export function exportFinancialReportToExcel({
  transactions = [],
  inventory = [],
  settings = {},
  reportType = 'all'
}) {
  const wb = XLSX.utils.book_new();

  // 1. Perhitungan Dasar
  const totalOmset = transactions.reduce((acc, tx) => acc + (Number(tx.sellPrice) || 0), 0);
  const totalHpp = transactions.reduce((acc, tx) => acc + (Number(tx.costPrice) || 0), 0);
  const totalGross = transactions.reduce((acc, tx) => acc + (Number(tx.grossProfit) || 0), 0);
  const totalOp = transactions.reduce((acc, tx) => acc + (Number(tx.operationalFee) || 0), 0);
  const totalNet = transactions.reduce((acc, tx) => acc + (Number(tx.netProfit) || 0), 0);
  const totalGramSold = transactions.reduce((acc, tx) => acc + (Number(tx.weight) || 0), 0);

  const readyStock = inventory.filter(i => i.status === 'ready');
  const totalModalStock = readyStock.reduce((acc, i) => acc + (Number(i.totalBuyPrice) || 0), 0);
  const totalGramStock = readyStock.reduce((acc, i) => acc + (Number(i.weight) || 0), 0);
  const marketPrice = (Number(settings.antam1g || 1455000) + Number(settings.ubs1g || 1420000)) / 2;
  const valuationStock = totalGramStock * marketPrice;

  // Sheet 1: Laba Rugi (Profit & Loss)
  const pnlData = [
    ['LAPORAN LABA RUGI - JANNAH GOLD'],
    ['Tanggal Laporan:', new Date().toLocaleDateString('id-ID')],
    [''],
    ['Deskripsi Pos', 'Jumlah (Rupiah)'],
    ['Total Penjualan (Omset)', totalOmset],
    ['Harga Pokok Penjualan (HPP)', totalHpp],
    ['Laba Kotor', totalGross],
    ['Biaya Operasional & Kurir', totalOp],
    ['LABA BERSIH (NET PROFIT)', totalNet],
    [''],
    ['Statistik Penjualan', ''],
    ['Total Emas Terjual (Gram)', `${totalGramSold}g`],
    ['Total Pesanan / Transaksi', `${transactions.length} pesanan`],
    ['Rata-rata Laba per Gram', totalGramSold > 0 ? Math.round(totalNet / totalGramSold) : 0]
  ];
  const wsPnl = XLSX.utils.aoa_to_sheet(pnlData);
  XLSX.utils.book_append_sheet(wb, wsPnl, 'Laba Rugi');

  // Sheet 2: Neraca Keuangan (Balance Sheet)
  const bsData = [
    ['NERACA & POSISI KEUANGAN - JANNAH GOLD'],
    ['Tanggal Laporan:', new Date().toLocaleDateString('id-ID')],
    [''],
    ['1. ASET LANCAR', 'Jumlah (Rupiah)'],
    ['Kas Terkumpul dari Penjualan (Net)', totalOmset - totalOp],
    ['Nilai Persediaan Emas (Sesuai Modal)', totalModalStock],
    ['Nilai Pasar Emas (Sesuai Acuan Hari Ini)', valuationStock],
    ['TOTAL ASET LANCAR (Kas + Modal Stok)', (totalOmset - totalOp) + totalModalStock],
    [''],
    ['2. EKUITAS & MODAL', 'Jumlah (Rupiah)'],
    ['Modal Stok Aktif', totalModalStock],
    ['Akumulasi Laba Bersih', totalNet],
    ['TOTAL EKUITAS BERSIH', totalModalStock + totalNet],
    [''],
    ['INFORMASI STOK AKTIF', ''],
    ['Jumlah Item Ready', `${readyStock.length} item`],
    ['Total Berat Ready', `${totalGramStock}g`]
  ];
  const wsBs = XLSX.utils.aoa_to_sheet(bsData);
  XLSX.utils.book_append_sheet(wb, wsBs, 'Neraca');

  // Sheet 3: Riwayat Penjualan
  const txData = [
    ['Tanggal', 'Nama Barang', 'Berat (g)', 'Nama Pembeli', 'No WhatsApp', 'Harga Jual (Rp)', 'Modal Beli (Rp)', 'Biaya Kurir (Rp)', 'Laba Bersih (Rp)', 'Metode Pembayaran', 'Catatan']
  ];
  transactions.forEach(tx => {
    txData.push([
      tx.saleDate || '-',
      tx.itemTitle || 'Emas',
      tx.weight || 0,
      tx.customerName || '-',
      tx.customerPhone || '-',
      tx.sellPrice || 0,
      tx.costPrice || 0,
      tx.operationalFee || 0,
      tx.netProfit || 0,
      tx.paymentMethod || 'Cash COD',
      tx.notes || ''
    ]);
  });
  const wsTx = XLSX.utils.aoa_to_sheet(txData);
  XLSX.utils.book_append_sheet(wb, wsTx, 'Riwayat Penjualan');

  // Sheet 4: Inventori & Stok Emas
  const invData = [
    ['Status', 'Nama Item / Seri', 'Brand', 'Jenis', 'Kadar', 'Berat (g)', 'Tanggal Beli', 'Supplier', 'Harga Beli Satuan (Rp)', 'Ongkos / Cetak (Rp)', 'Total Modal (Rp)', 'Catatan']
  ];
  inventory.forEach(item => {
    invData.push([
      item.status || 'ready',
      item.title || '-',
      item.brand || 'Antam',
      item.type || 'Logam Mulia',
      item.purity || '24K',
      item.weight || 0,
      item.purchaseDate || '-',
      item.supplier || '-',
      item.buyPriceUnit || 0,
      item.buyCostExtra || 0,
      item.totalBuyPrice || 0,
      item.notes || ''
    ]);
  });
  const wsInv = XLSX.utils.aoa_to_sheet(invData);
  XLSX.utils.book_append_sheet(wb, wsInv, 'Inventori Stok');

  // Unduh Berkas
  const filename = `Laporan_Keuangan_JannahGold_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, filename);
}



/**
 * Ekspor seluruh database Dexie ke file JSON (Cadangan Lengkap)
 */
export async function exportDatabaseJSON(db) {
  try {
    const inventory = await db.inventory.toArray();
    const transactions = await db.transactions.toArray();
    const customers = await db.customers.toArray();
    const schedules = await db.schedules.toArray();
    const settings = await db.settings.toArray();

    const backupData = {
      app: 'JannahGoldTracker',
      version: '1.1',
      exportedAt: new Date().toISOString(),
      counts: {
        inventory: inventory.length,
        transactions: transactions.length,
        customers: customers.length,
        schedules: schedules.length
      },
      data: {
        inventory,
        transactions,
        customers,
        schedules,
        settings
      }
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `JannahGold_Backup_Lengkap_${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Simpan tanggal backup terakhir ke localStorage
    localStorage.setItem('jannah_gold_last_backup', new Date().toISOString());
    return { success: true, count: transactions.length + inventory.length };
  } catch (error) {
    console.error('Gagal mengekspor backup JSON:', error);
    throw error;
  }
}

/**
 * Impor & Pulihkan database Dexie dari file JSON
 */
export async function importDatabaseJSON(file, db) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const json = JSON.parse(e.target.result);
        if (!json || (!json.app?.includes('JannahGold')) || !json.data) {
          throw new Error('Format file cadangan tidak valid atau bukan file Jannah Gold.');
        }

        const { inventory = [], transactions = [], customers = [], schedules = [], settings = [] } = json.data;

        await db.transaction('rw', [db.inventory, db.transactions, db.customers, db.schedules, db.settings], async () => {
          // Bersihkan data lama untuk pemulihan utuh
          await db.inventory.clear();
          await db.transactions.clear();
          await db.customers.clear();
          await db.schedules.clear();
          await db.settings.clear();

          // Muat data baru dengan bulkPut agar aman
          if (inventory.length) await db.inventory.bulkPut(inventory);
          if (transactions.length) await db.transactions.bulkPut(transactions);
          if (customers.length) await db.customers.bulkPut(customers);
          if (schedules.length) await db.schedules.bulkPut(schedules);
          if (settings.length) await db.settings.bulkPut(settings);
        });

        localStorage.setItem('jannah_gold_last_backup', new Date().toISOString());
        resolve({
          success: true,
          counts: {
            inventory: inventory.length,
            transactions: transactions.length,
            customers: customers.length,
            schedules: schedules.length
          }
        });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsText(file);
  });
}
