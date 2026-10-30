import React from 'react';
import { Breadcrumbs } from '../navigation/Breadcrumbs.jsx';

export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
  eyebrow,
  className = '',
}) {
  return (
    <div className={`mb-8 ${className}`}>
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
      {eyebrow && (
        <span className="block text-xs uppercase tracking-widest text-muted-foreground font-mono mb-1">
          {eyebrow}
        </span>
      )}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headings text-3xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground max-w-2xl">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}

