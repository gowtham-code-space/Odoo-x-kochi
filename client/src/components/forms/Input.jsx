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
          className="block mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        >
          {label} {required && <span className="text-primary">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        required={required}
        className={`w-full h-11 rounded-lg px-3.5 text-sm text-foreground bg-[#131926] border border-[#222c3f] placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
          error ? '!border-error !ring-error' : ''
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
