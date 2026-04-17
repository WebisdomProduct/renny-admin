import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, ShieldCheck, User } from 'lucide-react';

const defaultValues = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'admin',
  isActive: true,
  mustChangePassword: true,
};

const AdminAccountForm = ({
  initialValues = {},
  loading = false,
  submitLabel = 'Create Admin',
  onSubmit,
}) => {
  const [formData, setFormData] = useState({ ...defaultValues, ...initialValues });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit?.(formData, () => setFormData({ ...defaultValues, ...initialValues }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-1.5 ml-1 block text-sm font-semibold text-gray-700">Full Name</label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={formData.name}
              onChange={handleChange('name')}
              placeholder="Content Manager"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm font-medium transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              disabled={loading}
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="mb-1.5 ml-1 block text-sm font-semibold text-gray-700">Email Address</label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              placeholder="editor@company.com"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm font-medium transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 ml-1 block text-sm font-semibold text-gray-700">Password</label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange('password')}
              placeholder="TempPassword123"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-12 text-sm font-medium transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 transition-colors hover:text-gray-600"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1.5 ml-1 block text-sm font-semibold text-gray-700">Confirm Password</label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <ShieldCheck className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange('confirmPassword')}
              placeholder="TempPassword123"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-12 text-sm font-medium transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((current) => !current)}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 transition-colors hover:text-gray-600"
              aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="mb-1.5 ml-1 block text-sm font-semibold text-gray-700">Role</label>
          <select
            value={formData.role}
            onChange={handleChange('role')}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            disabled={loading}
          >
            <option value="admin">Admin</option>
            <option value="superadmin">Superadmin</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={handleChange('isActive')}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            disabled={loading}
          />
          <span>
            <span className="block text-sm font-semibold text-gray-900">Active account</span>
            <span className="mt-1 block text-sm text-gray-500">Inactive users cannot log in.</span>
          </span>
        </label>

        <label className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <input
            type="checkbox"
            checked={formData.mustChangePassword}
            onChange={handleChange('mustChangePassword')}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            disabled={loading}
          />
          <span>
            <span className="block text-sm font-semibold text-gray-900">Require password change</span>
            <span className="mt-1 block text-sm text-gray-500">User will be asked to change password after first login.</span>
          </span>
        </label>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-6">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-blue-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:from-indigo-700 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? 'Creating Admin...' : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default AdminAccountForm;
