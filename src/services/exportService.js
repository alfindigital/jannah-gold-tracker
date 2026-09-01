import * as XLSX from 'xlsx';

export function exportFinancialReportToExcel({
  transactions = [],
  inventory = [],
  settings = {},
  reportType = 'all'
}) {
  const wb = XLSX.utils.book_new();

  // 1. Calculations
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

  // Sheet 1: Profit & Loss
  const pnlData = [
    ['PROFIT & LOSS STATEMENT - JANNAH GOLD'],
    ['Report Date:', new Date().toLocaleDateString('en-GB')],
    [''],
    ['Description', 'Amount (IDR)'],
    ['Total Sales (Revenue)', totalOmset],
    ['Cost of Goods Sold (COGS)', totalHpp],
    ['Gross Profit', totalGross],
    ['Operational & Delivery Fees', totalOp],
    ['NET PROFIT', totalNet],
    [''],
    ['Performance Statistics', ''],
    ['Total Gold Sold (Grams)', `${totalGramSold}g`],
    ['Total Transactions', `${transactions.length} orders`],
    ['Avg Profit per Gram', totalGramSold > 0 ? Math.round(totalNet / totalGramSold) : 0]
  ];
  const wsPnl = XLSX.utils.aoa_to_sheet(pnlData);
  XLSX.utils.book_append_sheet(wb, wsPnl, 'Profit & Loss');

  // Sheet 2: Balance Sheet
  const bsData = [
    ['BALANCE SHEET & FINANCIAL POSITION - JANNAH GOLD'],
    ['Report Date:', new Date().toLocaleDateString('en-GB')],
    [''],
    ['CURRENT ASSETS', 'Amount (IDR)'],
    ['Net Cash Collected from Sales', totalOmset - totalOp],
    ['Inventory Value (At Cost)', totalModalStock],
    ['Inventory Value (At Current Market Benchmark)', valuationStock],
    ['TOTAL ASSETS (Cash + Stock Cost)', (totalOmset - totalOp) + totalModalStock],
    [''],
    ['EQUITY & CAPITAL', 'Amount (IDR)'],
    ['Active Stock Capital', totalModalStock],
    ['Accumulated Net Profit', totalNet],
    ['TOTAL NET EQUITY', totalModalStock + totalNet],
    [''],
    ['ACTIVE INVENTORY', ''],
    ['Ready Stock Count', `${readyStock.length} items`],
    ['Total Ready Weight', `${totalGramStock}g`]
  ];
  const wsBs = XLSX.utils.aoa_to_sheet(bsData);
  XLSX.utils.book_append_sheet(wb, wsBs, 'Balance Sheet');

  // Sheet 3: Sales History
  const txData = [
    ['Date', 'Item Title', 'Weight (g)', 'Customer Name', 'Sale Price (IDR)', 'Cost Price (IDR)', 'Delivery Fee (IDR)', 'Net Profit (IDR)', 'Payment Method']
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
  XLSX.utils.book_append_sheet(wb, wsTx, 'Sales History');

  // Generate and Download
  const filename = `Financial_Report_JannahGold_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, filename);
}
