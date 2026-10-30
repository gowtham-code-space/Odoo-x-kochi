import React, { useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '../common/Button.jsx';

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  confirmVariant = 'primary',
  isConfirmLoading = false,
  maxWidth = 'max-w-md',
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className={`relative z-10 w-full ${maxWidth} rounded-xl border border-border bg-surface p-6 shadow-2xl`}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-headings text-lg font-bold text-foreground">{title}</h3>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon icon="lucide:x" className="w-4 h-4" />
          </button>
        </div>

        <div className="mb-6">{children}</div>

        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isConfirmLoading}>
            {cancelLabel}
          </Button>
          {onConfirm && (
            <Button
              variant={confirmVariant}
              size="sm"
              onClick={onConfirm}
              isLoading={isConfirmLoading}
            >
              {confirmLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

