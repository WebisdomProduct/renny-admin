import React from 'react';

export function PageShell({ children, title, description, actions, className = '' }) {
  return (
    <section className={`min-h-screen bg-slate-50 py-8 ${className}`}>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        {(title || description || actions) && (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                {title && <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{title}</h1>}
                {description && <p className="mt-2 text-sm text-slate-500">{description}</p>}
              </div>
              {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
            </div>
          </div>
        )}

        <div className="space-y-6">{children}</div>
      </div>
    </section>
  );
}
