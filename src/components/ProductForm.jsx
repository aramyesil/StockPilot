import { useEffect, useId, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { CATEGORY_SUGGESTIONS, validateProduct } from '../utils/inventory.js';

const EMPTY_FORM = {
  name: '',
  sku: '',
  category: '',
  quantity: '',
  minStock: '',
  unitPrice: '',
  description: '',
};

function toFormState(product) {
  if (!product) return EMPTY_FORM;
  return {
    name: product.name,
    sku: product.sku,
    category: product.category,
    quantity: String(product.quantity),
    minStock: String(product.minStock),
    unitPrice: String(product.unitPrice).replace('.', ','),
    description: product.description || '',
  };
}

export default function ProductForm({ product, products, onClose, onSubmit }) {
  const [form, setForm] = useState(() => toFormState(product));
  const [errors, setErrors] = useState({});
  const titleId = useId();
  const listId = useId();

  const categories = useMemo(() => {
    const names = new Set(CATEGORY_SUGGESTIONS);
    products.forEach((item) => names.add(item.category));
    return [...names].sort((left, right) => left.localeCompare(right, 'tr'));
  }, [products]);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const result = validateProduct(form, products, product?.id);
    setErrors(result.errors);
    if (!result.isValid) {
      const firstInvalid = ['name', 'sku', 'category', 'quantity', 'minStock', 'unitPrice', 'description'].find(
        (field) => result.errors[field],
      );
      if (firstInvalid) document.getElementById(`product-${firstInvalid}`)?.focus();
      return;
    }
    onSubmit(result.value);
  }

  return (
    <div className="modal-backdrop">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className="modal-head">
          <div>
            <p className="panel-kicker">{product ? 'Düzenleme' : 'Yeni kayıt'}</p>
            <h2 id={titleId}>{product ? 'Ürünü düzenle' : 'Yeni ürün'}</h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Pencereyi kapat">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {errors.form && <p className="form-alert">{errors.form}</p>}
            <div className="form-grid">
              <label className={`field span-2 ${errors.name ? 'has-error' : ''}`}>
                <span>Ürün adı</span>
                <input
                  id="product-name"
                  value={form.name}
                  onChange={(event) => updateField('name', event.target.value)}
                  placeholder="Örn. A4 fotokopi kağıdı"
                  aria-invalid={Boolean(errors.name)}
                  autoComplete="off"
                />
                {errors.name && <small>{errors.name}</small>}
              </label>

              <label className={`field ${errors.sku ? 'has-error' : ''}`}>
                <span>SKU</span>
                <input
                  id="product-sku"
                  value={form.sku}
                  onChange={(event) => updateField('sku', event.target.value)}
                  placeholder="Örn. KRT-1042"
                  aria-invalid={Boolean(errors.sku)}
                  autoComplete="off"
                />
                {errors.sku && <small>{errors.sku}</small>}
              </label>

              <label className={`field ${errors.category ? 'has-error' : ''}`}>
                <span>Kategori</span>
                <input
                  id="product-category"
                  list={listId}
                  value={form.category}
                  onChange={(event) => updateField('category', event.target.value)}
                  placeholder="Kategori seçin veya yazın"
                  aria-invalid={Boolean(errors.category)}
                  autoComplete="off"
                />
                <datalist id={listId}>
                  {categories.map((category) => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
                {errors.category && <small>{errors.category}</small>}
              </label>

              <label className={`field ${errors.quantity ? 'has-error' : ''}`}>
                <span>Stok miktarı</span>
                <input
                  id="product-quantity"
                  inputMode="numeric"
                  value={form.quantity}
                  onChange={(event) => updateField('quantity', event.target.value)}
                  placeholder="0"
                  aria-invalid={Boolean(errors.quantity)}
                />
                {errors.quantity && <small>{errors.quantity}</small>}
              </label>

              <label className={`field ${errors.minStock ? 'has-error' : ''}`}>
                <span>Minimum stok</span>
                <input
                  id="product-minStock"
                  inputMode="numeric"
                  value={form.minStock}
                  onChange={(event) => updateField('minStock', event.target.value)}
                  placeholder="0"
                  aria-invalid={Boolean(errors.minStock)}
                />
                {errors.minStock && <small>{errors.minStock}</small>}
              </label>

              <label className={`field span-2 ${errors.unitPrice ? 'has-error' : ''}`}>
                <span>Birim fiyat (₺)</span>
                <input
                  id="product-unitPrice"
                  inputMode="decimal"
                  value={form.unitPrice}
                  onChange={(event) => updateField('unitPrice', event.target.value)}
                  placeholder="0,00"
                  aria-invalid={Boolean(errors.unitPrice)}
                />
                {errors.unitPrice && <small>{errors.unitPrice}</small>}
              </label>

              <label className={`field span-2 ${errors.description ? 'has-error' : ''}`}>
                <span>Açıklama</span>
                <textarea
                  id="product-description"
                  rows="3"
                  value={form.description}
                  onChange={(event) => updateField('description', event.target.value)}
                  placeholder="İsteğe bağlı not"
                  aria-invalid={Boolean(errors.description)}
                />
                {errors.description && <small>{errors.description}</small>}
              </label>
            </div>
            <p className="form-note">
              Miktarı buradan değiştirmek stok hareketi oluşturmaz. Giriş ve çıkış kayıtları için Stok Hareketleri
              sayfasını kullanın.
            </p>
          </div>
          <div className="modal-foot">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Vazgeç
            </button>
            <button type="submit" className="btn btn-primary">
              {product ? 'Değişiklikleri kaydet' : 'Ürünü kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
