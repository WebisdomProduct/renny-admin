import React from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import { PageShell } from './ui/PageShell';

const AdminLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-gray-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Page Content */}
      <main className="relative flex h-screen w-0 flex-1 flex-col overflow-y-auto">
        <PageShell>
          <Outlet />
        </PageShell>
      </main>
    </div>
  );
};

export default AdminLayout;
