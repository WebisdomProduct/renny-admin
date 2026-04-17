import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUploadCloud, FiChevronDown, FiChevronUp, FiImage, FiSettings, FiX } from 'react-icons/fi';
import { API } from '../config/api';
import { notifySuccess, notifyError } from "../utils/notifications";




const ScaffoldingAdmin = () => {
  const CMS_API = API.CMS_SCAFFOLDING;
  const UPLOAD_API = API.UPLOAD;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [activeTab, setActiveTab] = useState('Page 1');

  const [formData, setFormData] = useState({
    id: null,
    title: '',
    description: '',
    application: '',
    image: '',
    image: '',
    sectionType: 'Page 1 Carousel', // A combined indicator
    order: 0
  });

  // Configurations for each section
  const sectionConfigs = [
    { id: 'Page 1 Carousel', label: 'Page 1: Carousel', page: 'Page 1', section: 'Carousel', showApp: false, maxItems: 99 },
    { id: 'Scaffolding System', label: 'Page 1: Scaffolding Systems (Left/Right Grid)', page: 'Page 1', section: 'Scaffolding System', showApp: true, maxItems: 99 },
    { id: 'Formwork Panel', label: 'Page 1: Formwork Panel', page: 'Page 1', section: 'Formwork Panel', showApp: true, maxItems: 1 },
    { id: 'Props & Shoring Systems', label: 'Page 1: Props & Shoring Systems', page: 'Page 1', section: 'Props & Shoring Systems', showApp: true, maxItems: 1 },
    { id: 'Page 2 Carousel', label: 'Page 2: Carousel', page: 'Page 2', section: 'Carousel', showApp: false, maxItems: 99 },
    { id: 'Product List', label: 'Page 2: All Products List', page: 'Page 2', section: 'Product List', showApp: true, maxItems: 99 }
  ];

  const currentConfig = sectionConfigs.find(c => c.id === formData.sectionType) || sectionConfigs[0];

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
      notifySuccess("Image uploaded successfully!");
    } catch {
      notifyError("Upload Failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = { ...formData, page: currentConfig.page, section: currentConfig.section };
    delete payload.sectionType;
    if (!isEditing || !payload.id) delete payload.id;

    try {
      if (isEditing && formData.id) {
        await axios.put(`${CMS_API}/${formData.id}`, payload);
      } else {
        await axios.post(CMS_API, payload);
      }
      resetForm();
      fetchItems();
      notifySuccess("Scaffolding product successfully saved!");
    } catch (err) {
      notifyError("Error: " + (err.response?.data?.message || "Server error"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Delete this product permanently?")) {
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
      description: item.description || '',
      application: item.application || '',
      image: item.image,
      sectionType: sectionConfigs.find(c => c.page === item.page && c.section === item.section)?.id || 'Page 1 Carousel',
      order: item.order || 0
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData(prev => ({ id: null, title: '', description: '', application: '', image: '', sectionType: prev.sectionType, order: prev.order + 1 }));
    setIsEditing(false);
  };
  
  const handleAddNew = (sectionId) => {
    setFormData({ id: null, title: '', description: '', application: '', image: '', sectionType: sectionId, order: 0 });
    setIsEditing(false);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20 font-sans text-[#292c44]">
      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#292c44] rounded-xl flex items-center justify-center text-white shadow-lg">
              <FiSettings size={20} />
            </div>
            <h1 className="text-xl font-bold">Scaffolding Products Admin</h1>
          </div>
          {showForm && (
            <button
              onClick={() => setShowForm(false)}
              className="px-6 py-2.5 rounded-full font-bold text-sm transition-all bg-gray-100 text-gray-500 hover:bg-gray-200"
            >
              Close Form
            </button>
          )}
        </div>
      </nav>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowForm(false)}
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
                  {isEditing ? `⚡ Update: ${currentConfig.label}` : `🔨 Add to: ${currentConfig.label}`}
                </h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all"><FiX size={22}/></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input className="px-5 py-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-[#292c44]" placeholder="Product Title (e.g. Couplers)" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
                  <input type="number" className="px-5 py-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-[#292c44]" placeholder="Order Index" value={formData.order} onChange={(e) => setFormData({...formData, order: Number(e.target.value)})} />
                </div>
                <label className={`flex items-center justify-between px-5 py-4 bg-gray-50 border rounded-2xl cursor-pointer ${formData.image ? 'text-green-600 border-green-200' : 'text-gray-400'}`}>
                  <input type="file" className="hidden" accept="image/*" onChange={handleMediaUpload} />
                  <span className="truncate">{uploading ? "Uploading..." : formData.image ? "Image Ready" : "Upload Product Photo"}</span>
                  <FiUploadCloud />
                </label>
                <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wide ml-1">⚠ Note: Please upload images in <span className="text-orange-500">WebP</span> format only</p>
                <textarea rows="3" className="w-full px-5 py-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-[#292c44]" placeholder="Product Description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                {currentConfig.showApp && (
                  <textarea rows="3" className="w-full px-5 py-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-[#292c44]" placeholder="Product Application" value={formData.application} onChange={(e) => setFormData({...formData, application: e.target.value})} />
                )}
                <button type="submit" disabled={loading || uploading} className="w-full py-4 bg-[#292c44] text-white rounded-2xl font-bold shadow-lg disabled:bg-gray-300">
                  {loading ? "Saving..." : (isEditing ? "Update Product" : "Add Product")}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-4xl mx-auto px-6 mt-10">

        <div className="flex bg-white rounded-2xl p-1 mb-8 shadow-sm border border-gray-100 w-fit">
          <p className="px-6 py-3 font-bold text-gray-500 text-sm">Organized exactly to match frontend flow.</p>
        </div>

        <div className="space-y-12">
          {sectionConfigs.map(config => {
             const sectionItems = items.filter(i => i.page === config.page && i.section === config.section).sort((a,b) => a.order - b.order);

             return (
               <div key={config.id} className="space-y-4">
                 <div className="flex items-center justify-between pb-2 border-b-2 border-gray-100">
                    <h3 className="text-sm font-black text-[#292c44] uppercase tracking-widest ml-2 inline-block">
                       {config.label}
                    </h3>
                    <div className="flex gap-2 items-center">
                       <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">
                          {sectionItems.length} {config.maxItems === 1 ? ' / 1' : ''}
                       </span>
                       <button onClick={() => handleAddNew(config.id)} className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-blue-100 transition-colors">
                         + Add to {config.id}
                       </button>
                    </div>
                 </div>
                 {sectionItems.length > 0 ? sectionItems.map((item) => (
                    <div key={item._id} onClick={() => setExpandedId(expandedId === item._id ? null : item._id)} className="bg-white border border-gray-100 rounded-[2.5rem] p-6 cursor-pointer hover:shadow-lg transition-all">
                       <div className="flex gap-4 items-center">
                          <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 relative overflow-hidden shrink-0 border border-gray-200">
                            <FiImage size={24} className="z-10" />
                            {item.image && <img src={item.image} className="absolute inset-0 w-full h-full object-cover opacity-80" alt="" />}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-800 text-lg">{item.title}</h4>
                          </div>
                          {expandedId === item._id ? <FiChevronUp size={20} className="text-gray-400" /> : <FiChevronDown size={20} className="text-gray-400" />}
                       </div>
                       
                       <AnimatePresence>
                         {expandedId === item._id && (
                           <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-6 pt-6 border-t border-gray-50 overflow-hidden">
                              <div className="space-y-4 mb-6">
                                <div>
                                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Description</p>
                                  <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                                </div>
                                {config.showApp && (
                                  <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Application</p>
                                    <p className="text-sm text-gray-600 leading-relaxed italic">{item.application}</p>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex gap-2">
                                 <button onClick={(e) => handleEdit(e, item)} className="flex-1 py-2 bg-gray-50 text-blue-600 text-[11px] font-bold rounded-lg uppercase hover:bg-blue-50">Edit</button>
                                 <button onClick={(e) => handleDelete(e, item._id)} className="flex-1 py-2 bg-red-50 text-red-500 text-[11px] font-bold rounded-lg uppercase hover:bg-red-100">Delete</button>
                              </div>
                           </motion.div>
                         )}
                       </AnimatePresence>
                    </div>
                  )) : (
                    <div className="text-center text-gray-400 py-6 bg-white border border-gray-100 rounded-3xl border-dashed">
                      No items in {config.section}.
                    </div>
                  )}
               </div>
             )
          })}
        </div>
      </main>
    </div>
  );
};

export default ScaffoldingAdmin;
