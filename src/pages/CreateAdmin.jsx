import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ShieldAlert, UserPlus } from 'lucide-react';
import AdminAccountForm from '../components/admin/AdminAccountForm';
import { API } from '../config/api';
import { getAdminInfo, getAdminToken, isSuperadmin } from '../utils/auth';

const CreateAdmin = () => {
  const navigate = useNavigate();
  const token = getAdminToken();
  const adminInfo = useMemo(() => getAdminInfo(), []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token || isSuperadmin(adminInfo)) {
      return;
    }

    toast.error('Access denied');
    navigate('/admin', { replace: true });
  }, [adminInfo?.role, navigate, token]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!isSuperadmin(adminInfo)) {
    return null;
  }

  const handleCreateAdmin = async (values, resetForm) => {
    const { name, email, password, confirmPassword, role, isActive, mustChangePassword } = values;

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      toast.error('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const tokenFromStorage = localStorage.getItem('adminToken');

      await axios.post(
        API.AUTH_ADMINS,
        {
          name: name.trim(),
          email: email.trim(),
          password,
          role,
          isActive,
          mustChangePassword,
        },
        {
          headers: {
            Authorization: `Bearer ${tokenFromStorage}`,
          },
        }
      );

      toast.success('Admin account created successfully.');
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to create admin account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 font-helvetica">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700">
            <ShieldAlert className="h-3.5 w-3.5" />
            Superadmin Only
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-gray-900">Create Admin Account</h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-600">
            Add internal CMS users and control whether they are active, their role, and whether they must update their password on first login.
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-5">
          <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-700">
            <UserPlus className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">New admin details</h2>
            <p className="text-sm text-gray-500">This account will be created through the protected CMS admin endpoint.</p>
          </div>
        </div>

        <div className="px-6 py-6">
          <AdminAccountForm loading={loading} submitLabel="Create Admin" onSubmit={handleCreateAdmin} />
        </div>
      </div>
    </div>
  );
};

export default CreateAdmin;
