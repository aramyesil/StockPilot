import { getStockStatus, STATUS_META } from './inventory.js';

const currencyFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat('tr-TR');

const dateFormatter = new Intl.DateTimeFormat('tr-TR', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Europe/Istanbul',
});

const todayFormatter = new Intl.DateTimeFormat('tr-TR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: 'Europe/Istanbul',
});

const csvNumberFormatter = new Intl.NumberFormat('tr-TR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: false,
});

export function formatCurrency(value) {
  return currencyFormatter.format(Number(value) || 0);
}

export function formatNumber(value) {
  return numberFormatter.format(Number(value) || 0);
}

export function formatQuantity(value) {
  return `${formatNumber(value)} adet`;
}

export function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return dateFormatter.format(date);
}

export function formatToday() {
  return todayFormatter.format(new Date());
}

function escapeCsv(value) {
  const text = String(value ?? '');
  if (/[;"\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function productsToCsv(products) {
  const headers = [
    'Ürün Adı',
    'SKU',
    'Kategori',
    'Miktar',
    'Minimum Stok',
    'Birim Fiyat (TRY)',
    'Envanter Değeri (TRY)',
    'Durum',
    'Açıklama',
    'Oluşturulma',
    'Güncellenme',
  ];

  const rows = products.map((product) => [
    product.name,
    product.sku,
    product.category,
    product.quantity,
    product.minStock,
    csvNumberFormatter.format(product.unitPrice),
    csvNumberFormatter.format(product.quantity * product.unitPrice),
    STATUS_META[getStockStatus(product)].label,
    product.description || '',
    formatDate(product.createdAt),
    formatDate(product.updatedAt),
  ]);

  return [headers, ...rows].map((row) => row.map(escapeCsv).join(';')).join('\r\n');
}

export function downloadProductsCsv(products) {
  const csv = `\uFEFF${productsToCsv(products)}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const stamp = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Istanbul' }).format(new Date());
  link.href = url;
  link.download = `stockpilot-urunler-${stamp}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
