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
    <div
      className={`rounded-2xl border border-[#222c3f] bg-[#111622] shadow-lg shadow-black/20 overflow-hidden ${className}`}
    >
      {(title || subtitle || actions) && (
        <div
          className={`px-7 py-5 border-b border-[#222c3f] flex items-center justify-between gap-4 ${headerClassName}`}
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
      <div className={`p-7 ${bodyClassName}`}>{children}</div>
      {footer && (
        <div className="px-7 py-4 border-t border-[#222c3f] bg-[#182030]/50 flex items-center justify-between">
          {footer}
        </div>
      )}
    </div>
  );
}
