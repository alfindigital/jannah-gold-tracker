/**
 * Financial & Date Utilities
 */

export function formatRupiah(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatShortRupiah(amount) {
  if (!amount) return '0';
  return new Intl.NumberFormat('id-ID').format(amount);
}

export function formatJuta(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '0 jt';
  const num = Number(amount);
  if (Math.abs(num) >= 1000000) {
    const inJt = num / 1000000;
    const formatted = inJt.toLocaleString('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
    return `${formatted} jt`;
  } else if (Math.abs(num) >= 1000) {
    const inRb = num / 1000;
    const formatted = inRb.toLocaleString('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1
    });
    return `${formatted} rb`;
  }
  return num.toLocaleString('id-ID');
}

export function formatRupiahJuta(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return 'Rp 0';
  const num = Number(amount);
  if (Math.abs(num) >= 1000000) {
    const inJt = num / 1000000;
    const formatted = inJt.toLocaleString('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
    return `Rp ${formatted} jt`;
  } else if (Math.abs(num) >= 1000) {
    const inRb = num / 1000;
    const formatted = inRb.toLocaleString('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1
    });
    return `Rp ${formatted} rb`;
  }
  return `Rp ${num.toLocaleString('id-ID')}`;
}

export function formatGram(gram) {
  if (gram === undefined || gram === null || isNaN(gram)) return '0g';
  return `${Number(gram).toLocaleString('id-ID', { maximumFractionDigits: 2 })}g`;
}

export function formatDateIndo(dateStr) {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: '2-digit'
    }).format(d);
  } catch (e) {
    return dateStr;
  }
}

export function formatDateTimeIndo(dateStr, timeStr) {
  const d = formatDateIndo(dateStr);
  return timeStr ? `${d}, ${timeStr}` : d;
}

export function calculateNetProfit(sellPrice, costPrice, operationalFee = 0) {
  const gross = Number(sellPrice || 0) - Number(costPrice || 0);
  const net = gross - Number(operationalFee || 0);
  const marginPercent = costPrice > 0 ? ((net / Number(costPrice)) * 100).toFixed(1) : 0;
  return {
    grossProfit: gross,
    netProfit: net,
    marginPercent: Number(marginPercent)
  };
}

export function getCleanPhoneNumber(phone) {
  if (!phone) return '';
  let clean = phone.replace(/[^0-9]/g, '');
  if (clean.startsWith('0')) {
    clean = '62' + clean.slice(1);
  }
  return clean;
}
