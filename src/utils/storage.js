import { buildDemoData } from './demoData.js';

export const PRODUCTS_KEY = 'stockpilot_products';
export const MOVEMENTS_KEY = 'stockpilot_movements';

function sanitizeProduct(product) {
  if (!product || typeof product !== 'object') return null;
  if (!product.id || !product.name || !product.sku) return null;

  const quantity = Number(product.quantity);
  const minStock = Number(product.minStock);
  const unitPrice = Number(product.unitPrice);
  if (!Number.isFinite(quantity) || !Number.isFinite(minStock) || !Number.isFinite(unitPrice)) return null;

  return {
    id: String(product.id),
    name: String(product.name),
    sku: String(product.sku),
    category: String(product.category || 'Genel'),
    quantity,
    minStock,
    unitPrice,
    description: String(product.description || ''),
    createdAt: product.createdAt || new Date().toISOString(),
    updatedAt: product.updatedAt || product.createdAt || new Date().toISOString(),
    demo: Boolean(product.demo),
  };
}

function sanitizeMovement(movement) {
  if (!movement || typeof movement !== 'object') return null;
  if (!movement.id || !movement.productId) return null;
  if (movement.type !== 'in' && movement.type !== 'out') return null;

  const quantity = Number(movement.quantity);
  if (!Number.isInteger(quantity) || quantity <= 0) return null;

  return {
    id: String(movement.id),
    productId: String(movement.productId),
    productName: String(movement.productName || ''),
    sku: String(movement.sku || ''),
    type: movement.type,
    quantity,
    description: String(movement.description || ''),
    createdAt: movement.createdAt || new Date().toISOString(),
  };
}

function readList(key, sanitize) {
  const raw = localStorage.getItem(key);
  if (raw === null) return { missing: true, items: [] };
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return { missing: false, items: [] };
    return { missing: false, items: parsed.map(sanitize).filter(Boolean) };
  } catch {
    return { missing: false, items: [], corrupt: true };
  }
}

export function loadProducts() {
  return readList(PRODUCTS_KEY, sanitizeProduct).items;
}

export function loadMovements() {
  return readList(MOVEMENTS_KEY, sanitizeMovement).items;
}

export function saveProducts(products) {
  try {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    return { ok: true };
  } catch {
    return { ok: false, error: 'Ürünler tarayıcıya kaydedilemedi.' };
  }
}

export function saveMovements(movements) {
  try {
    localStorage.setItem(MOVEMENTS_KEY, JSON.stringify(movements));
    return { ok: true };
  } catch {
    return { ok: false, error: 'Stok hareketleri tarayıcıya kaydedilemedi.' };
  }
}

export function initializeStorage() {
  try {
    const storedProducts = readList(PRODUCTS_KEY, sanitizeProduct);
    if (storedProducts.missing) {
      const seed = buildDemoData();
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(seed.products));
      localStorage.setItem(MOVEMENTS_KEY, JSON.stringify(seed.movements));
      return { products: seed.products, movements: seed.movements, seeded: true, error: '' };
    }

    const storedMovements = readList(MOVEMENTS_KEY, sanitizeMovement);
    return {
      products: storedProducts.items,
      movements: storedMovements.items,
      seeded: false,
      error: storedProducts.corrupt
        ? 'Kayıtlı ürün verisi okunamadı. Liste boş olarak açıldı.'
        : '',
    };
  } catch {
    return {
      products: [],
      movements: [],
      seeded: false,
      error: 'Tarayıcı depolamasına erişilemedi. Veriler bu oturumda kaydedilemeyebilir.',
    };
  }
}
