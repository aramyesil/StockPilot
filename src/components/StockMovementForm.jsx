import { useMemo, useState } from 'react';
import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { formatQuantity } from '../utils/formatters.js';

const EMPTY_ERRORS = {};

export default function StockMovementForm({ products, onSubmit }) {
  const [productId, setProductId] = useState('');
  const [type, setType] = useState('in');
  const [quantity, setQuantity] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState(EMPTY_ERRORS);

  const options = useMemo(
    () => [...products].sort((left, right) => left.name.localeCompare(right.name, 'tr')),
    [products],
  );
  const selected = products.find((product) => product.id === productId) || null;

  const parsedQuantity = /^\d+$/.test(quantity.trim()) ? Number(quantity.trim()) : null;
  const nextQuantity =
    selected && parsedQuantity
      ? type === 'in'
        ? selected.quantity + parsedQuantity
        : selected.quantity - parsedQuantity
      : null;

  function handleSubmit(event) {
    event.preventDefault();
    const result = onSubmit({ productId, type, quantity, description });
    if (!result.ok) {
      setErrors({ [result.field || 'form']: result.error });
      return;
    }
    setQuantity('');
    setDescription('');
    setErrors(EMPTY_ERRORS);
  }

  if (products.length === 0) {
    return (
      <div className="panel">
        <h2>Stok hareketi</h2>
        <p className="panel-copy">Hareket girebilmek için önce bir ürün ekleyin.</p>
      </div>
    );
  }

  return (
    <form className="panel movement-form" onSubmit={handleSubmit}>
      <div className="panel-head">
        <div>
          <p className="panel-kicker">Yeni işlem</p>
          <h2>Stok hareketi kaydet</h2>
        </div>
      </div>

      {errors.form && <p className="form-alert">{errors.form}</p>}

      <div className="segmented" role="radiogroup" aria-label="İşlem türü">
        <button
          type="button"
          role="radio"
          aria-checked={type === 'in'}
          className={type === 'in' ? 'is-active in' : ''}
          onClick={() => setType('in')}
        >
          <ArrowDownToLine size={16} />
          Stok girişi
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={type === 'out'}
          className={type === 'out' ? 'is-active out' : ''}
          onClick={() => setType('out')}
        >
          <ArrowUpFromLine size={16} />
          Stok çıkışı
        </button>
      </div>

      <div className="form-grid">
        <label className={`field span-2 ${errors.productId ? 'has-error' : ''}`}>
          <span>Ürün</span>
          <select
            value={productId}
            onChange={(event) => {
              setProductId(event.target.value);
              setErrors((current) => ({ ...current, productId: undefined }));
            }}
            aria-invalid={Boolean(errors.productId)}
          >
            <option value="">Ürün seçin</option>
            {options.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} · {product.sku} · {product.quantity} adet
              </option>
            ))}
          </select>
          {errors.productId && <small>{errors.productId}</small>}
        </label>

        <label className={`field ${errors.quantity ? 'has-error' : ''}`}>
          <span>Miktar</span>
          <input
            inputMode="numeric"
            value={quantity}
            onChange={(event) => {
              setQuantity(event.target.value);
              setErrors((current) => ({ ...current, quantity: undefined }));
            }}
            placeholder="0"
            aria-invalid={Boolean(errors.quantity)}
          />
          {errors.quantity && <small>{errors.quantity}</small>}
        </label>

        <label className={`field span-2 ${errors.description ? 'has-error' : ''}`}>
          <span>Açıklama</span>
          <textarea
            rows="3"
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              setErrors((current) => ({ ...current, description: undefined }));
            }}
            placeholder="Örn. Tedarikçi teslimatı veya mağaza satışı"
            aria-invalid={Boolean(errors.description)}
          />
          {errors.description && <small>{errors.description}</small>}
        </label>
      </div>

      {selected && (
        <div className={nextQuantity !== null && nextQuantity < 0 ? 'preview-box is-invalid' : 'preview-box'}>
          <p>
            Mevcut stok: <strong>{formatQuantity(selected.quantity)}</strong>
          </p>
          {nextQuantity !== null && (
            <p>
              İşlem sonrası: <strong>{formatQuantity(Math.max(nextQuantity, 0))}</strong>
              {nextQuantity < 0 && ' — çıkış miktarı mevcut stoktan fazla.'}
            </p>
          )}
        </div>
      )}

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          Hareketi kaydet
        </button>
      </div>
    </form>
  );
}
