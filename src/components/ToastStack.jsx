import { CircleCheck, Info, TriangleExclamationPoint } from 'lucide-react';

const ICONS = {
  success: CircleCheck,
  error: TriangleExclamationPoint,
  info: Info,
};

export default function ToastStack({ toasts }) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-stack" aria-live="polite">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type] || Info;
        return (
          <div key={toast.id} className={`toast toast-${toast.type}`} role="status">
            <Icon size={18} />
            <p>{toast.message}</p>
          </div>
        );
      })}
    </div>
  );
}
