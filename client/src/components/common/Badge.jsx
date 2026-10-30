import React from 'react';
import { Icon } from '@iconify/react';

export function Badge({ variant = 'neutral', children, className = '' }) {
  const styles = {
    running: 'bg-primary/15 border-primary/30 text-foreground',
    queued: 'bg-warning/15 border-warning/30 text-warning',
    completed: 'bg-success/15 border-success/30 text-success',
    failed: 'bg-error/15 border-error/30 text-error',
    neutral: 'bg-muted text-muted-foreground border-border',
    beta: 'rounded-sm bg-royal text-white border-transparent px-2 py-0.5 uppercase tracking-wider font-mono text-[10px]',
    compliance: 'rounded-sm bg-gold/20 border border-gold/40 text-gold px-2 py-0.5 text-xs',
  };

  const isTag = variant === 'beta' || variant === 'compliance';

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${
        isTag ? styles[variant] : `rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[variant] || styles.neutral}`
      } ${className}`}
    >
      {variant === 'running' && (
        <span className="w-1.5 h-1.5 rounded-full bg-primary pulse-dot" />
      )}
      {variant === 'queued' && (
        <Icon icon="lucide:clock" className="w-3 h-3 text-warning" />
      )}
      {variant === 'completed' && (
        <Icon icon="lucide:check" className="w-3 h-3 text-success" />
      )}
      {variant === 'failed' && (
        <Icon icon="lucide:alert-circle" className="w-3 h-3 text-error" />
      )}
      {children}
    </span>
  );
}

