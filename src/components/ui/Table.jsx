import React from 'react';

export function Table({ className = '', children, ...props }) {
  return (
    <div className="w-full overflow-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
      <table className={`min-w-full w-full caption-bottom text-sm ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ className = '', ...props }) {
  return <thead className={`border-b border-slate-200 bg-slate-50/80 ${className}`} {...props} />;
}

export function TableBody({ className = '', ...props }) {
  return <tbody className={`divide-y divide-slate-100 ${className}`} {...props} />;
}

export function TableRow({ className = '', ...props }) {
  return (
    <tr
      className={`hover:bg-slate-50 transition-colors ${className}`}
      {...props}
    />
  );
}

export function TableHead({ className = '', ...props }) {
  return (
    <th
      className={`h-12 px-4 text-left align-middle font-semibold text-slate-500 uppercase tracking-[0.2em] text-[11px] ${className}`}
      {...props}
    />
  );
}

export function TableCell({ className = '', ...props }) {
  return (
    <td
      className={`p-4 align-middle text-slate-900 ${className}`}
      {...props}
    />
  );
}
