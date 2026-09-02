import Dexie from 'dexie';

export const db = new Dexie('JannahGoldDB');

db.version(1).stores({
  inventory: '++id, brand, type, weight, status, purchaseDate, createdAt',
  transactions: '++id, inventoryId, customerId, saleDate, createdAt',
  customers: '++id, name, phone, createdAt',
  schedules: '++id, type, date, status, customerId, createdAt',
  settings: 'key'
});

export const STATUS = {
  READY: 'ready',
  BOOKED: 'booked',
  SOLD: 'sold'
};

export const SCHEDULE_TYPE = {
  COD: 'cod_delivery',
  RESTOCK: 'restock_trip'
};

export const SCHEDULE_STATUS = {
  PENDING: 'pending',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};
