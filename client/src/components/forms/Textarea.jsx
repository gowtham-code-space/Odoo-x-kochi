import React from 'react';

export function Textarea({
  label,
  error,
  helperText,
  id,
  rows = 3,
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
      <textarea
        id={inputId}
        rows={rows}
        required={required}
        className={`w-full rounded-md border ${
          error ? 'border-error' : 'border-border'
        } bg-input px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-2 focus:border-primary focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed resize-y ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
      {!error && helperText && (
        <p className="mt-1 text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}

