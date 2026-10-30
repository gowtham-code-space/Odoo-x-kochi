import React from 'react';
import { Icon } from '@iconify/react';

export function Toast({ toast, onClose }) {
  const styles = {
    success: {
      border: 'border-success/30 bg-success/10 text-success',
      icon: 'lucide:check-circle',
    },
    error: {
      border: 'border-error/30 bg-error/10 text-error',
      icon: 'lucide:alert-circle',
    },
    warning: {
      border: 'border-warning/30 bg-warning/10 text-warning',
      icon: 'lucide:alert-triangle',
    },
    info: {
      border: 'border-royal/30 bg-royal/10 text-royal',
      icon: 'lucide:info',
    },
  };

  const current = styles[toast.type] || styles.info;

  return (
    <div
      className={`rounded-md border ${current.border} px-3 py-2.5 text-sm flex items-start gap-2.5 shadow-xl bg-surface min-w-[280px] max-w-sm`}
      role="alert"
    >
      <Icon icon={current.icon} className="w-4 h-4 shrink-0 mt-0.5" />
      <div className="flex-1">
        {toast.title && (
          <p className="font-medium text-foreground text-xs mb-0.5">{toast.title}</p>
        )}
        <p className="text-muted-foreground text-xs leading-relaxed">{toast.message}</p>
      </div>
      <button
        type="button"
        onClick={() => onClose(toast.id)}
        className="text-muted-foreground hover:text-foreground p-0.5 transition-colors"
        aria-label="Close"
      >
        <Icon icon="lucide:x" className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

