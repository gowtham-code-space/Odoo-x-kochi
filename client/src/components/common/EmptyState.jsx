import React from 'react';
import { Icon } from '@iconify/react';
import { Button } from './Button.jsx';

export function EmptyState({
  icon = 'lucide:inbox',
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div
      className={`rounded-md border border-border bg-input p-8 text-center flex flex-col items-center justify-center ${className}`}
    >
      <div className="h-12 w-12 rounded-xl bg-surface-raised flex items-center justify-center mb-3 text-muted-foreground border border-border">
        <Icon icon={icon} className="w-6 h-6" />
      </div>
      {title && <h4 className="text-sm font-medium text-foreground mb-1">{title}</h4>}
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

