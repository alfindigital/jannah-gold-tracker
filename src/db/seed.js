import { db, STATUS, SCHEDULE_TYPE, SCHEDULE_STATUS } from './db';

export async function seedInitialData() {
  const count = await db.inventory.count();
  if (count > 0) return; // already seeded

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  
  // 1. Initial Settings
  await db.settings.put({
    key: 'gold_price_live',
    antam1g: 1455000,
    ubs1g: 1420000,
    galeri24_1g: 1415000,
    spotGram: 1380000,
    buyback1g: 1330000,
    lastUpdated: todayStr
  });

  await db.settings.put({
    key: 'store_info',
    storeName: 'Jannah Gold',
    ownerName: 'Istri Tercinta',
    city: 'Purbalingga',
    phone: '081234567890'
  });

  // 2. Initial Customers
  const cust1Id = await db.customers.add({
    name: 'Bu Sri Wahyuni',
    phone: '081228991234',
    address: 'Jl. Mayjen Sungkono No. 12, Kalimanah, Purbalingga',
    totalTransactions: 3,
    totalGramsBought: 12.5,
    notes: 'Pelanggan loyal, suka LM Antam pecahan 5g & 10g',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
  });

  const cust2Id = await db.customers.add({
    name: 'Mbak Nurul Aini',
    phone: '085741223344',
    address: 'Perum Griya Abadi Blok C-4, Padamara',
    totalTransactions: 2,
    totalGramsBought: 6.0,
    notes: 'Suka nabung pecahan kecil 0.5g & 1g',
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString()
  });

  const cust3Id = await db.customers.add({
    name: 'Bu Hj. Siti Fatimah',
    phone: '081399887766',
    address: 'Pasar Bobotsari Kios B-15',
    totalTransactions: 4,
    totalGramsBought: 25.0,
    notes: 'Suka perhiasan kadar 22K dan batangan UBS',
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString()
  });

  // 3. Initial Inventory
  const inv1 = await db.inventory.add({
    title: 'Antam 1 Gram Certicard 2026',
    brand: 'Antam',
    type: 'Batangan (LM)',
    weight: 1.0,
    purity: '24K / 99.99%',
    purchaseDate: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
    supplier: 'Butik Emas LM Yogyakarta',
    buyPriceUnit: 1375000,
    buyCostExtra: 0,
    totalBuyPrice: 1375000,
    status: STATUS.READY,
    notes: 'Kemasan Redesign Certicard mulus',
    createdAt: new Date().toISOString()
  });

  const inv2 = await db.inventory.add({
    title: 'Antam 5 Gram Certicard 2026',
    brand: 'Antam',
    type: 'Batangan (LM)',
    weight: 5.0,
    purity: '24K / 99.99%',
    purchaseDate: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
    supplier: 'Distributor Resmi',
    buyPriceUnit: 6750000,
    buyCostExtra: 25000,
    totalBuyPrice: 6775000,
    status: STATUS.BOOKED,
    notes: 'Sudah di-booking Bu Sri, siap COD sore ini',
    createdAt: new Date().toISOString()
  });

  const inv3 = await db.inventory.add({
    title: 'UBS 2 Gram Gold Bar',
    brand: 'UBS',
    type: 'Batangan (LM)',
    weight: 2.0,
    purity: '24K / 99.99%',
    purchaseDate: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
    supplier: 'Toko Emas Berkah',
    buyPriceUnit: 2680000,
    buyCostExtra: 0,
    totalBuyPrice: 2680000,
    status: STATUS.READY,
    notes: 'Segel press utuh barcode scan valid',
    createdAt: new Date().toISOString()
  });

  const inv4 = await db.inventory.add({
    title: 'Galeri 24 Baby Gold 0.5 Gram',
    brand: 'Galeri 24',
    type: 'Batangan (LM)',
    weight: 0.5,
    purity: '24K / 99.99%',
    purchaseDate: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0],
    supplier: 'Pegadaian Galeri24',
    buyPriceUnit: 710000,
    buyCostExtra: 0,
    totalBuyPrice: 710000,
    status: STATUS.READY,
    notes: 'Edisi Souvenir Series',
    createdAt: new Date().toISOString()
  });

  const inv5 = await db.inventory.add({
    title: 'Cincin Emas Simple Ring 22K',
    brand: 'Perhiasan',
    type: 'Cincin',
    weight: 3.2,
    purity: '22K / 91.6%',
    purchaseDate: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0],
    supplier: 'Pengrajin Emas Jawa',
    buyPriceUnit: 2750000,
    buyCostExtra: 50000,
    totalBuyPrice: 2800000,
    status: STATUS.READY,
    notes: 'Ukuran jari no. 14, krum kuning glossy',
    createdAt: new Date().toISOString()
  });

  // Sold Inventory Item for history
  const invSold = await db.inventory.add({
    title: 'Antam 10 Gram Certicard 2026',
    brand: 'Antam',
    type: 'Batangan (LM)',
    weight: 10.0,
    purity: '24K / 99.99%',
    purchaseDate: new Date(Date.now() - 15 * 86400000).toISOString().split('T')[0],
    supplier: 'Butik Emas LM Yogyakarta',
    buyPriceUnit: 13500000,
    buyCostExtra: 0,
    totalBuyPrice: 13500000,
    status: STATUS.SOLD,
    notes: 'Terjual COD tempo hari',
    createdAt: new Date().toISOString()
  });

  // 4. Initial Transactions
  await db.transactions.add({
    inventoryId: invSold,
    itemTitle: 'Antam 10 Gram Certicard 2026',
    weight: 10.0,
    customerId: cust1Id,
    customerName: 'Bu Sri Wahyuni',
    customerPhone: '081228991234',
    saleDate: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    costPrice: 13500000,
    sellPrice: 14350000,
    operationalFee: 25000, // bensin COD
    grossProfit: 850000,
    netProfit: 825000,
    paymentMethod: 'Cash COD',
    notes: 'COD di Kantor Kalimanah, lunas tunai di tempat',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
  });

  await db.transactions.add({
    inventoryId: 999,
    itemTitle: 'Antam 1 Gram Retro Certi',
    weight: 1.0,
    customerId: cust2Id,
    customerName: 'Mbak Nurul Aini',
    customerPhone: '085741223344',
    saleDate: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
    costPrice: 1360000,
    sellPrice: 1450000,
    operationalFee: 10000,
    grossProfit: 90000,
    netProfit: 80000,
    paymentMethod: 'Transfer Bank',
    notes: 'COD di Kafe Padamara, transfer BCA di tempat',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString()
  });

  // 5. Initial Schedules (COD & Kulakan)
  await db.schedules.add({
    type: SCHEDULE_TYPE.COD,
    title: 'COD Antam 5g - Bu Sri Wahyuni',
    date: todayStr, // Hari ini!
    time: '16:30',
    location: 'Alun-alun Purbalingga (Dekat Air Mancur)',
    targetAmount: 7150000,
    relatedInventoryId: inv2,
    customerId: cust1Id,
    status: SCHEDULE_STATUS.PENDING,
    notes: 'Bawa nota fisik, Bu Sri minta dicek dulu kemasannya dengan scan CertiEye',
    createdAt: new Date().toISOString()
  });

  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  await db.schedules.add({
    type: SCHEDULE_TYPE.COD,
    title: 'COD UBS 2g - Mbak Nurul',
    date: tomorrowStr,
    time: '10:00',
    location: 'Depan Alfamart Kalikabong',
    targetAmount: 2820000,
    relatedInventoryId: inv3,
    customerId: cust2Id,
    status: SCHEDULE_STATUS.PENDING,
    notes: 'Janjian pas jam istirahat kantor',
    createdAt: new Date().toISOString()
  });

  const nextWeekStr = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];
  await db.schedules.add({
    type: SCHEDULE_TYPE.RESTOCK,
    title: 'Beli Stok Emas (Butik/Agen)',
    date: nextWeekStr,
    time: '08:30',
    location: 'Butik Emas LM / Toko Supplier Utama',
    targetAmount: 25000000, // Budget 25jt
    status: SCHEDULE_STATUS.PENDING,
    notes: 'Target beli: Antam 1g x 10 keping, UBS 2g x 3 keping, Galeri 24 Baby Gold',
    createdAt: new Date().toISOString()
  });
}
