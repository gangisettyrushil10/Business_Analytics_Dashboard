import { useEffect } from 'react';
import { CheckCircle2, Info, X, XCircle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

const variantStyles: Record<ToastType, { icon: typeof CheckCircle2; wrapper: string }> = {
  success: {
    icon: CheckCircle2,
    wrapper: "bg-primary/10 text-primary",
  },
  error: {
    icon: XCircle,
    wrapper: "bg-accent text-card-foreground",
  },
  info: {
    icon: Info,
    wrapper: "bg-muted text-card-foreground",
  },
};

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const variant = variantStyles[type];
  const Icon = variant.icon;

  return (
    <div className="flex min-w-[320px] max-w-md items-start gap-3 rounded-xl border bg-card px-4 py-3 text-sm shadow-xl">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${variant.wrapper}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="flex-1 text-card-foreground">{message}</p>
      <button
        onClick={onClose}
        className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary/20"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Array<{ id: string; message: string; type: ToastType }>;
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <>
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className="fixed right-5 z-50 transition-transform"
          style={{ top: `${20 + index * 80}px` }}
        >
          <Toast message={toast.message} type={toast.type} onClose={() => onRemove(toast.id)} />
        </div>
      ))}
    </>
  );
}
