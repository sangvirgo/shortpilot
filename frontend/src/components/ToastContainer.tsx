import { useToastStore } from '../store/toast';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const colors = {
  success: 'bg-emerald-600/90 border-emerald-500',
  error: 'bg-red-600/90 border-red-500',
  info: 'bg-blue-600/90 border-blue-500',
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => {
        const Icon = icons[toast.type];
        return (
          <div
            key={toast.id}
            className={`toast-enter flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${colors[toast.type]}`}
          >
            <Icon className="w-5 h-5 text-white flex-shrink-0" />
            <p className="text-sm text-white flex-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/70 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
