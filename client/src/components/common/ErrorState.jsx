import React from 'react';
import { Icon } from '@iconify/react';
import { Button } from './Button.jsx';

export function ErrorState({
  title = 'Something went wrong',
  message,
  requestId,
  onRetry,
  className = '',
}) {
  return (
    <div
      className={`rounded-md border border-error/30 bg-error/10 p-6 flex flex-col items-start gap-3 ${className}`}
    >
      <div className="flex items-center gap-2 text-error">
        <Icon icon="lucide:alert-triangle" className="w-5 h-5 shrink-0" />
        <h4 className="font-medium text-sm text-foreground">{title}</h4>
      </div>
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
      {requestId && (
        <div className="text-xs font-mono text-muted-foreground">
          Request ID: <span className="text-foreground">{requestId}</span>
        </div>
      )}
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} className="mt-1">
          <Icon icon="lucide:rotate-cw" className="w-3.5 h-3.5" />
          <span>Retry action</span>
        </Button>
      )}
    </div>
  );
}

