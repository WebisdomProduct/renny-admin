import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, FiEdit3, FiTrash2, FiVideo, FiUploadCloud, 
  FiX, FiPlay, FiEye, FiEyeOff, FiChevronDown, FiChevronUp, FiCalendar, FiLink 
} from 'react-icons/fi';

const EventsAdmin = () => {
  // API Configuration
  const CMS_API = "http://localhost:3000/cms/events";
  const UPLOAD_API = "http://localhost:3000/cms/upload/upload";

  // State Management
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // Resolved ReferenceError
  const [uploadMode, setUploadMode] = useState('file'); 
  const [expandedId, setExpandedId] = useState(null);

  const [formData, setFormData] = useState({
    id: null, 
    title: '', 
    date: '', 
    videoUrl: '', 
    type: 'file', 
    description: '', 
    status: 'published', 
    order: 0
  });

  // 1. FETCH: Get all events for admin view
  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${CMS_API}?role=admin`);
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

  // 2. UPLOAD: Direct S3 Video Upload
  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append("file", file);
    setUploading(true);

    try {
      const res = await axios.post(UPLOAD_API, data);
      setFormData(prev => ({ ...prev, videoUrl: res.data.fileUrl, type: 'file' }));
      alert("Video uploaded to S3 successfully!");
    } catch (err) {
      alert("S3 Upload Failed. Check file size and format.");
    } finally {
      setUploading(false);
    }
  };

  // 3. SUBMIT: Upsert logic with Atlas-compliant payload
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Create a clean payload to avoid 'id: null' issues in MongoDB Atlas
    const payload = { ...formData };
    if (!isEditing || !payload.id) {
      delete payload.id; // Forces backend to use Event.create()
    }

    try {
      await axios.post(`${CMS_API}/upsert`, payload);
      resetForm();
      fetchEvents();
      alert("Event synchronized successfully!");
    } catch (err) {
      console.error("Submission Error:", err.response?.data);
      alert("Error: " + (err.response?.data?.message || "Server error"));
    } finally {
      setLoading(false);
    }
  };

  // 4. DELETE: Remove record from database
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

  const handleEdit = (e, item) => {
    e.stopPropagation();
    setFormData({
      id: item._id,
      title: item.title,
      date: item.date,
      videoUrl: item.videoUrl,
      type: item.type || 'file',
      description: item.description,
      status: item.status,
      order: item.order
    });
    setIsEditing(true);
    setUploadMode(item.type || 'file');
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormData({ id: null, title: '', date: '', videoUrl: '', type: 'file', description: '', status: 'published', order: 0 });
    setIsEditing(false);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20 font-sans text-[#292c44]">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#292c44] rounded-xl flex items-center justify-center text-white shadow-lg">
              <FiVideo size={20} />
            </div>
            <h1 className="text-xl font-bold">Event Gallery</h1>
          </div>
          <button
            onClick={() => { isEditing ? resetForm() : setShowForm(!showForm); }}
            className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${
              showForm ? 'bg-gray-100 text-gray-500' : 'bg-[#292c44] text-white'
            }`}
          >
            {showForm ? 'Close' : 'Add Event Video'}
          </button>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 mt-10">
        {/* Form Section */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl p-8 mb-12"
            >
              <h2 className="text-2xl font-black mb-6 text-[#292c44]">
                {isEditing ? '⚡ Update Event' : '🎥 New Event Highlight'}
              </h2>

              <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
                <button type="button" onClick={() => setUploadMode('file')} className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 ${uploadMode === 'file' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}><FiUploadCloud /> S3 Video</button>
                <button type="button" onClick={() => setUploadMode('link')} className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 ${uploadMode === 'link' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}><FiLink /> Video Link</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <input 
                  className="w-full px-5 py-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-[#292c44]"
                  placeholder="Event Title"
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})} required
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input className="px-5 py-4 bg-gray-50 border rounded-2xl outline-none" placeholder="Date (e.g. Dec 2024)" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required />
                  
                  {uploadMode === 'file' ? (
                    <label className={`flex items-center justify-between px-5 py-4 bg-gray-50 border rounded-2xl cursor-pointer ${formData.videoUrl && formData.type === 'file' ? 'text-green-600 border-green-200' : 'text-gray-400'}`}>
                      <input type="file" className="hidden" accept="video/*" onChange={handleVideoUpload} />
                      <span className="truncate">{uploading ? "Uploading..." : formData.videoUrl ? "Video Ready" : "Upload Video to S3"}</span>
                      <FiUploadCloud />
                    </label>
                  ) : (
                    <input className="px-5 py-4 bg-gray-50 border rounded-2xl outline-none" placeholder="Video URL" value={formData.videoUrl} onChange={(e) => setFormData({...formData, videoUrl: e.target.value, type: 'link'})} required />
                  )}
                </div>

                <textarea 
                  rows="3"
                  className="w-full px-5 py-4 bg-gray-50 border rounded-2xl outline-none"
                  placeholder="Event Description"
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} required
                />

                <div className="grid grid-cols-2 gap-4">
                  <select className="px-5 py-4 bg-gray-50 rounded-2xl font-bold outline-none border" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                    <option value="published">Status: Published</option>
                    <option value="draft">Status: Draft</option>
                  </select>
                  <input type="number" className="px-5 py-4 bg-gray-50 rounded-2xl outline-none font-bold border" placeholder="Order" value={formData.order} onChange={(e) => setFormData({...formData, order: Number(e.target.value)})} />
                </div>

                <button type="submit" disabled={loading || uploading} className="w-full py-4 bg-[#292c44] text-white rounded-2xl font-bold shadow-lg disabled:bg-gray-300">
                  {loading ? "Saving..." : (isEditing ? "Update Event" : "Add to Gallery")}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Inventory List */}
        <div className="space-y-6">
          <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-2">Video Inventory</h3>
          {events.map((item) => (
            <div key={item._id} onClick={() => setExpandedId(expandedId === item._id ? null : item._id)} className={`bg-white border rounded-[2.5rem] p-6 cursor-pointer hover:shadow-lg transition-all ${item.status === 'draft' ? 'border-dashed border-gray-300' : 'border-gray-100'}`}>
               <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center text-white relative overflow-hidden">
                    <FiPlay size={14} className="z-10" />
                    {item.type === 'file' && <video src={item.videoUrl} className="absolute inset-0 w-full h-full object-cover opacity-40" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800">{item.title}</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{item.status} • {item.date}</p>
                  </div>
                  {expandedId === item._id ? <FiChevronUp /> : <FiChevronDown />}
               </div>
               
               <AnimatePresence>
                 {expandedId === item._id && (
                   <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-6 pt-6 border-t border-gray-50 overflow-hidden">
                      <video src={item.videoUrl} controls className="w-full rounded-2xl bg-black aspect-video mb-4 shadow-inner" />
                      <p className="text-sm text-gray-500 mb-6 leading-relaxed">{item.description}</p>
                      <div className="flex gap-2">
                         <button onClick={(e) => handleEdit(e, item)} className="flex-1 py-2 bg-gray-50 text-blue-600 text-[11px] font-bold rounded-lg uppercase hover:bg-blue-50">Edit</button>
                         <button onClick={(e) => handleDelete(e, item._id)} className="flex-1 py-2 bg-red-50 text-red-500 text-[11px] font-bold rounded-lg uppercase hover:bg-red-100">Delete</button>
                      </div>
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default EventsAdmin;