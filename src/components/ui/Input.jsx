import React from 'react';

export function Input({ className = '', ...props }) {
  return (
    <input
      className={`flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20 disabled:cursor-not-allowed disabled:opacity-60 transition-all ${className}`}
      {...props}
    />
  );
}

export function Label({ className = '', children, ...props }) {
  return (
    <label
      className={`text-sm font-semibold leading-none text-slate-700 ${className}`}
      {...props}
    >
      {children}
    </label>
  );
}
