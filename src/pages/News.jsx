import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, FiEdit3, FiTrash2, FiLink, FiCheck, 
  FiX, FiLayers, FiEye, FiEyeOff, FiChevronDown, FiChevronUp, FiCalendar 
} from 'react-icons/fi';

const News = () => {
  const CMS_API = "http://localhost:3000/cms/news";

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
    date: '', // Added Date Field
    status: 'published',
    order: 0
  });

  const getImageUrl = (url) => {
    if (!url || !url.includes("drive.google.com")) return url;
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `http://googleusercontent.com/profile/picture/d/${match[1]}=s1000`;
    }
    return url;
  };

  const fetchNews = async () => {
    try {
      const res = await axios.get(CMS_API);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const processedData = {
      ...formData,
      imageUrl: getImageUrl(formData.imageUrl),
      // If date is empty string, let backend default to Date.now()
      date: formData.date || undefined 
    };

    try {
      await axios.post(`${CMS_API}/upsert`, processedData);
      resetForm();
      fetchNews();
    } catch (err) {
      console.error("Submit Error:", err);
      alert("Failed to save.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ 
      id: null, title: '', description: '', externalLink: '', 
      imageUrl: '', date: '', status: 'published', order: 0 
    });
    setIsEditing(false);
    setShowForm(false);
  };

  const handleEdit = (e, item) => {
    e.stopPropagation();
    setFormData({
      id: item._id,
      title: item.title,
      description: item.description,
      externalLink: item.externalLink,
      imageUrl: item.imageUrl,
      // Format date for the HTML input field (YYYY-MM-DD)
      date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
      status: item.status,
      order: item.order
    });
    setIsEditing(true);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to permanently delete this news entry?")) {
      try {
        await axios.delete(`${CMS_API}/${id}`);
        setNewsList((prev) => prev.filter((item) => item._id !== id));
        if (expandedId === id) setExpandedId(null);
      } catch (err) {
        alert("Delete failed.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20 font-helvetica text-[#292c44]">
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
                   <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">External News Link</label>
                    <input className="w-full mt-1 px-5 py-4 bg-gray-50 rounded-2xl outline-none ring-1 ring-gray-200" placeholder="Source URL" value={formData.externalLink} onChange={(e) => setFormData({...formData, externalLink: e.target.value})} required />
                   </div>
                   <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Thumbnail Image URL</label>
                    <input className="w-full mt-1 px-5 py-4 bg-gray-50 rounded-2xl outline-none ring-1 ring-gray-200" placeholder="Image URL" value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} required />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Publish Date</label>
                    <input 
                      type="date" 
                      className="w-full mt-1 px-5 py-4 bg-gray-50 rounded-2xl outline-none ring-1 ring-gray-200 font-bold" 
                      value={formData.date} 
                      onChange={(e) => setFormData({...formData, date: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Status</label>
                    <select className="w-full mt-1 px-5 py-4 bg-gray-50 rounded-2xl outline-none font-bold" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sort Order</label>
                    <input type="number" className="w-full mt-1 px-5 py-4 bg-gray-50 rounded-2xl outline-none font-bold" placeholder="Order" value={formData.order} onChange={(e) => setFormData({...formData, order: e.target.value})} />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="w-full py-4 bg-[#292c44] text-white rounded-2xl font-poppins font-bold shadow-lg hover:opacity-90">
                  {loading ? "Syncing with Server..." : (isEditing ? "Update News Entry" : "Publish to News Feed")}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-6">
          <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-4 ml-2">Current Stream</h3>
          <AnimatePresence mode="popLayout">
            {newsList.map((item) => (
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
                        {item.status} — {new Date(item.date).toLocaleDateString()} — Order: {item.order}
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
                      <div className="mb-4 flex items-center gap-2 text-gray-400">
                         <FiCalendar size={14}/>
                         <span className="text-xs font-bold uppercase tracking-widest">Article Date: {new Date(item.date).toDateString()}</span>
                      </div>
                      <p className="text-gray-500 leading-relaxed font-helvetica mb-8 whitespace-pre-wrap">
                        {item.description}
                      </p>
                      <div className="flex gap-3">
                        <button 
                          onClick={(e) => handleEdit(e, item)} 
                          className="flex-1 py-3 bg-gray-50 text-[#292c44] font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100"
                        >
                          <FiEdit3 /> Edit
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