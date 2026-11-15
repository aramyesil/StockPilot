export const CATEGORY_SUGGESTIONS = [
  'Elektronik',
  'Kırtasiye',
  'Gıda',
  'Temizlik',
  'Ofis Mobilyası',
];

export const CHART_COLORS = ['#0f766e', '#2563eb', '#0284c7', '#0d9488', '#1e3a8a', '#64748b'];

export const STATUS_META = {
  ok: { label: 'Yeterli', className: 'badge-ok' },
  critical: { label: 'Kritik', className: 'badge-critical' },
  out: { label: 'Stok Tükendi', className: 'badge-out' },
};

export function createId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getStockStatus(product) {
  if (Number(product.quantity) <= 0) return 'out';
  if (Number(product.quantity) <= Number(product.minStock)) return 'critical';
  return 'ok';
}

export function isCritical(product) {
  return Number(product.quantity) <= Number(product.minStock);
}

function isBlank(value) {
  return String(value ?? '').trim() === '';
}

function parseInteger(value) {
  if (typeof value === 'number') return Number.isInteger(value) ? value : Number.NaN;
  const normalized = String(value ?? '').trim().replace(/\s/g, '');
  if (!/^-?\d+$/.test(normalized)) return Number.NaN;
  return Number(normalized);
}

function parseDecimal(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : Number.NaN;
  const normalized = String(value ?? '').trim().replace(/\s/g, '').replace(',', '.');
  if (!/^-?\d+(\.\d+)?$/.test(normalized)) return Number.NaN;
  return Number(normalized);
}

export function validateProduct(input, products, editingId) {
  const errors = {};
  const name = String(input.name ?? '').trim();
  const sku = String(input.sku ?? '').trim().toUpperCase();
  const category = String(input.category ?? '').trim();
  const description = String(input.description ?? '').trim();

  if (!name) errors.name = 'Ürün adı boş bırakılamaz.';
  else if (name.length < 2) errors.name = 'Ürün adı en az 2 karakter olmalıdır.';
  else if (name.length > 80) errors.name = 'Ürün adı en fazla 80 karakter olabilir.';

  if (!sku) errors.sku = 'SKU zorunludur.';
  else if (!/^[A-Z0-9][A-Z0-9-]{1,31}$/.test(sku)) {
    errors.sku = 'SKU 2-32 karakter olmalı; yalnızca harf, rakam ve tire kullanılabilir.';
  } else if (products.some((item) => item.id !== editingId && item.sku.toUpperCase() === sku)) {
    errors.sku = 'Bu SKU başka bir üründe kullanılıyor. Benzersiz bir SKU girin.';
  }

  if (!category) errors.category = 'Kategori zorunludur.';
  else if (category.length > 40) errors.category = 'Kategori en fazla 40 karakter olabilir.';

  const quantity = parseInteger(input.quantity);
  if (isBlank(input.quantity)) errors.quantity = 'Stok miktarı zorunludur.';
  else if (!Number.isInteger(quantity) || quantity < 0) {
    errors.quantity = 'Stok negatif olamaz ve tam sayı olmalıdır.';
  }

  const minStock = parseInteger(input.minStock);
  if (isBlank(input.minStock)) errors.minStock = 'Minimum stok zorunludur.';
  else if (!Number.isInteger(minStock) || minStock < 0) {
    errors.minStock = 'Minimum stok negatif olamaz ve tam sayı olmalıdır.';
  }

  let unitPrice = parseDecimal(input.unitPrice);
  if (isBlank(input.unitPrice)) errors.unitPrice = 'Birim fiyat zorunludur.';
  else if (!Number.isFinite(unitPrice) || unitPrice < 0) errors.unitPrice = 'Fiyat negatif olamaz.';
  else unitPrice = Math.round(unitPrice * 100) / 100;

  if (description.length > 300) errors.description = 'Açıklama en fazla 300 karakter olabilir.';

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    value: {
      name,
      sku,
      category,
      quantity,
      minStock,
      unitPrice,
      description,
    },
  };
}

export function createProductRecord(value) {
  const timestamp = new Date().toISOString();
  return {
    id: createId(),
    name: value.name,
    sku: value.sku,
    category: value.category,
    quantity: value.quantity,
    minStock: value.minStock,
    unitPrice: value.unitPrice,
    description: value.description,
    createdAt: timestamp,
    updatedAt: timestamp,
    demo: false,
  };
}

export function mergeProductRecord(existing, value) {
  return {
    ...existing,
    name: value.name,
    sku: value.sku,
    category: value.category,
    quantity: value.quantity,
    minStock: value.minStock,
    unitPrice: value.unitPrice,
    description: value.description,
    updatedAt: new Date().toISOString(),
    demo: false,
  };
}

