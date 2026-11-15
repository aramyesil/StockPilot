import { useMemo, useState } from 'react';
import { Download, PackagePlus, Search, SearchX } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ProductForm from '../components/ProductForm.jsx';
import ProductTable from '../components/ProductTable.jsx';
import { downloadProductsCsv, formatNumber } from '../utils/formatters.js';
import { createProductRecord, filterProducts, mergeProductRecord } from '../utils/inventory.js';

export default function Products({
  active,
  products,
  categories,
  statusFilter,
  createSignal,
  onCreate,
  onUpdate,
  onDelete,
  onStatusFilterChange,
  onNotify,
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('name-asc');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [seenSignal, setSeenSignal] = useState(createSignal);
  const [seenActive, setSeenActive] = useState(active);

  if (seenSignal !== createSignal) {
    setSeenSignal(createSignal);
    if (createSignal) {
      setEditing(null);
      setFormOpen(true);
    }
  }

  if (seenActive !== active) {
    setSeenActive(active);
    if (!active) {
      setFormOpen(false);
      setEditing(null);
      setPendingDelete(null);
    }
  }

  const visibleProducts = useMemo(
    () => filterProducts(products, { query, category, status: statusFilter, sort }),
    [products, query, category, statusFilter, sort],
  );

  const filtersActive = query.trim() !== '' || category !== 'all' || statusFilter !== 'all' || sort !== 'name-asc';

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function handleSubmit(value) {
    if (editing) {
      onUpdate(mergeProductRecord(editing, value));
      onNotify('success', `${value.name} güncellendi.`);
    } else {
      onCreate(createProductRecord(value));
      onNotify('success', `${value.name} eklendi.`);
    }
    setFormOpen(false);
    setEditing(null);
  }

  function handleDelete() {
    onDelete(pendingDelete.id);
    onNotify('success', `${pendingDelete.name} silindi.`);
    setPendingDelete(null);
  }

  function handleExport() {
    downloadProductsCsv(products);
    onNotify('success', 'Ürün listesi CSV olarak indirildi.');
  }

  return (
    <div className="page">
      <section className="panel">
        <div className="panel-head">
          <div>
            <p className="panel-kicker">Katalog</p>
            <h2>Ürün listesi</h2>
          </div>
          <div className="button-row">
            <button type="button" className="btn btn-secondary" onClick={handleExport} disabled={products.length === 0}>
              <Download size={16} />
              CSV indir
            </button>
            <button type="button" className="btn btn-primary" onClick={openCreate}>
              <PackagePlus size={16} />
              Yeni ürün
            </button>
          </div>
        </div>

        <div className="toolbar">
          <label className="search-box">
            <Search size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ürün adı, SKU veya kategori ara"
              aria-label="Ürün ara"
            />
          </label>
          <label className="field compact">
            <span>Kategori</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="all">Tüm kategoriler</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="field compact">
            <span>Stok durumu</span>
            <select value={statusFilter} onChange={(event) => onStatusFilterChange(event.target.value)}>
              <option value="all">Tüm durumlar</option>
              <option value="ok">Yeterli</option>
              <option value="critical">Kritik stok</option>
              <option value="out">Stok tükendi</option>
            </select>
          </label>
          <label className="field compact">
            <span>Sıralama</span>
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="name-asc">Ada göre A-Z</option>
              <option value="name-desc">Ada göre Z-A</option>
              <option value="quantity-asc">Stok artan</option>
              <option value="quantity-desc">Stok azalan</option>
              <option value="price-asc">Fiyat artan</option>
              <option value="price-desc">Fiyat azalan</option>
              <option value="updated-desc">Son güncellenen</option>
            </select>
          </label>
        </div>

        <div className="toolbar-meta">
          <p>
            {formatNumber(visibleProducts.length)} / {formatNumber(products.length)} ürün gösteriliyor
            {statusFilter === 'critical' && ' · Kritik filtre, minimum stokta veya altındaki ürünleri listeler.'}
          </p>
          {filtersActive && (
            <button
              type="button"
              className="link-button"
              onClick={() => {
                setQuery('');
                setCategory('all');
                setSort('name-asc');
                onStatusFilterChange('all');
              }}
            >
              Filtreleri temizle
            </button>
          )}
        </div>

        {products.length === 0 ? (
          <EmptyState
            icon={PackagePlus}
            title="Henüz ürün yok"
            text="İlk ürününüzü ekleyerek envanter takibine başlayın."
            action={
              <button type="button" className="btn btn-primary" onClick={openCreate}>
                <PackagePlus size={16} />
                Yeni ürün
              </button>
            }
          />
        ) : visibleProducts.length === 0 ? (
          <EmptyState icon={SearchX} title="Sonuç bulunamadı" text="Arama veya filtreleri değiştirip yeniden deneyin." />
        ) : (
          <ProductTable
            products={visibleProducts}
            onEdit={(product) => {
              setEditing(product);
              setFormOpen(true);
            }}
            onDelete={setPendingDelete}
          />
        )}
      </section>

      {formOpen && (
        <ProductForm
          key={editing?.id || 'new'}
          product={editing}
          products={products}
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
          }}
          onSubmit={handleSubmit}
        />
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Ürünü sil"
        message={
          pendingDelete
            ? `${pendingDelete.name} listeden kaldırılacak. Bu işlem geri alınamaz. Geçmiş stok hareketleri silinmez.`
            : ''
        }
        confirmLabel="Ürünü sil"
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
