import React from 'react';
import { Icon } from '@iconify/react';

export function Select({
  label,
  error,
  helperText,
  id,
  options = [],
  className = '',
  required = false,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block mb-1.5 text-sm font-medium text-foreground"
        >
          {label} {required && <span className="text-primary">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={inputId}
          required={required}
          className={`w-full appearance-none rounded-md border ${
            error ? 'border-error' : 'border-border'
          } bg-input px-3 py-2.5 pr-9 text-sm text-foreground focus:border-2 focus:border-primary focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-surface text-foreground">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-muted-foreground">
          <Icon icon="lucide:chevron-down" className="w-4 h-4" />
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
      {!error && helperText && (
        <p className="mt-1 text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}

