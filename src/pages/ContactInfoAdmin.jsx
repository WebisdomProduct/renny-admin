import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FiSave, FiPlus, FiTrash2, FiPhone, FiMail, FiMapPin } from 'react-icons/fi';
import { API } from '../config/api';
import { notifyError } from "../utils/notifications";




const ContactInfoAdmin = () => {
    const CMS_API = API.CMS_CONTACT_INFO;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [formData, setFormData] = useState({
        emails: [''],
        phones: [''],
        offices: [
            {
                type: 'Registered Office',
                title: '',
                addressLine1: '',
                addressLine2: '',
                cityStateZip: ''
            }
        ]
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get(CMS_API);
            if (res.data.success && res.data.data) {
                const d = res.data.data;
                setFormData({
                    emails: d.emails?.length ? d.emails : [''],
                    phones: d.phones?.length ? d.phones : [''],
                    offices: d.offices?.length ? d.offices : [{ type: 'Registered Office', title: '', addressLine1: '', addressLine2: '', cityStateZip: '' }]
                });
            }
        } catch { notifyError("Unable to complete the request."); } finally {
            setFetching(false);
        }
    };

    // --- Array helpers ---
    const updateStringArray = (field, index, value) => {
        const arr = [...formData[field]];
        arr[index] = value;
        setFormData({ ...formData, [field]: arr });
    };

    const addStringItem = (field) => {
        setFormData({ ...formData, [field]: [...formData[field], ''] });
    };

    const removeStringItem = (field, index) => {
        if (formData[field].length <= 1) return;
        setFormData({ ...formData, [field]: formData[field].filter((_, i) => i !== index) });
    };

    const updateOffice = (index, key, value) => {
        const offices = [...formData.offices];
        offices[index] = { ...offices[index], [key]: value };
        setFormData({ ...formData, offices });
    };

    const addOffice = () => {
        setFormData({
            ...formData,
            offices: [...formData.offices, { type: 'Other', title: '', addressLine1: '', addressLine2: '', cityStateZip: '' }]
        });
    };

    const removeOffice = (index) => {
        if (formData.offices.length <= 1) return;
        setFormData({ ...formData, offices: formData.offices.filter((_, i) => i !== index) });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                emails: formData.emails.filter(e => e.trim() !== ''),
                phones: formData.phones.filter(p => p.trim() !== ''),
                offices: formData.offices.filter(o => o.title.trim() !== '' || o.addressLine1.trim() !== '')
            };
            await axios.post(CMS_API, payload);
            notifyError('Contact info updated successfully!');
            fetchData();
        } catch (err) {
            notifyError('Failed to save: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="p-10 text-center font-bold text-[#292c44]">Loading...</div>;

    const inputClass = "w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#292c44] transition-all text-sm";
    const labelClass = "block text-xs font-black uppercase tracking-widest text-gray-400 mb-2";

    return (
        <div className="min-h-screen bg-[#F9FAFB] pb-20 font-sans text-[#292c44]">
            {/* Sticky Header */}
            <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
                <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#292c44] rounded-xl flex items-center justify-center text-white shadow-lg">
                            <FiMapPin size={20} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black">Contact Info CMS</h1>
                            <p className="text-xs text-gray-400">Manage emails, phones & office addresses</p>
                        </div>
                    </div>
                    <button
                        form="contact-info-form"
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm bg-[#292c44] text-white hover:opacity-90 disabled:bg-gray-400 shadow-lg transition-all"
                    >
                        <FiSave size={16} />
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-6 mt-10">
                <form id="contact-info-form" onSubmit={handleSubmit} className="space-y-8">

                    {/* Emails */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                                    <FiMail size={18} className="text-blue-500" />
                                </div>
                                <h2 className="text-base font-black uppercase tracking-wider text-gray-400">Email Addresses</h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => addStringItem('emails')}
                                className="flex items-center gap-1 text-xs font-black text-[#292c44] py-2 px-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all border border-gray-100"
                            >
                                <FiPlus size={14} /> Add Email
                            </button>
                        </div>
                        <div className="space-y-3">
                            {formData.emails.map((email, idx) => (
                                <div key={idx} className="flex items-center gap-3 group">
                                    <input
                                        type="email"
                                        className={inputClass}
                                        value={email}
                                        onChange={(e) => updateStringArray('emails', idx, e.target.value)}
                                        placeholder={`e.g. info@rennystrips.com`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeStringItem('emails', idx)}
                                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shrink-0"
                                    >
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Phones */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
                                    <FiPhone size={18} className="text-green-500" />
                                </div>
                                <h2 className="text-base font-black uppercase tracking-wider text-gray-400">Phone Numbers</h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => addStringItem('phones')}
                                className="flex items-center gap-1 text-xs font-black text-[#292c44] py-2 px-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all border border-gray-100"
                            >
                                <FiPlus size={14} /> Add Phone
                            </button>
                        </div>
                        <div className="space-y-3">
                            {formData.phones.map((phone, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        className={inputClass}
                                        value={phone}
                                        onChange={(e) => updateStringArray('phones', idx, e.target.value)}
                                        placeholder={`e.g. +91-82880-01300`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeStringItem('phones', idx)}
                                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shrink-0"
                                    >
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Offices */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center">
                                    <FiMapPin size={18} className="text-purple-500" />
                                </div>
                                <h2 className="text-base font-black uppercase tracking-wider text-gray-400">Office Addresses</h2>
                            </div>
                            <button
                                type="button"
                                onClick={addOffice}
                                className="flex items-center gap-1 text-xs font-black text-[#292c44] py-2 px-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all border border-gray-100"
                            >
                                <FiPlus size={14} /> Add Office
                            </button>
                        </div>
                        <div className="space-y-6">
                            {formData.offices.map((office, idx) => (
                                <motion.div
                                    layout
                                    key={idx}
                                    className="relative bg-gray-50 rounded-3xl p-6 border border-gray-100 group"
                                >
                                    <button
                                        type="button"
                                        onClick={() => removeOffice(idx)}
                                        className="absolute -top-2 -right-2 p-2 bg-white text-gray-300 hover:text-red-500 shadow-sm border border-gray-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 z-10"
                                    >
                                        <FiTrash2 size={14} />
                                    </button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>Office Type</label>
                                            <select
                                                className={inputClass}
                                                value={office.type}
                                                onChange={(e) => updateOffice(idx, 'type', e.target.value)}
                                            >
                                                <option value="Registered Office">Registered Office</option>
                                                <option value="Site Office">Site Office</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelClass}>Display Title / Street Line</label>
                                            <input
                                                type="text"
                                                className={inputClass}
                                                value={office.title}
                                                onChange={(e) => updateOffice(idx, 'title', e.target.value)}
                                                placeholder="e.g. Lakhowal Road, Opposite PSPCL"
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Address Line 1</label>
                                            <input
                                                type="text"
                                                className={inputClass}
                                                value={office.addressLine1}
                                                onChange={(e) => updateOffice(idx, 'addressLine1', e.target.value)}
                                                placeholder="e.g. House- Kohara, Ludhiana"
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Address Line 2 (Optional)</label>
                                            <input
                                                type="text"
                                                className={inputClass}
                                                value={office.addressLine2}
                                                onChange={(e) => updateOffice(idx, 'addressLine2', e.target.value)}
                                                placeholder="e.g. Industrial Area-B"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className={labelClass}>City, State & PIN</label>
                                            <input
                                                type="text"
                                                className={inputClass}
                                                value={office.cityStateZip}
                                                onChange={(e) => updateOffice(idx, 'cityStateZip', e.target.value)}
                                                placeholder="e.g. Punjab - 141112, India"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Live Preview */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                        <h2 className="text-base font-black uppercase tracking-wider text-gray-400 mb-6">Live Preview</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Email & Phone Preview */}
                            <div className="bg-gray-100 rounded-2xl p-6 space-y-3 text-center">
                                <p className="font-bold text-[#292c44]">Get in Touch</p>
                                {formData.emails.filter(e => e).map((e, i) => (
                                    <div key={i} className="flex items-center justify-center gap-2 text-sm text-gray-600">
                                        <FiMail size={14} className="shrink-0" />
                                        <span className="truncate">{e}</span>
                                    </div>
                                ))}
                                {formData.phones.filter(p => p).map((p, i) => (
                                    <div key={i} className="flex items-center justify-center gap-2 text-sm text-gray-600">
                                        <FiPhone size={14} className="shrink-0" />
                                        <span>{p}</span>
                                    </div>
                                ))}
                            </div>
                            {/* Office Previews */}
                            {formData.offices.filter(o => o.title || o.addressLine1).map((office, i) => (
                                <div key={i} className="bg-gray-100 rounded-2xl p-6 space-y-2 text-center">
                                    <div className="flex items-center justify-center gap-2 font-bold text-[#292c44]">
                                        <FiMapPin size={16} />
                                        <span>{office.type}</span>
                                    </div>
                                    {office.title && <p className="font-semibold text-sm">{office.title}</p>}
                                    {office.addressLine1 && <p className="text-xs text-gray-500">{office.addressLine1}</p>}
                                    {office.addressLine2 && <p className="text-xs text-gray-500">{office.addressLine2}</p>}
                                    {office.cityStateZip && <p className="text-xs text-gray-500">{office.cityStateZip}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default ContactInfoAdmin;
