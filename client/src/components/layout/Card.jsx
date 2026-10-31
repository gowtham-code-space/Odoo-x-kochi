import React from 'react';

export function Card({
  title,
  subtitle,
  actions,
  children,
  className = '',
  bodyClassName = '',
  headerClassName = '',
  footer,
}) {
  return (
    <div className={`overflow-hidden rounded-xl border border-border bg-surface ${className}`}>
      {(title || subtitle || actions) && (
        <div
          className={`flex items-center justify-between gap-4 border-b border-border px-6 py-4 ${headerClassName}`}
        >
          <div>
            {title && (
              <h3 className="font-headings text-lg font-bold text-foreground tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2.5">{actions}</div>}
        </div>
      )}
      <div className={`p-6 ${bodyClassName}`}>{children}</div>
      {footer && (
        <div className="flex items-center justify-between border-t border-border bg-surface-raised px-6 py-4">
          {footer}
        </div>
      )}
    </div>
  );
}
