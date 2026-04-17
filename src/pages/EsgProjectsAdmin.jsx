import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGlobe, FiUploadCloud, FiChevronDown, FiChevronUp, FiImage, FiPlus, FiTrash2, FiEdit3, FiX } from 'react-icons/fi';
import { API } from '../config/api';
import { notifySuccess, notifyError } from "../utils/notifications";




const EsgProjectsAdmin = () => {
  const CMS_API = API.CMS_ESG_PROJECTS;
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
    img: '',
    content: '',
    pointsTitle: '',
    points: [''],
    order: 0
  });

  const fetchItems = useCallback(async () => {
    try {
      const res = await axios.get(CMS_API);
      setItems(res.data.data || res.data || []);
    } catch { notifyError("Unable to complete the request."); }
  }, [CMS_API]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleMediaUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append("file", file);
    setUploading(true);

    try {
      const res = await axios.post(UPLOAD_API, data);
      setFormData(prev => ({ ...prev, img: res.data.fileUrl }));
      notifySuccess("Image uploaded successfully!");
    } catch {
      notifyError("Upload Failed.");
    } finally {
      setUploading(false);
    }
  };

  const handlePointChange = (index, value) => {
    const newPoints = [...formData.points];
    newPoints[index] = value;
    setFormData({ ...formData, points: newPoints });
  };

  const addPoint = () => {
    setFormData({ ...formData, points: [...formData.points, ''] });
  };

  const removePoint = (index) => {
    if (formData.points.length > 1) {
      const newPoints = formData.points.filter((_, i) => i !== index);
      setFormData({ ...formData, points: newPoints });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = { 
      ...formData, 
      points: formData.points.filter(p => p.trim() !== '') 
    };
    if (!isEditing || !payload.id) delete payload.id;

    try {
      if (isEditing && formData.id) {
        await axios.put(`${CMS_API}/${formData.id}`, payload);
      } else {
        await axios.post(CMS_API, payload);
      }
      resetForm();
      fetchItems();
      notifySuccess("ESG Project saved successfully!");
    } catch (err) {
      notifyError("Error: " + (err.response?.data?.message || "Server error"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Delete this ESG Project permanently?")) {
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
      img: item.img || item.image || '',
      content: item.content || item.description || '',
      pointsTitle: item.pointsTitle || '',
      points: item.points && item.points.length > 0 ? item.points : (item.infrastructure || ['']),
      order: item.order || 0
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ id: null, title: '', img: '', content: '', pointsTitle: '', points: [''], order: 0 });
    setIsEditing(false);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20 font-sans text-[#292c44]">
      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#292c44] rounded-xl flex items-center justify-center text-white shadow-lg">
              <FiGlobe size={20} />
            </div>
            <h1 className="text-xl font-bold">ESG Projects</h1>
          </div>
          <button
            onClick={() => { resetForm(); setIsEditing(false); setShowForm(true); }}
            className="px-6 py-2.5 rounded-full font-bold text-sm bg-[#292c44] text-white transition-all hover:opacity-90"
          >
            Add Project
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={resetForm}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-[#292c44]">{isEditing ? '⚡ Update Project' : '🌱 New ESG Project'}</h2>
                <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-full transition-all"><FiX size={22}/></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Project Title</label>
                    <input className="px-5 py-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-[#292c44]" placeholder="e.g., Rainwater Harvesting" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Display Priority (Order)</label>
                    <input type="number" className="px-5 py-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-[#292c44]" placeholder="0" value={formData.order} onChange={(e) => setFormData({...formData, order: Number(e.target.value)})} />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Showcase Image</label>
                  <label className={`flex items-center justify-between px-5 py-4 bg-gray-50 border rounded-2xl cursor-pointer ${formData.img ? 'text-green-600 border-green-200' : 'text-gray-400'}`}>
                    <input type="file" className="hidden" accept="image/*" onChange={handleMediaUpload} />
                    <span className="truncate">{uploading ? "Uploading..." : formData.img ? "Image Ready" : "Upload Image to S3"}</span>
                    <FiUploadCloud />
                  </label>
                  <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wide ml-1">⚠ Note: Please upload images in <span className="text-orange-500">WebP</span> format only</p>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Initiative Details</label>
                  <textarea rows="4" className="w-full px-5 py-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-[#292c44]" placeholder="Describe the project..." value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} required />
                </div>
                <div className="bg-gray-50/50 p-4 rounded-[2rem] border border-gray-50 space-y-3">
                  <input className="bg-transparent border-none outline-none font-bold text-sm text-[#292c44] placeholder-gray-300 w-full" placeholder="Points Section Label (e.g., Infrastructure)" value={formData.pointsTitle} onChange={(e) => setFormData({...formData, pointsTitle: e.target.value})} />
                  {formData.points.map((point, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input className="flex-1 px-5 py-3 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#292c44] text-sm" placeholder={`Point ${idx+1}`} value={point} onChange={(e) => handlePointChange(idx, e.target.value)} />
                      <button type="button" onClick={() => removePoint(idx)} disabled={formData.points.length === 1} className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 disabled:opacity-50"><FiTrash2 /></button>
                    </div>
                  ))}
                  <button type="button" onClick={addPoint} className="flex w-full items-center justify-center gap-2 py-3 bg-white border-2 border-dashed border-gray-100 text-gray-400 font-bold rounded-2xl hover:border-blue-400 hover:text-blue-500"><FiPlus /> New List Item</button>
                </div>
                <button type="submit" disabled={loading || uploading} className="w-full py-4 bg-[#292c44] text-white rounded-2xl font-bold shadow-lg disabled:bg-gray-300">
                  {loading ? "Processing..." : (isEditing ? "Update Project" : "Save Project")}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-3xl mx-auto px-6 mt-10">

        <div className="space-y-6">
          <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-2">Projects Inventory</h3>
          {items.sort((a,b) => a.order - b.order).map((item) => (
            <div key={item._id} onClick={() => setExpandedId(expandedId === item._id ? null : item._id)} className="bg-white border border-gray-100 rounded-[2.5rem] p-6 cursor-pointer hover:shadow-lg transition-all">
               <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center text-white relative overflow-hidden shrink-0">
                    <FiImage size={14} className="z-10" />
                    {(item.img || item.image) && <img src={item.img || item.image} className="absolute inset-0 w-full h-full object-cover opacity-40" alt="" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800">{item.title}</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase whitespace-pre-wrap">{item.content || item.description}</p>
                  </div>
                  <div className="text-[10px] bg-gray-100 px-3 py-1 rounded-full font-bold text-gray-400">#{item.order}</div>
                  {expandedId === item._id ? <FiChevronUp /> : <FiChevronDown />}
               </div>
               
               <AnimatePresence>
                 {expandedId === item._id && (
                   <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-6 pt-6 border-t border-gray-50 overflow-hidden">
                      {(item.img || item.image) && <img src={item.img || item.image} alt="ESG" className="w-full rounded-2xl bg-gray-100 aspect-video object-cover mb-4 shadow-inner" />}
                      <div className="space-y-4">
                        <div>
                          <label className="text-[10px] font-black uppercase text-gray-300 tracking-tighter">Vision & Mission</label>
                          <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-wrap">{item.content || item.description}</p>
                        </div>
                        
                        {(item.points?.length > 0 || item.infrastructure?.length > 0) && (
                          <div>
                            <label className="text-[10px] font-black uppercase text-gray-300 tracking-tighter">{item.pointsTitle || "Details"}</label>
                            <ul className="mt-2 space-y-2">
                              {(item.points || item.infrastructure || []).map((p, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl">
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                                  {p}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 mt-8">
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

export default EsgProjectsAdmin;
