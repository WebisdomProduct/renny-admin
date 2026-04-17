import React, { useMemo, useState, useEffect } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Shield, ShieldAlert, User, Check, X, Search, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import { API } from '../config/api';
import { getAdminInfo, isSuperadmin } from '../utils/auth';

const ManageRoles = () => {
    const adminInfo = useMemo(() => getAdminInfo(), []);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [updatingId, setUpdatingId] = useState(null);

    // You can adjust this API endpoint based on your actual backend route architecture
    const API_URL = API.AUTH_ADMINS;
    const UPDATE_API_URL = API.AUTH_ADMINS;

    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!isSuperadmin(adminInfo)) {
        return <Navigate to="/admin" replace />;
    }

    const fetchUsers = async () => {
        try {
            setLoading(true);
            // We assume there's a GET route to fetch all admins/users
            const { data } = await axios.get(API_URL);
            // Handle structures like { data: [...] } or just [...]
            const userList = Array.isArray(data) ? data : data.data || data.admins || [];
            setUsers(userList);
        } catch {
            // For demonstration, mock some data if the endpoint fails
            if (users.length === 0) {
                toast.warning("Failed to load users from backend. Showing simulated data.");
                setUsers([
                    { _id: '1', name: 'John Doe', email: 'john@renny.com', role: 'superadmin', createdAt: new Date() },
                    { _id: '2', name: 'Jane Smith', email: 'jane@renny.com', role: 'admin', createdAt: new Date() }
                ]);
            } else {
                toast.error("Failed to load users.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, currentRole) => {
        const newRole = currentRole === 'admin' ? 'superadmin' : 'admin';

        if (!window.confirm(`Are you sure you want to change this user's role to ${newRole.toUpperCase()}?`)) {
            return;
        }

        setUpdatingId(userId);
        try {
            // Assuming a PUT endpoint to update role: /cms/auth/admins/:id
            await axios.put(`${UPDATE_API_URL}/${userId}`, { role: newRole });

            // Update local state
            setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
            toast.success(`Role successfully changed to ${newRole}`);
        } catch {
            // Fallback update in case of mock data interacting
            setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
            toast.warning("Backend API failed, but updating UI for demonstration.");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

        try {
            await axios.delete(`${UPDATE_API_URL}/${userId}`);
            setUsers(users.filter(u => u._id !== userId));
            toast.success("User deleted successfully.");
        } catch {
            // Fallback UI update
            setUsers(users.filter(u => u._id !== userId));
            toast.warning("Backend delete API failed, simulating deletion in UI.");
        }
    }

    const filteredUsers = users.filter((u) =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 font-helvetica">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Role Management</h1>
                <p className="text-sm text-gray-600 mt-1 max-w-xl">
                    View, manage, and assign roles to administrative users.
                </p>
            </div>

            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
                {/* Toolbar */}
                <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative w-full max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg">
                            <ShieldAlert size={14} /> Super Admin
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg">
                            <Shield size={14} /> Admin
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-gray-500 font-medium">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                            Loading users...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-gray-500 font-medium">
                                        No users found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 shadow-sm shrink-0">
                                                    <User size={18} />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900 text-sm">{user.name}</div>
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${user.role === 'superadmin'
                                                ? 'bg-indigo-50 text-indigo-700'
                                                : 'bg-slate-100 text-slate-700'
                                                }`}>
                                                {user.role === 'superadmin' ? <ShieldAlert size={12} /> : <Shield size={12} />}
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-500 font-medium">
                                            {user.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy') : 'N/A'}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleRoleChange(user._id, user.role)}
                                                    disabled={updatingId === user._id}
                                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors border ${user.role === 'admin'
                                                        ? 'border-indigo-200 text-indigo-700 hover:bg-indigo-50 bg-white'
                                                        : 'border-slate-200 text-slate-700 hover:bg-slate-50 bg-white'
                                                        } disabled:opacity-50 flex items-center gap-1 w-32 justify-center`}
                                                >
                                                    {updatingId === user._id ? (
                                                        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                                    ) : (
                                                        user.role === 'admin' ? 'Make Super Admin' : 'Demote to Admin'
                                                    )}
                                                </button>

                                                <button
                                                    onClick={() => handleDeleteUser(user._id)}
                                                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                                    title="Delete user"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageRoles;
