import React from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100 font-helvetica">
      {/* Sidebar */}
      <Sidebar />

      {/* Page Content */}
      <main className="w-[78%] px-10 py-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
