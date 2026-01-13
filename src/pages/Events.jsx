import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, FiEdit3, FiTrash2, FiVideo, FiCheck, 
  FiX, FiPlay, FiEye, FiEyeOff, FiChevronDown, FiChevronUp, FiCalendar 
} from 'react-icons/fi';

const EventsAdmin = () => {
  const CMS_API = "http://localhost:3000/cms/events"; // Ensure this matches your route path

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const [formData, setFormData] = useState({
    id: null,
    title: '',
    date: '',
    videoUrl: '',
    description: '',
    status: 'published',
    order: 0
  });

  /// Inside EventsAdmin.jsx
const fetchEvents = async () => {
  try {
    // We explicitly add ?role=admin here to see EVERYTHING
    const res = await axios.get(`http://localhost:3000/cms/events?role=admin`);
    
    if (res.data.success) {
      setEvents(res.data.data);
    }
  } catch (err) {
    console.error("Admin Fetch Error:", err);
  }
};  

  useEffect(() => {
    fetchEvents();
  }, []);

  // --- Submit Handler ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${CMS_API}/upsert`, formData);
      resetForm();
      fetchEvents();
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || "Server error"));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ id: null, title: '', date: '', videoUrl: '', description: '', status: 'published', order: 0 });
    setIsEditing(false);
    setShowForm(false);
  };

  const handleEdit = (e, item) => {
    e.stopPropagation();
    setFormData({
      id: item._id,
      title: item.title,
      date: item.date,
      videoUrl: item.videoUrl,
      description: item.description,
      status: item.status,
      order: item.order
    });
    setIsEditing(true);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Delete this event video permanently?")) {
      try {
        await axios.delete(`${CMS_API}/${id}`);
        setEvents(prev => prev.filter(ev => ev._id !== id));
        if (expandedId === id) setExpandedId(null);
      } catch (err) {
        alert("Delete failed");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20 font-helvetica text-[#292c44]">
      {/* Navigation */}
      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#292c44] rounded-xl flex items-center justify-center text-white shadow-lg">
              <FiVideo size={20} />
            </div>
            <h1 className="text-xl font-poppins font-bold">Event Gallery</h1>
          </div>
          <button
            onClick={() => { isEditing ? resetForm() : setShowForm(!showForm); }}
            className={`px-6 py-2.5 rounded-full font-poppins font-bold text-sm transition-all ${
              showForm ? 'bg-gray-100 text-gray-500' : 'bg-[#292c44] text-white'
            }`}
          >
            {showForm ? 'Close' : 'Add Event Video'}
          </button>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 mt-10">
        {/* Upsert Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl p-8 mb-12"
            >
              <h2 className="text-2xl font-poppins font-black mb-6 text-[#292c44]">
                {isEditing ? '⚡ Update Event' : '🎥 New Event Highlight'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Event Title</label>
                  <input 
                    className="w-full mt-1.5 px-5 py-4 bg-gray-50 border-none ring-1 ring-gray-100 rounded-2xl focus:ring-2 focus:ring-[#292c44] outline-none transition-all"
                    value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Date Display</label>
                    <input className="w-full mt-1 px-5 py-4 bg-gray-50 border-none ring-1 ring-gray-100 rounded-2xl focus:ring-2 focus:ring-[#292c44] outline-none" placeholder="e.g. Dec 2024" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Video Source URL (.mp4)</label>
                    <input className="w-full mt-1 px-5 py-4 bg-gray-50 border-none ring-1 ring-gray-100 rounded-2xl focus:ring-2 focus:ring-[#292c44] outline-none" value={formData.videoUrl} onChange={(e) => setFormData({...formData, videoUrl: e.target.value})} required />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Event Description</label>
                  <textarea 
                    rows="3"
                    className="w-full mt-1.5 px-5 py-4 bg-gray-50 border-none ring-1 ring-gray-100 rounded-2xl focus:ring-2 focus:ring-[#292c44] outline-none transition-all"
                    value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <select className="px-5 py-4 bg-gray-50 rounded-2xl outline-none font-bold" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                    <option value="published">Status: Published</option>
                    <option value="draft">Status: Draft</option>
                  </select>
                  <input type="number" className="px-5 py-4 bg-gray-50 rounded-2xl outline-none font-bold" placeholder="Order" value={formData.order} onChange={(e) => setFormData({...formData, order: Number(e.target.value)})} />
                </div>

                <button type="submit" disabled={loading} className="w-full py-4 bg-[#292c44] text-white rounded-2xl font-poppins font-bold shadow-lg shadow-blue-900/10">
                  {loading ? "Uploading..." : (isEditing ? "Update Event" : "Add to Gallery")}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- Event Inventory --- */}
        <div className="space-y-6">
          <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-4 ml-2">Video Inventory</h3>
          <AnimatePresence mode="popLayout">
            {events.map((item) => (
              <motion.div
                key={item._id}
                layout
                onClick={() => setExpandedId(expandedId === item._id ? null : item._id)}
                className={`bg-white border ${item.status === 'draft' ? 'border-dashed border-gray-300' : 'border-gray-100'} rounded-[2.5rem] p-6 cursor-pointer hover:shadow-xl transition-all duration-300 group`}
              >
                <div className="flex gap-6 items-center">
                  <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center text-white relative overflow-hidden">
                    <FiPlay className="z-10" />
                    <video src={item.videoUrl} className="absolute inset-0 w-full h-full object-cover opacity-50" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'published' ? 'bg-green-500' : 'bg-amber-400'}`} />
                      <span className="text-[10px] font-black uppercase text-gray-300 flex items-center gap-2">
                        {item.status} — {item.date} {item.status === 'draft' ? <FiEyeOff /> : <FiEye />}
                      </span>
                    </div>
                    <h4 className="text-xl font-poppins font-bold truncate tracking-tight">{item.title}</h4>
                  </div>
                  {expandedId === item._id ? <FiChevronUp /> : <FiChevronDown />}
                </div>

                <AnimatePresence>
                  {expandedId === item._id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 pt-6 border-t border-gray-50"
                    >
                      <div className="relative aspect-video bg-black rounded-3xl overflow-hidden mb-6 shadow-lg">
                        <video 
                          src={item.videoUrl} 
                          controls 
                          className="w-full h-full object-contain"
                          poster="/api/placeholder/800/450" 
                        />
                      </div>
                      <div className="px-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-4">
                           <FiCalendar /> <span>LAST UPDATED: {new Date(item.updatedAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-gray-500 leading-relaxed font-helvetica mb-8 whitespace-pre-wrap">
                          {item.description}
                        </p>
                        <div className="flex gap-3">
                          <button 
                            onClick={(e) => handleEdit(e, item)} 
                            className="flex-1 py-3 bg-gray-50 text-[#292c44] font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100"
                          >
                            <FiEdit3 /> Edit Details
                          </button>
                          <button 
                            onClick={(e) => handleDelete(e, item._id)} 
                            className="flex-1 py-3 bg-red-50 text-red-500 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-100"
                          >
                            <FiTrash2 /> Delete
                          </button>
                        </div>
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

export default EventsAdmin;