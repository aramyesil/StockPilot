import { useMemo, useState } from 'react';
import { ArrowLeftRight, Search } from 'lucide-react';
import EmptyState from '../components/EmptyState.jsx';
import StockMovementForm from '../components/StockMovementForm.jsx';
import { formatDate, formatNumber, formatQuantity } from '../utils/formatters.js';
import { movementProductLabel, sortMovements } from '../utils/inventory.js';

export default function Movements({ products, movements, onSubmit }) {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');

  const visibleMovements = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('tr');
    return sortMovements(movements).filter((movement) => {
      const label = movementProductLabel(movement, products);
      const haystack = `${label.name} ${label.sku} ${movement.description}`.toLocaleLowerCase('tr');
      const matchesQuery = needle === '' || haystack.includes(needle);
      const matchesType = type === 'all' || movement.type === type;
      return matchesQuery && matchesType;
    });
  }, [movements, products, query, type]);

  return (
    <div className="page movement-layout">
      <StockMovementForm products={products} onSubmit={onSubmit} />

      <section className="panel">
        <div className="panel-head">
          <div>
            <p className="panel-kicker">Geçmiş</p>
            <h2>Stok hareketleri</h2>
          </div>
        </div>

        <div className="toolbar">
          <label className="search-box">
            <Search size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ürün, SKU veya açıklama ara"
              aria-label="Hareket ara"
            />
          </label>
          <label className="field compact">
            <span>İşlem türü</span>
            <select value={type} onChange={(event) => setType(event.target.value)}>
              <option value="all">Tümü</option>
              <option value="in">Stok girişi</option>
              <option value="out">Stok çıkışı</option>
            </select>
          </label>
        </div>
        <p className="toolbar-meta">{formatNumber(visibleMovements.length)} hareket gösteriliyor</p>

        {movements.length === 0 ? (
          <EmptyState icon={ArrowLeftRight} title="Henüz hareket yok" text="Stok girişi veya çıkışı kaydettiğinizde geçmiş burada görünür." />
        ) : visibleMovements.length === 0 ? (
          <EmptyState icon={Search} title="Sonuç bulunamadı" text="Arama metnini veya işlem türünü değiştirin." />
        ) : (
          <div className="table-wrap">
            <p className="scroll-hint">Tabloyu yana kaydırarak tüm sütunları görebilirsiniz.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tarih</th>
                  <th>Ürün</th>
                  <th>İşlem</th>
                  <th>Miktar</th>
                  <th>Açıklama</th>
                </tr>
              </thead>
              <tbody>
                {visibleMovements.map((movement) => {
                  const label = movementProductLabel(movement, products);
                  return (
                    <tr key={movement.id}>
                      <td>{formatDate(movement.createdAt)}</td>
                      <td>
                        <span className="product-name">
                          {label.name}
                          {label.missing && <span className="badge badge-demo">Kayıt silindi</span>}
                        </span>
                        <span className="product-desc">{label.sku}</span>
                      </td>
                      <td>
                        <span className={movement.type === 'in' ? 'badge badge-ok' : 'badge badge-out'}>
                          {movement.type === 'in' ? 'Stok girişi' : 'Stok çıkışı'}
                        </span>
                      </td>
                      <td>
                        <strong className={movement.type === 'in' ? 'qty-in' : 'qty-out'}>
                          {movement.type === 'in' ? '+' : '−'}
                          {formatQuantity(movement.quantity)}
                        </strong>
                      </td>
                      <td>{movement.description || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