export function filterProducts(products, { query = '', category = 'all', status = 'all', sort = 'name-asc' } = {}) {
  const needle = query.trim().toLocaleLowerCase('tr');

  const filtered = products.filter((product) => {
    const haystack = [product.name, product.sku, product.category, product.description]
      .join(' ')
      .toLocaleLowerCase('tr');
    const matchesQuery = needle === '' || haystack.includes(needle);
    const matchesCategory = category === 'all' || product.category === category;
    const productStatus = getStockStatus(product);
    const matchesStatus =
      status === 'all' ||
      (status === 'ok' && productStatus === 'ok') ||
      (status === 'critical' && isCritical(product)) ||
      (status === 'out' && productStatus === 'out');
    return matchesQuery && matchesCategory && matchesStatus;
  });

  return filtered.sort((left, right) => {
    switch (sort) {
      case 'name-desc':
        return right.name.localeCompare(left.name, 'tr');
      case 'quantity-asc':
        return left.quantity - right.quantity || left.name.localeCompare(right.name, 'tr');
      case 'quantity-desc':
        return right.quantity - left.quantity || left.name.localeCompare(right.name, 'tr');
      case 'price-asc':
        return left.unitPrice - right.unitPrice || left.name.localeCompare(right.name, 'tr');
      case 'price-desc':
        return right.unitPrice - left.unitPrice || left.name.localeCompare(right.name, 'tr');
      case 'updated-desc':
        return new Date(right.updatedAt) - new Date(left.updatedAt);
      default:
        return left.name.localeCompare(right.name, 'tr');
    }
  });
}

export function summarizeInventory(products) {
  const criticalProducts = products
    .filter(isCritical)
    .sort((left, right) => left.quantity - right.quantity || left.name.localeCompare(right.name, 'tr'));

  return {
    totalVarieties: products.length,
    totalQuantity: products.reduce((sum, product) => sum + Number(product.quantity), 0),
    totalValue: products.reduce((sum, product) => sum + Number(product.quantity) * Number(product.unitPrice), 0),
    criticalCount: criticalProducts.length,
    criticalProducts,
  };
}

export function categoryDistribution(products) {
  const counts = new Map();
  products.forEach((product) => {
    counts.set(product.category, (counts.get(product.category) || 0) + 1);
  });
  return [...counts.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((left, right) => right.value - left.value || left.name.localeCompare(right.name, 'tr'));
}

export function statusDistribution(products) {
  const counts = { ok: 0, critical: 0, out: 0 };
  products.forEach((product) => {
    counts[getStockStatus(product)] += 1;
  });
  return [
    { key: 'ok', name: 'Yeterli', value: counts.ok, fill: '#0f766e' },
    { key: 'critical', name: 'Kritik', value: counts.critical, fill: '#ea580c' },
    { key: 'out', name: 'Tükendi', value: counts.out, fill: '#e11d48' },
  ];
}

export function applyStockMovement(products, movements, input) {
  const product = products.find((item) => item.id === input.productId);
  if (!product) return { ok: false, field: 'productId', error: 'Ürün seçilmelidir.' };

  if (input.type !== 'in' && input.type !== 'out') {
    return { ok: false, field: 'type', error: 'İşlem türü seçilmelidir.' };
  }

  const quantity = parseInteger(input.quantity);
  if (isBlank(input.quantity) || !Number.isInteger(quantity) || quantity <= 0) {
    return { ok: false, field: 'quantity', error: 'Miktar 0’dan büyük bir tam sayı olmalıdır.' };
  }

  if (input.type === 'out' && quantity > product.quantity) {
    return {
      ok: false,
      field: 'quantity',
      error: `Mevcut stoktan fazla çıkış yapılamaz. Mevcut stok: ${product.quantity} adet.`,
    };
  }

  const description = String(input.description ?? '').trim();
  if (description.length > 240) {
    return { ok: false, field: 'description', error: 'Açıklama en fazla 240 karakter olabilir.' };
  }

  const timestamp = new Date().toISOString();
  const nextQuantity = input.type === 'in' ? product.quantity + quantity : product.quantity - quantity;
  const nextProducts = products.map((item) =>
    item.id === product.id ? { ...item, quantity: nextQuantity, updatedAt: timestamp, demo: false } : item,
  );
  const movement = {
    id: createId(),
    productId: product.id,
    productName: product.name,
    sku: product.sku,
    type: input.type,
    quantity,
    description,
    createdAt: timestamp,
  };

  return {
    ok: true,
    products: nextProducts,
    movements: [movement, ...movements],
    message: input.type === 'in' ? 'Stok girişi kaydedildi.' : 'Stok çıkışı kaydedildi.',
  };
}

export function movementProductLabel(movement, products) {
  const product = products.find((item) => item.id === movement.productId);
  if (product) return { name: product.name, sku: product.sku, missing: false };
  if (movement.productName) return { name: movement.productName, sku: movement.sku || '—', missing: true };
  return { name: 'Silinmiş ürün', sku: '—', missing: true };
}

export function sortMovements(movements) {
  return [...movements].sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
}
