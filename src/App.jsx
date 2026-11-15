import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import ToastStack from './components/ToastStack.jsx';
import Movements from './pages/Movements.jsx';
import Products from './pages/Products.jsx';
import { applyStockMovement, createId, summarizeInventory } from './utils/inventory.js';
import { initializeStorage, saveMovements, saveProducts } from './utils/storage.js';
import './App.css';

const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));

const PAGE_META = {
  dashboard: {
    title: 'Genel Bakış',
    subtitle: 'Stok, envanter değeri ve kritik uyarıların özeti',
  },
  products: {
    title: 'Ürünler',
    subtitle: 'Ürün ekleyin, düzenleyin, arayın ve stok durumuna göre filtreleyin',
  },
  movements: {
    title: 'Stok Hareketleri',
    subtitle: 'Giriş ve çıkış işlemleriyle miktarları güncelleyin',
  },
};

function readPage() {
  const value = window.location.hash.replace('#', '');
  if (value === 'products' || value === 'movements') return value;
  return 'dashboard';
}

export default function App() {
  const [initial] = useState(() => initializeStorage());
  const [products, setProducts] = useState(initial.products);
  const [movements, setMovements] = useState(initial.movements);
  const [page, setPage] = useState(readPage);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [createSignal, setCreateSignal] = useState(0);
  const [storageError, setStorageError] = useState(initial.error);
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Set());

  const summary = useMemo(() => summarizeInventory(products), [products]);
  const hasDemo = useMemo(() => products.some((product) => product.demo), [products]);
  const categories = useMemo(
    () => [...new Set(products.map((product) => product.category))].sort((left, right) => left.localeCompare(right, 'tr')),
    [products],
  );

  function rememberProducts(nextProducts) {
    setProducts(nextProducts);
    const result = saveProducts(nextProducts);
    if (!result.ok) setStorageError(result.error);
  }

  function rememberMovements(nextMovements) {
    setMovements(nextMovements);
    const result = saveMovements(nextMovements);
    if (!result.ok) setStorageError(result.error);
  }

  useEffect(() => {
    function syncPage() {
      setPage(readPage());
      setSidebarOpen(false);
    }
    window.addEventListener('hashchange', syncPage);
    return () => window.removeEventListener('hashchange', syncPage);
  }, []);

  useEffect(() => {
    const activeTimers = timers.current;
    return () => {
      activeTimers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  function notify(type, message) {
    const id = createId();
    setToasts((current) => [...current.slice(-4), { id, type, message }]);
    const timer = window.setTimeout(() => {
      timers.current.delete(timer);
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4200);
    timers.current.add(timer);
  }

  function navigate(nextPage, options = {}) {
    if (nextPage === 'products') setStatusFilter(options.status ?? 'all');
    if (options.create) setCreateSignal((value) => value + 1);
    setPage(nextPage);
    setSidebarOpen(false);
    const nextHash = `#${nextPage}`;
    if (window.location.hash !== nextHash) window.location.hash = nextPage;
  }

  function handleMovement(input) {
    const result = applyStockMovement(products, movements, input);
    if (result.ok) {
      rememberProducts(result.products);
      rememberMovements(result.movements);
      notify('success', result.message);
    }
    return result;
  }

  const meta = PAGE_META[page];

  return (
    <div className="app">
      <Sidebar
        page={page}
        criticalCount={summary.criticalCount}
        hasDemo={hasDemo}
        open={sidebarOpen}
        onNavigate={navigate}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="main">
        <Header
          title={meta.title}
          subtitle={meta.subtitle}
          criticalCount={summary.criticalCount}
          onMenu={() => setSidebarOpen(true)}
          onShowCritical={() => navigate('products', { status: 'critical' })}
        />
        <main className="content">
          {storageError && <p className="banner banner-error">{storageError}</p>}
          {hasDemo && (
            <p className="banner banner-info">
              İlk açılışta yüklenen kayıtlar örnek demo verisidir. Düzenleyebilir veya silebilirsiniz. Sayfa
              yenilense de bu örnekler yeniden eklenmez.
            </p>
          )}
          {page === 'dashboard' && (
            <Suspense fallback={<p className="banner banner-info">Genel bakış yükleniyor…</p>}>
              <Dashboard
                products={products}
                movements={movements}
                onAddProduct={() => navigate('products', { create: true })}
                onShowCritical={() => navigate('products', { status: 'critical' })}
              />
            </Suspense>
          )}
          <div hidden={page !== 'products'}>
            <Products
              active={page === 'products'}
              products={products}
              categories={categories}
              statusFilter={statusFilter}
              createSignal={createSignal}
              onCreate={(product) => rememberProducts([product, ...products])}
              onUpdate={(product) =>
                rememberProducts(products.map((item) => (item.id === product.id ? product : item)))
              }
              onDelete={(productId) => rememberProducts(products.filter((item) => item.id !== productId))}
              onStatusFilterChange={setStatusFilter}
              onNotify={notify}
            />
          </div>
          {page === 'movements' && <Movements products={products} movements={movements} onSubmit={handleMovement} />}
        </main>
      </div>
      <ToastStack toasts={toasts} />
    </div>
  );
}
