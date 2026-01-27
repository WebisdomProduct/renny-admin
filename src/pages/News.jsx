import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, FiEdit3, FiTrash2, FiLink, FiX, FiLayers, 
  FiChevronDown, FiChevronUp, FiCalendar, FiUploadCloud 
} from 'react-icons/fi';

const News = () => {
  const CMS_API = "http://localhost:3000/cms/news";
  const UPLOAD_API = "http://localhost:3000/cms/upload/upload"; // Existing S3 Route

  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const [formData, setFormData] = useState({
    id: null, title: '', description: '', externalLink: '', 
    imageUrl: '', date: '', status: 'published', order: 0 
  });

  // NEW: Handle direct S3 upload for News Thumbnail
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append("file", file);
    setUploading(true);

    try {
      const res = await axios.post(UPLOAD_API, data);
      setFormData({ ...formData, imageUrl: res.data.fileUrl });
      alert("Thumbnail uploaded to S3!");
    } catch (err) {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const fetchNews = async () => {
    try {
      const res = await axios.get(CMS_API);
      setNewsList(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchNews(); }, []);

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  // Clone formData to avoid mutating state
  const payload = { ...formData };

  // CRITICAL: If you are NOT editing, delete the ID property.
  // This ensures the backend falls into the 'News.create' block.
  if (!isEditing || !payload.id) {
    delete payload.id; 
  }

  try {
    const res = await axios.post(`${CMS_API}/upsert`, payload);
    if (res.data.success) {
      alert("News published successfully!");
      resetForm();
      fetchNews();
    }
  } catch (err) {
    // This displays the "Title conflict" message from the backend
    alert(err.response?.data?.message || "Error syncing with Atlas");
  } finally {
    setLoading(false);
  }
};
  const resetForm = () => {
    setFormData({ id: null, title: '', description: '', externalLink: '', imageUrl: '', date: '', status: 'published', order: 0 });
    setIsEditing(false); setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20 font-helvetica text-[#292c44]">
      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#292c44] rounded-xl flex items-center justify-center text-white shadow-lg"><FiLayers size={20} /></div>
          <h1 className="text-xl font-bold">News</h1>
        </div>
        <button onClick={() => (showForm ? resetForm() : setShowForm(true))} className={`px-6 py-2.5 rounded-full font-bold transition-all ${showForm ? 'bg-gray-100 text-gray-500' : 'bg-[#292c44] text-white'}`}>
          {showForm ? 'Cancel' : 'Add News'}
        </button>
      </nav>

      <main className="max-w-3xl mx-auto px-6 mt-10">
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-white rounded-[2.5rem] shadow-2xl p-8 mb-12 border border-gray-100">
              <form onSubmit={handleSubmit} className="space-y-6">
                <input className="w-full px-5 py-4 bg-gray-50 rounded-2xl ring-1 ring-gray-200 outline-none focus:ring-2 focus:ring-[#292c44]" placeholder="Headline" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                <textarea rows="3" className="w-full px-5 py-4 bg-gray-50 rounded-2xl ring-1 ring-gray-200 outline-none focus:ring-2 focus:ring-[#292c44]" placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input className="px-5 py-4 bg-gray-50 rounded-2xl ring-1 ring-gray-200 outline-none" placeholder="External Link" value={formData.externalLink} onChange={e => setFormData({...formData, externalLink: e.target.value})} required />
                  
                  {/* S3 UPLOAD FIELD */}
                  <div className="relative group">
                    <input type="file" id="news-img" className="hidden" onChange={handleImageUpload} accept="image/*" />
                    <label htmlFor="news-img" className={`flex items-center justify-between px-5 py-4 bg-gray-50 rounded-2xl ring-1 ring-gray-200 cursor-pointer transition-all ${formData.imageUrl ? 'text-green-600' : 'text-gray-400'}`}>
                      <span className="truncate">{uploading ? "Uploading..." : formData.imageUrl ? "Thumbnail Ready" : "Upload Thumbnail"}</span>
                      <FiUploadCloud />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-bold">
                  <input type="date" className="p-4 bg-gray-50 rounded-2xl outline-none ring-1 ring-gray-200" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                  <select className="p-4 bg-gray-50 rounded-2xl outline-none" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                  <input type="number" className="p-4 bg-gray-50 rounded-2xl outline-none" placeholder="Sort Order" value={formData.order} onChange={e => setFormData({...formData, order: e.target.value})} />
                </div>

                <button type="submit" disabled={loading || uploading} className="w-full py-4 bg-[#292c44] text-white rounded-2xl font-bold shadow-lg disabled:bg-gray-300">
                  {loading ? "Saving..." : (isEditing ? "Update News" : "Publish News")}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* List View logic remains exactly the same as previous content */}
        <div className="space-y-4">
          {newsList.map((item) => (
            <div key={item._id} onClick={() => setExpandedId(expandedId === item._id ? null : item._id)} className="bg-white border border-gray-100 rounded-[2rem] p-5 cursor-pointer hover:shadow-md transition-all">
               <div className="flex gap-4 items-center">
                 <img src={item.imageUrl} className="w-12 h-12 rounded-xl object-cover bg-gray-50" alt="" />
                 <div className="flex-1">
                   <h4 className="font-bold text-sm leading-tight">{item.title}</h4>
                   <p className="text-[10px] text-gray-400 uppercase font-bold mt-1">{new Date(item.date).toLocaleDateString()} • Order: {item.order}</p>
                 </div>
                 {expandedId === item._id ? <FiChevronUp /> : <FiChevronDown />}
               </div>
               {expandedId === item._id && (
                 <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="mt-4 pt-4 border-t border-gray-50">
                   <p className="text-xs text-gray-500 leading-relaxed mb-4">{item.description}</p>
                   <div className="flex gap-2">
                     <button onClick={(e) => handleEdit(e, item)} className="flex-1 py-2 bg-gray-50 text-[10px] font-bold rounded-lg uppercase">Edit</button>
                     <button onClick={async (e) => { e.stopPropagation(); if(window.confirm("Delete?")) { await axios.delete(`${CMS_API}/${item._id}`); fetchNews(); } }} className="flex-1 py-2 bg-red-50 text-red-500 text-[10px] font-bold rounded-lg uppercase">Delete</button>
                   </div>
                 </motion.div>
               )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default News;