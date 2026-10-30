import React from 'react';
import { Spinner } from './Spinner.jsx';

export function Button({
  children,
  variant = 'primary',
  size = 'default',
  isLoading = false,
  disabled = false,
  className = '',
  type = 'button',
  icon: Icon,
  ...props
}) {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-md transition-all duration-150 select-none cursor-pointer disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 active:scale-[0.98]';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    default: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
    icon: 'h-10 w-10 p-2 text-sm',
  };

  const variantClasses = {
    primary:
      'bg-primary text-primary-foreground hover:opacity-85 disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100',
    secondary:
      'bg-secondary text-secondary-foreground border border-border hover:bg-surface-raised disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100',
    ghost:
      'border border-border text-foreground hover:bg-surface-raised disabled:text-muted-foreground disabled:opacity-50',
    destructive:
      'bg-error text-error-foreground hover:opacity-85 disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${sizeClasses[size] || sizeClasses.default} ${
        variantClasses[variant] || variantClasses.primary
      } ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner size="sm" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4 shrink-0" />}
          {children}
        </>
      )}
    </button>
  );
}

