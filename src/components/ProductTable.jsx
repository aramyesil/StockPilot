import { Pencil, Trash } from 'lucide-react';
import { formatCurrency, formatDate, formatNumber } from '../utils/formatters.js';
import { getStockStatus, STATUS_META } from '../utils/inventory.js';

function initials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toLocaleUpperCase('tr');
}

export default function ProductTable({ products, onEdit, onDelete }) {
  return (
    <div className="table-wrap">
      <p className="scroll-hint">Tabloyu yana kaydırarak tüm sütunları görebilirsiniz.</p>
      <table className="data-table">
        <thead>
          <tr>
            <th>Ürün</th>
            <th>SKU</th>
            <th className="col-optional">Kategori</th>
            <th>Stok</th>
            <th className="col-optional">Minimum</th>
            <th>Birim fiyat</th>
            <th className="col-optional">Değer</th>
            <th>Durum</th>
            <th className="col-optional">Güncelleme</th>
            <th>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const status = getStockStatus(product);
            const meta = STATUS_META[status];
            const rowClass = status === 'out' ? 'row-out' : status === 'critical' ? 'row-critical' : undefined;
            return (
              <tr key={product.id} className={rowClass}>
                <td>
                  <div className="product-cell">
                    <span className={`avatar avatar-${status}`} aria-hidden="true">
                      {initials(product.name)}
                    </span>
                    <span>
                      <span className="product-name">
                        {product.name}
                        {product.demo && <span className="badge badge-demo">Demo</span>}
                      </span>
                      <span className="product-desc">{product.category}</span>
                    </span>
                  </div>
                </td>
                <td>
                  <span className="sku">{product.sku}</span>
                </td>
                <td className="col-optional">{product.category}</td>
                <td>
                  <strong>{formatNumber(product.quantity)}</strong>
                </td>
                <td className="col-optional">{formatNumber(product.minStock)}</td>
                <td>{formatCurrency(product.unitPrice)}</td>
                <td className="col-optional">{formatCurrency(product.quantity * product.unitPrice)}</td>
                <td>
                  <span className={`badge ${meta.className}`}>{meta.label}</span>
                </td>
                <td className="col-optional">{formatDate(product.updatedAt)}</td>
                <td>
                  <div className="actions">
                    <button type="button" className="icon-btn" onClick={() => onEdit(product)} aria-label={`${product.name} ürününü düzenle`}>
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      className="icon-btn danger"
                      onClick={() => onDelete(product)}
                      aria-label={`${product.name} ürününü sil`}
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
