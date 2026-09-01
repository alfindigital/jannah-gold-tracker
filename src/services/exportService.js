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
    ['Tanggal', 'Nama Barang', 'Berat (g)', 'Nama Pembeli', 'Harga Jual (Rp)', 'Modal Beli (Rp)', 'Biaya COD (Rp)', 'Laba Bersih (Rp)', 'Metode Pembayaran']
  ];
  transactions.forEach(tx => {
    txData.push([
      tx.saleDate,
      tx.itemTitle,
      tx.weight,
      tx.customerName,
      tx.sellPrice,
      tx.costPrice,
      tx.operationalFee || 0,
      tx.netProfit,
      tx.paymentMethod || 'Cash COD'
    ]);
  });
  const wsTx = XLSX.utils.aoa_to_sheet(txData);
  XLSX.utils.book_append_sheet(wb, wsTx, 'Riwayat Penjualan');

  // Unduh Berkas
  const filename = `Laporan_Keuangan_JannahGold_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, filename);
}
