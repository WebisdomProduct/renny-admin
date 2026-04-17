import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSettings, FiUploadCloud, FiChevronDown, FiChevronUp, FiImage } from 'react-icons/fi';
import { API } from '../config/api';
import { notifySuccess, notifyError } from "../utils/notifications";




const UnitsAdmin = () => {
  const CMS_API = API.CMS_UNITS;
  const UPLOAD_API = API.UPLOAD;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const [formData, setFormData] = useState({
    id: null,
    title: '',
    image: '',
    address: '',
    order: 0
  });

  const fetchItems = async () => {
    try {
      const res = await axios.get(CMS_API);
      setItems(res.data.data || res.data || []);
    } catch { notifyError("Unable to complete the request."); }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleMediaUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append("file", file);
    setUploading(true);

    try {
      const res = await axios.post(UPLOAD_API, data);
      setFormData(prev => ({ ...prev, image: res.data.fileUrl }));
      notifySuccess("Image uploaded to S3 successfully!");
    } catch {
      notifyError("S3 Upload Failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = { ...formData };
    if (!isEditing || !payload.id) delete payload.id;

    try {
      if (isEditing && formData.id) {
        await axios.put(`${CMS_API}/${formData.id}`, payload);
      } else {
        await axios.post(CMS_API, payload);
      }
      resetForm();
      fetchItems();
      notifySuccess("Unit entry synchronized successfully!");
    } catch (err) {
      notifyError("Error: " + (err.response?.data?.message || "Server error"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Delete this unit entry permanently?")) {
      try {
        await axios.delete(`${CMS_API}/${id}`);
        setItems(prev => prev.filter(item => item._id !== id));
        if (expandedId === id) setExpandedId(null);
      } catch {
        notifyError("Delete failed");
      }
    }
  };

  const handleEdit = (e, item) => {
    e.stopPropagation();
    setFormData({
      id: item._id,
      title: item.title,
      image: item.image,
      address: item.address,
      order: item.order || 0
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ id: null, title: '', image: '', address: '', order: 0 });
    setIsEditing(false);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20 font-sans text-[#292c44]">
      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#292c44] rounded-xl flex items-center justify-center text-white shadow-lg">
              <FiSettings size={20} />
            </div>
            <h1 className="text-xl font-bold">Manufacturing Units</h1>
          </div>
          <button
            onClick={() => { resetForm(); setIsEditing(false); setShowForm(true); }}
            className="px-6 py-2.5 rounded-full font-bold text-sm bg-[#292c44] text-white transition-all hover:opacity-90"
          >
            Add Unit
          </button>
        </div>
      </nav>

      {/* Modal Overlay */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={resetForm}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-[#292c44]">
                  {isEditing ? '⚡ Update Unit' : '🏭 New Unit'}
                </h2>
                <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-full transition-all"><FiX size={22}/></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    className="px-5 py-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-[#292c44]"
                    placeholder="Unit Title"
                    value={formData.title} 
                    onChange={(e) => setFormData({...formData, title: e.target.value})} required
                  />
                  <input 
                    type="number"
                    className="px-5 py-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-[#292c44]"
                    placeholder="Order Index"
                    value={formData.order} 
                    onChange={(e) => setFormData({...formData, order: Number(e.target.value)})}
                  />
                </div>
                <label className={`flex items-center justify-between px-5 py-4 bg-gray-50 border rounded-2xl cursor-pointer ${formData.image ? 'text-green-600 border-green-200' : 'text-gray-400'}`}>
                  <input type="file" className="hidden" accept="image/*" onChange={handleMediaUpload} />
                  <span className="truncate">{uploading ? "Uploading..." : formData.image ? "Image Ready" : "Select Image to Upload"}</span>
                  <FiUploadCloud />
                </label>
                <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wide ml-1">⚠ Note: Please upload images in <span className="text-orange-500">WebP</span> format only</p>
                <textarea 
                  rows="3"
                  className="w-full px-5 py-4 bg-gray-50 border rounded-2xl outline-none"
                  placeholder="Address"
                  value={formData.address} 
                  onChange={(e) => setFormData({...formData, address: e.target.value})} required
                />
                <button type="submit" disabled={loading || uploading} className="w-full py-4 bg-[#292c44] text-white rounded-2xl font-bold shadow-lg disabled:bg-gray-300">
                  {loading ? "Saving..." : (isEditing ? "Update Unit" : "Add Unit")}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-3xl mx-auto px-6 mt-10">

        <div className="space-y-6">
          <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-2">Units Inventory</h3>
          {items.sort((a,b) => a.order - b.order).map((item) => (
            <div key={item._id} onClick={() => setExpandedId(expandedId === item._id ? null : item._id)} className="bg-white border border-gray-100 rounded-[2.5rem] p-6 cursor-pointer hover:shadow-lg transition-all">
               <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center text-white relative overflow-hidden">
                    <FiImage size={14} className="z-10" />
                    {item.image && <img src={item.image} className="absolute inset-0 w-full h-full object-cover opacity-40" alt="" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800">{item.title}</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase whitespace-pre-wrap break-words">
                      {item.address}
                    </p>
                  </div>
                  {expandedId === item._id ? <FiChevronUp /> : <FiChevronDown />}
               </div>
               
               <AnimatePresence>
                 {expandedId === item._id && (
                   <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-6 pt-6 border-t border-gray-50 overflow-hidden">
                      {item.image && <img src={item.image} alt="Unit" className="w-full rounded-2xl bg-gray-100 aspect-video object-cover mb-4 shadow-inner" />}
                      <p className="text-sm text-gray-500 mb-6 leading-relaxed whitespace-pre-wrap break-words">
                        {item.address}
                      </p>
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

export default UnitsAdmin;
