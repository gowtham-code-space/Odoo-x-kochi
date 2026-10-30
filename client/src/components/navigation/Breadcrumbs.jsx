import React from 'react';
import { Link } from 'react-router-dom';

export function Breadcrumbs({ items = [] }) {
  if (!items || items.length === 0) return null;

  return (
    <nav className="flex items-center text-sm text-muted-foreground mb-3" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={idx} className="flex items-center">
              {idx > 0 && <span className="mx-2 text-muted-foreground">/</span>}
              {item.to && !isLast ? (
                <Link
                  to={item.to}
                  className="hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-foreground font-medium">{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

