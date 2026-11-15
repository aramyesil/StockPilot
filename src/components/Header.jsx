import { CircleCheck, Menu, TriangleExclamationPoint } from 'lucide-react';
import { formatToday } from '../utils/formatters.js';

export default function Header({ title, subtitle, criticalCount, onMenu, onShowCritical }) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="topbar-title-wrap">
          <button type="button" className="menu-button" onClick={onMenu} aria-label="Menüyü aç">
            <Menu size={20} />
          </button>
          <div>
            <h1>{title}</h1>
            <p className="topbar-subtitle">{subtitle}</p>
          </div>
        </div>
        <div className="topbar-meta">
          <p className="date-chip">{formatToday()}</p>
          {criticalCount > 0 ? (
            <button type="button" className="critical-chip" onClick={onShowCritical}>
              <TriangleExclamationPoint size={16} />
              {criticalCount} kritik ürün
            </button>
          ) : (
            <p className="ok-chip">
              <CircleCheck size={16} />
              Stoklar dengede
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
