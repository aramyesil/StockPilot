import { useMemo } from 'react';
import { Banknote, Boxes, Package, PackagePlus, PackageX, TriangleExclamationPoint } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import EmptyState from '../components/EmptyState.jsx';
import StatCard from '../components/StatCard.jsx';
import { formatCurrency, formatDate, formatNumber, formatQuantity } from '../utils/formatters.js';
import {
  categoryDistribution,
  CHART_COLORS,
  getStockStatus,
  movementProductLabel,
  sortMovements,
  STATUS_META,
  statusDistribution,
  summarizeInventory,
} from '../utils/inventory.js';

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <strong>{row.name}</strong>
      <span>{formatNumber(row.value)} ürün çeşidi</span>
    </div>
  );
}

export default function Dashboard({ products, movements, onAddProduct, onShowCritical }) {
  const summary = useMemo(() => summarizeInventory(products), [products]);
  const categories = useMemo(() => categoryDistribution(products), [products]);
  const statuses = useMemo(() => statusDistribution(products), [products]);
  const recentMovements = useMemo(() => sortMovements(movements).slice(0, 6), [movements]);

  return (
    <div className="page">
      <section className="stats-grid">
        <StatCard
          icon={Package}
          tone="teal"
          label="Toplam ürün çeşidi"
          value={formatNumber(summary.totalVarieties)}
          hint="Kayıtlı ürün kartı"
        />
        <StatCard
          icon={Boxes}
          tone="blue"
          label="Toplam stok adedi"
          value={formatNumber(summary.totalQuantity)}
          hint="Tüm ürünlerin adet toplamı"
        />
        <StatCard
          icon={Banknote}
          tone="navy"
          label="Toplam envanter değeri"
          value={formatCurrency(summary.totalValue)}
          hint="Birim fiyat × stok adedi"
        />
        <StatCard
          icon={TriangleExclamationPoint}
          tone="warning"
          label="Kritik stok"
          value={formatNumber(summary.criticalCount)}
          hint="Minimum seviyede veya altında"
        />
      </section>

      <section className="panel-grid">
        <article className="panel">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">Dağılım</p>
              <h2>Kategori bazında ürünler</h2>
            </div>
          </div>
          {categories.length === 0 ? (
            <EmptyState
              icon={Package}
              title="Henüz ürün yok"
              text="Grafik, kaydettiğiniz ürünlerin kategorilerine göre oluşur."
              action={
                <button type="button" className="btn btn-primary" onClick={onAddProduct}>
                  <PackagePlus size={16} />
                  Ürün ekle
                </button>
              }
            />
          ) : (
            <>
              <div className="chart-box" aria-hidden="true">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={categories}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={62}
                      outerRadius={94}
                      paddingAngle={3}
                      stroke="#ffffff"
                      strokeWidth={3}
                    >
                      {categories.map((entry, index) => (
                        <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="status-list">
                {categories.map((entry, index) => (
                  <li key={entry.name}>
                    <span className="legend-dot" style={{ background: CHART_COLORS[index % CHART_COLORS.length] }} />
                    <span>{entry.name}</span>
                    <strong>{formatNumber(entry.value)}</strong>
                  </li>
                ))}
              </ul>
            </>
          )}
        </article>

        <article className="panel">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">Durum</p>
              <h2>Stok durumları</h2>
            </div>
          </div>
          {products.length === 0 ? (
            <EmptyState icon={Boxes} title="Durum grafiği boş" text="Ürün eklediğinizde yeterli, kritik ve tükenen stoklar burada ayrılır." />
          ) : (
            <>
              <div className="chart-box" aria-hidden="true">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={statuses} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                    <CartesianGrid stroke="#e6eef6" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(15, 118, 110, 0.06)' }} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={46}>
                      {statuses.map((entry) => (
                        <Cell key={entry.key} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <ul className="status-list">
                {statuses.map((entry) => (
                  <li key={entry.key}>
                    <span className="legend-dot" style={{ background: entry.fill }} />
                    <span>{entry.name}</span>
                    <strong>{formatNumber(entry.value)}</strong>
                  </li>
                ))}
              </ul>
              <p className="chart-caption">Kritik kartı, kritik ve tükenen ürünlerin toplamını gösterir.</p>
            </>
          )}
        </article>
      </section>

      <section className="split-grid">
        <article className="panel">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">Geçmiş</p>
              <h2>Son stok hareketleri</h2>
            </div>
          </div>
          {recentMovements.length === 0 ? (
            <EmptyState icon={PackageX} title="Hareket yok" text="Stok girişi veya çıkışı yaptığınızda son işlemler burada listelenir." />
          ) : (
            <ul className="movement-feed">
              {recentMovements.map((movement) => {
                const label = movementProductLabel(movement, products);
                return (
                  <li key={movement.id}>
                    <span className={movement.type === 'in' ? 'move-icon in' : 'move-icon out'} aria-hidden="true">
                      {movement.type === 'in' ? '+' : '−'}
                    </span>
                    <div className="movement-main">
                      <strong>
                        {label.name}
                        {label.missing && <span className="badge badge-demo">Kayıt silindi</span>}
                      </strong>
                      <p>
                        {movement.type === 'in' ? 'Stok girişi' : 'Stok çıkışı'} · {formatQuantity(movement.quantity)}
                        {movement.description ? ` · ${movement.description}` : ''}
                      </p>
                    </div>
                    <time dateTime={movement.createdAt}>{formatDate(movement.createdAt)}</time>
                  </li>
                );
              })}
            </ul>
          )}
        </article>

        <article className="panel">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">Uyarı</p>
              <h2>Kritik stok</h2>
            </div>
            {summary.criticalCount > 0 && (
              <button type="button" className="link-button" onClick={onShowCritical}>
                Tümünü gör
              </button>
            )}
          </div>
          {summary.criticalProducts.length === 0 ? (
            <EmptyState icon={Package} title="Kritik ürün yok" text="Tüm ürünler minimum stok seviyesinin üzerinde." />
          ) : (
            <ul className="critical-list">
              {summary.criticalProducts.map((product) => {
                const status = getStockStatus(product);
                return (
                  <li key={product.id}>
                    <div>
                      <strong>{product.name}</strong>
                      <p>
                        {product.sku} · min. {formatNumber(product.minStock)}
                      </p>
                    </div>
                    <div className="critical-side">
                      <span className={`badge ${STATUS_META[status].className}`}>{STATUS_META[status].label}</span>
                      <b>{formatQuantity(product.quantity)}</b>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </article>
      </section>
    </div>
  );
}
