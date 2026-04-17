import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, LockKeyhole, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import logo from '../assets/RennyLogo.png';
import { LazyImage } from '../components/ui/LazyImage';
import { clearAdminSession, getAdminInfo, getAdminToken, saveAdminSession } from '../utils/auth';
import { API } from '../config/api';

const ChangePassword = () => {
    const navigate = useNavigate();
    const token = getAdminToken();
    const adminInfo = getAdminInfo();
    const [loading, setLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    const handleInputChange = (field) => (e) => {
        setFormData(prev => ({
            ...prev,
            [field]: e.target.value
        }));
    };

    const validateForm = () => {
        if (!formData.currentPassword.trim()) {
            toast.error('Please enter your current password.');
            return false;
        }
        if (!formData.newPassword.trim()) {
            toast.error('Please enter a new password.');
            return false;
        }
        if (formData.newPassword.length < 8) {
            toast.error('New password must be at least 8 characters long.');
            return false;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('New passwords do not match.');
            return false;
        }
        if (formData.currentPassword === formData.newPassword) {
            toast.error('New password must be different from current password.');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
        return;
    }

    setLoading(true);
    try {
        await axios.post(
            API.AUTH_CHANGE_PASSWORD,
            {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
                confirmPassword: formData.confirmPassword  // ADD THIS LINE
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        // Update admin info to reflect password has been changed
        const updatedAdminInfo = { ...adminInfo, mustChangePassword: false };
        saveAdminSession(updatedAdminInfo);

        toast.success('Password changed successfully!');
        navigate('/admin', { replace: true });
    } catch (error) {
        toast.error(error.response?.data?.message || error.message || 'Failed to change password.');
    } finally {
        setLoading(false);
    }
};

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-4 font-helvetica">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-cyan-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col items-center text-center mb-6">
                    <div className="mb-6">
                        <LazyImage
                            src={logo}
                            alt="Renny Logo"
                            wrapperClassName="w-48 h-24"
                            className="h-full w-full object-contain"
                            placeholderClassName="rounded-2xl animate-pulse"
                            fallbackSrc={logo}
                        />
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Action Required
                    </div>

                    <h2 className="mt-4 text-3xl font-bold text-gray-900 tracking-tight">Change Your Password</h2>
                    <p className="mt-2 text-sm font-medium text-gray-500">
                        You must change your password before accessing the CMS.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="relative z-10 space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Current Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <LockKeyhole className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type={showCurrentPassword ? "text" : "password"}
                                value={formData.currentPassword}
                                onChange={handleInputChange('currentPassword')}
                                placeholder="Enter current password"
                                className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all disabled:opacity-50"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center"
                            >
                                {showCurrentPassword ? (
                                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                ) : (
                                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">New Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <LockKeyhole className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type={showNewPassword ? "text" : "password"}
                                value={formData.newPassword}
                                onChange={handleInputChange('newPassword')}
                                placeholder="Enter new password"
                                className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all disabled:opacity-50"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center"
                            >
                                {showNewPassword ? (
                                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                ) : (
                                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Confirm New Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <LockKeyhole className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={formData.confirmPassword}
                                onChange={handleInputChange('confirmPassword')}
                                placeholder="Confirm new password"
                                className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all disabled:opacity-50"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center"
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                ) : (
                                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="group w-full flex items-center justify-center gap-2 py-3.5 px-4 mt-2 border border-transparent rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg shadow-indigo-200 transform transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Changing Password...
                            </span>
                        ) : (
                            <>
                                Change Password
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 flex w-full flex-col gap-3">
                    <button
                        type="button"
                        onClick={() => {
                            clearAdminSession();
                            navigate('/login', { replace: true });
                        }}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                    >
                        Return To Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;
