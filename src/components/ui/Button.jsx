import React from 'react';

export function Button({
  className = '',
  variant = 'primary',
  size = 'md',
  children,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center rounded-2xl font-semibold transition duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none';

  const variants = {
    primary: 'bg-slate-900 text-white shadow-sm hover:bg-slate-800',
    secondary: 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
    danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700',
    success: 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700',
  };

  const sizes = {
    sm: 'h-9 px-3 text-xs',
    md: 'h-11 px-5 text-sm',
    lg: 'h-12 px-6 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
