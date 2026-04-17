import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSave, FiImage, FiUploadCloud, FiLayout, FiPlus, FiTrash2, FiMove } from 'react-icons/fi';
import { API } from '../config/api';
import { notifySuccess, notifyError } from "../utils/notifications";




const DesignCentreAdmin = () => {
    const CMS_API = API.CMS_DESIGN_CENTRE;
    const UPLOAD_API = API.UPLOAD;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    const [formData, setFormData] = useState({
        introTitle: "Design Centre",
        introParagraphsTop: [""],
        introImage: "",
        introParagraphsBottom: [""],
        stats: [{ title: "", desc: "" }],
        innovationHeading: "",
        innovationParagraphs: [""]
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get(CMS_API);
            if (res.data.success && res.data.data) {
                const data = res.data.data;
                // Ensure arrays exist for new dynamic fields
                setFormData({
                    ...data,
                    introParagraphsTop: data.introParagraphsTop?.length ? data.introParagraphsTop : [""],
                    introParagraphsBottom: data.introParagraphsBottom?.length ? data.introParagraphsBottom : [""],
                    stats: data.stats?.length ? data.stats : [{ title: "", desc: "" }],
                    innovationParagraphs: data.innovationParagraphs?.length ? data.innovationParagraphs : [""]
                });
            }
        } catch { notifyError("Unable to complete the request."); } finally {
            setFetching(false);
        }
    };

    // --- Array Helpers ---
    const updateArrayField = (field, index, value) => {
        const newArr = [...formData[field]];
        newArr[index] = value;
        setFormData({ ...formData, [field]: newArr });
    };

    const addArrayItem = (field, defaultValue = "") => {
        setFormData({ ...formData, [field]: [...formData[field], defaultValue] });
    };

    const removeArrayItem = (field, index) => {
        if (formData[field].length <= 1 && field !== 'stats') return; // Keep at least one for paragraphs
        const newArr = formData[field].filter((_, i) => i !== index);
        setFormData({ ...formData, [field]: newArr });
    };

    const updateStatField = (index, subfield, value) => {
        const newStats = [...formData.stats];
        newStats[index] = { ...newStats[index], [subfield]: value };
        setFormData({ ...formData, stats: newStats });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let introImage = formData.introImage;

            if (selectedFile) {
                setUploading(true);
                const uploadData = new FormData();
                uploadData.append('file', selectedFile);
                const uploadRes = await axios.post(UPLOAD_API, uploadData);
                introImage = uploadRes.data.fileUrl;
                setUploading(false);
            }

            // Clean data: remove empty paragraphs
            const payload = { 
                ...formData, 
                introImage,
                introParagraphsTop: formData.introParagraphsTop.filter(p => p.trim() !== ""),
                introParagraphsBottom: formData.introParagraphsBottom.filter(p => p.trim() !== ""),
                innovationParagraphs: formData.innovationParagraphs.filter(p => p.trim() !== ""),
                stats: formData.stats.filter(s => s.title.trim() !== "" || s.desc.trim() !== "")
            };

            await axios.post(CMS_API, payload);
            notifySuccess("Design Centre content updated successfully!");
            setSelectedFile(null);
            fetchData();
        } catch (err) {
            notifyError("Failed to save content. " + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
            setUploading(false);
        }
    };

    if (fetching) return <div className="p-10 text-center font-bold">Loading...</div>;

    const renderParagraphInputs = (field, label) => (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-gray-600 uppercase tracking-wider">{label}</label>
                <button 
                    type="button" 
                    onClick={() => addArrayItem(field)}
                    className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                >
                    <FiPlus /> Add Paragraph
                </button>
            </div>
            {formData[field].map((para, idx) => (
                <div key={idx} className="relative group">
                    <textarea 
                        rows={3}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#292c44] transition-all leading-relaxed pr-12"
                        value={para}
                        onChange={(e) => updateArrayField(field, idx, e.target.value)}
                        placeholder={`Paragraph ${idx + 1}...`}
                    />
                    <button 
                        type="button" 
                        onClick={() => removeArrayItem(field, idx)}
                        className="absolute right-4 top-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                        <FiTrash2 size={18} />
                    </button>
                </div>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F9FAFB] pb-20 font-sans text-[#292c44]">
            <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
                <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#292c44] rounded-xl flex items-center justify-center text-white shadow-lg">
                            <FiLayout size={20} />
                        </div>
                        <h1 className="text-xl font-bold">Design Centre CMS</h1>
                    </div>
                    <button
                        form="design-centre-form"
                        type="submit"
                        disabled={loading || uploading}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm bg-[#292c44] text-white transition-all hover:opacity-90 disabled:bg-gray-400 shadow-lg shadow-[#292c44]/20"
                    >
                        <FiSave size={18} />
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-6 mt-10">
                <form id="design-centre-form" onSubmit={handleSubmit} className="space-y-8 pb-10">
                    
                    {/* Intro Section */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                        <h2 className="text-lg font-black mb-8 uppercase tracking-wider text-gray-400">Introduction Section</h2>
                        <div className="space-y-10">
                            <div>
                                <label className="block text-sm font-bold mb-4 uppercase text-gray-500 tracking-widest">Page Main Title</label>
                                <input 
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#292c44] transition-all font-bold text-lg"
                                    value={formData.introTitle}
                                    onChange={(e) => setFormData({...formData, introTitle: e.target.value})}
                                    placeholder="e.g. Design Centre"
                                />
                            </div>

                            {renderParagraphInputs('introParagraphsTop', 'Intro Paragraphs (Top of image)')}

                            <div>
                                <label className="block text-sm font-bold mb-4 uppercase text-gray-500 tracking-widest">Page Image</label>
                                <div className="flex items-center gap-6">
                                    <div className="w-48 h-28 bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100 group relative">
                                        {selectedFile ? (
                                            <div className="text-[10px] text-blue-500 font-black px-2 text-center uppercase">New: {selectedFile.name}</div>
                                        ) : formData.introImage ? (
                                            <img src={formData.introImage} className="w-full h-full object-cover" />
                                        ) : (
                                            <FiImage size={24} className="text-gray-300" />
                                        )}
                                    </div>
                                    <label className="flex-1 flex items-center justify-center gap-2 px-5 py-8 bg-gray-50 border border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-100 transition-all group">
                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                        <FiUploadCloud className="text-gray-400 group-hover:text-[#292c44] transition-colors" />
                                        <span className="text-sm font-bold text-gray-500 group-hover:text-[#292c44]">{uploading ? 'Uploading...' : 'Click to Upload New Image'}</span>
                                    </label>
                                </div>
                                <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wide ml-1 mt-2">⚠ Note: Please upload images in <span className="text-orange-500">WebP</span> format only</p>
                            </div>

                            {renderParagraphInputs('introParagraphsBottom', 'Intro Paragraphs (Bottom of image)')}
                        </div>
                    </div>

                    {/* Stats Section */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-lg font-black uppercase tracking-wider text-gray-400">Stats Section</h2>
                            <button 
                                type="button" 
                                onClick={() => addArrayItem('stats', { title: "", desc: "" })}
                                className="flex items-center gap-1 text-xs font-black text-[#292c44] py-2 px-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all border border-gray-100"
                            >
                                <FiPlus /> Add Stat Box
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {formData.stats.map((stat, idx) => (
                                <motion.div 
                                    layout
                                    key={idx} 
                                    className="relative bg-gray-50/50 p-6 rounded-3xl border border-gray-100 group"
                                >
                                    <button 
                                        type="button" 
                                        onClick={() => removeArrayItem('stats', idx)}
                                        className="absolute -top-2 -right-2 p-2 bg-white text-gray-300 hover:text-red-500 shadow-sm border border-gray-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 z-10"
                                    >
                                        <FiTrash2 size={16} />
                                    </button>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] items-center gap-2 font-black uppercase text-gray-400 mb-2 flex">
                                                <FiMove className="text-gray-300" /> Stat Title
                                            </label>
                                            <input 
                                                placeholder="e.g. Total Engineers"
                                                className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#292c44] font-bold"
                                                value={stat.title}
                                                onChange={(e) => updateStatField(idx, 'title', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Stat Description</label>
                                            <textarea 
                                                placeholder="Enter details..."
                                                rows={3}
                                                className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#292c44] text-sm"
                                                value={stat.desc}
                                                onChange={(e) => updateStatField(idx, 'desc', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Innovation Section */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                        <h2 className="text-lg font-black mb-8 uppercase tracking-wider text-gray-400">Innovation Section</h2>
                        <div className="space-y-8">
                            <div>
                                <label className="block text-sm font-bold mb-4 uppercase text-gray-500 tracking-widest">Section Heading</label>
                                <input 
                                    placeholder="e.g. Pioneer in Innovation"
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#292c44] font-bold text-lg"
                                    value={formData.innovationHeading}
                                    onChange={(e) => setFormData({...formData, innovationHeading: e.target.value})}
                                />
                            </div>
                            
                            {renderParagraphInputs('innovationParagraphs', 'Innovation Description Paragraphs')}
                        </div>
                    </div>

                </form>
            </main>
        </div>
    );
};

export default DesignCentreAdmin;
