import { ArrowLeftRight, LayoutDashboard, Package } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Genel Bakış', icon: LayoutDashboard },
  { id: 'products', label: 'Ürünler', icon: Package },
  { id: 'movements', label: 'Stok Hareketleri', icon: ArrowLeftRight },
];

export default function Sidebar({ page, criticalCount, hasDemo, open, onNavigate, onClose }) {
  return (
    <>
      {open && (
        <button type="button" className="sidebar-backdrop" aria-label="Menüyü kapat" onClick={onClose} />
      )}
      <aside className={open ? 'sidebar is-open' : 'sidebar'}>
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            <Package size={20} />
          </span>
          <span>
            <strong>StockPilot</strong>
            <small>Akıllı stok yönetimi</small>
          </span>
        </div>

        <nav className="nav" aria-label="Ana menü">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = page === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={active ? 'nav-item is-active' : 'nav-item'}
                aria-current={active ? 'page' : undefined}
                onClick={() => onNavigate(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.id === 'dashboard' && criticalCount > 0 && (
                  <span className="nav-badge">{criticalCount}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-note">
          {hasDemo && <p className="demo-pill">Demo verisi yüklü</p>}
          <p>Kayıtlar yalnızca bu tarayıcıda saklanır.</p>
        </div>
      </aside>
    </>
  );
}
