import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, FiEdit3, FiTrash2, FiLink, FiCheck, 
  FiX, FiLayers, FiEye, FiEyeOff, FiChevronDown, FiChevronUp 
} from 'react-icons/fi';

const News = () => {
  // API Configuration
  const CMS_API = "http://localhost:3000/cms/news";

  // State Management
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const [formData, setFormData] = useState({
    id: null,
    title: '',
    description: '',
    externalLink: '',
    imageUrl: '',
    status: 'published',
    order: 0
  });

  // --- 1. Google Drive Image Fix ---
  const getImageUrl = (url) => {
    if (!url || !url.includes("drive.google.com")) return url;
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      // High-quality direct rendering link
      return `http://googleusercontent.com/profile/picture/d/${match[1]}=s1000`;
    }
    return url;
  };

  // --- 2. Fetch All News ---
  const fetchNews = async () => {
    try {
      const res = await axios.get(CMS_API);
      // Backend returns raw array in res.data based on your controller
      const data = Array.isArray(res.data) ? res.data : res.data.data;
      setNewsList(data || []);
    } catch (err) {
      console.error("Fetch Error:", err);
      setNewsList([]);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // --- 3. Handle Create/Update (Upsert) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Prepare data with formatted image link
    const processedData = {
      ...formData,
      imageUrl: getImageUrl(formData.imageUrl)
    };

    try {
      await axios.post(`${CMS_API}/upsert`, processedData);
      resetForm();
      fetchNews();
    } catch (err) {
      console.error("Submit Error:", err);
      alert("Failed to save. Ensure backend is running on port 3000.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ id: null, title: '', description: '', externalLink: '', imageUrl: '', status: 'published', order: 0 });
    setIsEditing(false);
    setShowForm(false);
  };

  // --- 4. Handle Edit ---
  const handleEdit = (e, item) => {
    e.stopPropagation(); // Stop card from collapsing
    setFormData({
      id: item._id, // Map MongoDB _id to form id
      title: item.title,
      description: item.description,
      externalLink: item.externalLink,
      imageUrl: item.imageUrl,
      status: item.status,
      order: item.order
    });
    setIsEditing(true);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- 5. Handle Delete ---
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to permanently delete this news entry?")) {
      try {
        await axios.delete(`${CMS_API}/${id}`);
        // Optimistic UI update
        setNewsList((prev) => prev.filter((item) => item._id !== id));
        if (expandedId === id) setExpandedId(null);
      } catch (err) {
        alert("Delete failed.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20 font-helvetica text-[#292c44]">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#292c44] rounded-xl flex items-center justify-center text-white shadow-lg">
              <FiLayers size={20} />
            </div>
            <h1 className="text-xl font-poppins font-bold">News </h1>
          </div>
          <button
            onClick={() => { isEditing ? resetForm() : setShowForm(!showForm); }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-poppins font-bold text-sm transition-all ${
              showForm ? 'bg-gray-100 text-gray-500' : 'bg-[#292c44] text-white'
            }`}
          >
            {showForm ? <><FiX /> Close</> : <><FiPlus /> New News</>}
          </button>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 mt-10">
        {/* Editor Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl p-8 mb-12 overflow-hidden"
            >
              <h2 className="text-2xl font-poppins font-black mb-6">
                {isEditing ? '⚡ Update News details' : '✨ Draft a new story'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Headline</label>
                  <input 
                    className="w-full mt-1.5 px-5 py-4 bg-gray-50 border-none ring-1 ring-gray-200 rounded-2xl focus:ring-2 focus:ring-[#292c44] outline-none transition-all"
                    value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                  <textarea 
                    rows="4"
                    className="w-full mt-1.5 px-5 py-4 bg-gray-50 border-none ring-1 ring-gray-200 rounded-2xl focus:ring-2 focus:ring-[#292c44] outline-none transition-all"
                    value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input className="px-5 py-4 bg-gray-50 rounded-2xl outline-none ring-1 ring-gray-200" placeholder="News Source Link" value={formData.externalLink} onChange={(e) => setFormData({...formData, externalLink: e.target.value})} required />
                  <input className="px-5 py-4 bg-gray-50 rounded-2xl outline-none ring-1 ring-gray-200" placeholder="Image Link" value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <select className="px-5 py-4 bg-gray-50 rounded-2xl outline-none font-bold" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                    <option value="published">Status: Published</option>
                    <option value="draft">Status: Draft</option>
                  </select>
                  <input type="number" className="px-5 py-4 bg-gray-50 rounded-2xl outline-none font-bold" placeholder="Order" value={formData.order} onChange={(e) => setFormData({...formData, order: e.target.value})} />
                </div>
                <button type="submit" disabled={loading} className="w-full py-4 bg-[#292c44] text-white rounded-2xl font-poppins font-bold shadow-lg hover:opacity-90">
                  {loading ? "Syncing with Server..." : (isEditing ? "Update News Entry" : "Publish to News Feed")}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- News Feed --- */}
        <div className="space-y-6">
          <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-4 ml-2">Current Stream</h3>
          <AnimatePresence mode="popLayout">
            {newsList.map((item, index) => (
              <motion.div
                key={item._id}
                layout
                onClick={() => setExpandedId(expandedId === item._id ? null : item._id)}
                className={`bg-white border ${item.status === 'draft' ? 'border-dashed border-gray-300 opacity-80' : 'border-gray-100'} rounded-[2.5rem] p-6 cursor-pointer hover:shadow-xl transition-all duration-300`}
              >
                <div className="flex gap-6 items-center">
                  <img 
                    src={item.imageUrl} 
                    className="w-16 h-16 rounded-2xl object-cover bg-gray-50 shadow-inner" 
                    alt="" 
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Invalid+Image'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'published' ? 'bg-green-500' : 'bg-amber-400'}`} />
                      <span className="text-[10px] font-black uppercase text-gray-300 flex items-center gap-2">
                        {item.status} — Order: {item.order} {item.status === 'draft' ? <FiEyeOff /> : <FiEye />}
                      </span>
                    </div>
                    <h4 className="text-xl font-poppins font-bold leading-tight truncate">{item.title}</h4>
                  </div>
                  {expandedId === item._id ? <FiChevronUp className="text-gray-300"/> : <FiChevronDown className="text-gray-300"/>}
                </div>

                <AnimatePresence>
                  {expandedId === item._id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 pt-6 border-t border-gray-50"
                    >
                      <img src={item.imageUrl} className="w-full h-56 object-cover rounded-3xl mb-6 shadow-sm" alt="Preview" />
                      <p className="text-gray-500 leading-relaxed font-helvetica mb-8 whitespace-pre-wrap">
                        {item.description}
                      </p>
                      <div className="flex gap-3">
                        <button 
                          onClick={(e) => handleEdit(e, item)} 
                          className="flex-1 py-3 bg-gray-50 text-[#292c44] font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100"
                        >
                          <FiEdit3 /> Edit Content
                        </button>
                        <button 
                          onClick={(e) => handleDelete(e, item._id)} 
                          className="flex-1 py-3 bg-red-50 text-red-500 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-100"
                        >
                          <FiTrash2 /> Delete
                        </button>
                        <a 
                          href={item.externalLink} 
                          target="_blank" 
                          rel="noreferrer" 
                          onClick={(e) => e.stopPropagation()}
                          className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:text-[#292c44]"
                        >
                          <FiLink />
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default News;