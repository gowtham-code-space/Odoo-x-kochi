import React from 'react';

export function Input({
  label,
  error,
  helperText,
  id,
  type = 'text',
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
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          {label} {required && <span className="text-primary">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        required={required}
        className={`w-full rounded-md border bg-input px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-2 focus:border-primary focus:outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
          error ? '!border-error' : 'border-border'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-error font-medium">{error}</p>}
      {!error && helperText && (
        <p className="mt-1.5 text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}
