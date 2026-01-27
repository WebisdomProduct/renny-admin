import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUploadCloud, FiTrash2, FiEdit3, FiSearch, FiPlus, FiX } from 'react-icons/fi';

const CertificateAdmin = () => {
  const [certs, setCerts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({ id: null, title: '', img: '', type: 'file' });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const CMS_API = "http://localhost:3000/api/certificates";
  const UPLOAD_API = "http://localhost:3000/cms/upload/upload"; // Your S3 route
  const fileInputRef = useRef(null);

  useEffect(() => { fetchCerts(); }, []);

  const fetchCerts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(CMS_API);
      setCerts(Array.isArray(data) ? data : []);
    } catch (err) { setCerts([]); } 
    finally { setLoading(false); }
  };

  const handleS3Upload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append("file", file);
    setUploading(true);

    try {
      const res = await axios.post(UPLOAD_API, data);
      setFormData({ ...formData, img: res.data.fileUrl });
      alert("Certificate image uploaded to Cloud!");
    } catch (err) {
      alert("Cloud upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.img || !formData.title) return alert("Title and Cloud Image required");

    try {
      await axios.post(`${CMS_API}/upsert`, formData);
      setIsModalOpen(false);
      setFormData({ id: null, title: '', img: '', type: 'file' });
      fetchCerts();
    } catch (err) { alert("Save failed"); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Permanently delete this certificate from database?")) {
      try {
        await axios.delete(`${CMS_API}/${id}`);
        fetchCerts();
      } catch (err) { alert("Delete failed"); }
    }
  };

  const filteredCerts = certs.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Certifications</h1>
            <p className="text-gray-500 text-sm">Manage ISO and Quality Standards</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input 
                type="text" placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => { setIsModalOpen(true); setFormData({ id: null, title: '', img: '', type: 'file' }); }}
              className="bg-[#292C44] text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg"
            >
              <FiPlus /> Add New
            </button>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="text-center py-20 text-gray-400 animate-pulse font-bold">Syncing with Cloud...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredCerts.map((cert) => (
              <motion.div layout key={cert._id} className="bg-white p-4 rounded-2xl border shadow-sm group">
                <div className="aspect-[3/4] mb-4 overflow-hidden rounded-xl border bg-gray-50 flex items-center justify-center relative">
                  <img src={cert.img} alt={cert.title} className="max-w-full max-h-full object-contain p-2" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={() => { setFormData({ id: cert._id, title: cert.title, img: cert.img, type: cert.type }); setIsModalOpen(true); }} className="p-3 bg-white rounded-full text-blue-600 shadow-xl hover:scale-110 transition-transform"><FiEdit3 /></button>
                    <button onClick={() => handleDelete(cert._id)} className="p-3 bg-white rounded-full text-red-500 shadow-xl hover:scale-110 transition-transform"><FiTrash2 /></button>
                  </div>
                </div>
                <p className="font-bold text-gray-800 text-center truncate">{cert.title}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Upsert Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[1000]">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white p-8 rounded-[2rem] w-full max-w-md shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">{formData.id ? 'Edit Certificate' : 'New Certificate'}</h2>
                  <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><FiX size={24} /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2 ml-1">Certificate Title</label>
                    <input 
                      type="text" 
                      required
                      value={formData.title} 
                      onChange={(e)=>setFormData({...formData, title: e.target.value})} 
                      className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" 
                      placeholder="e.g. ISO 9001:2015" 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2 ml-1">Cloud Image</label>
                    <input type="file" ref={fileInputRef} onChange={handleS3Upload} className="hidden" accept="image/*" />
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className={`w-full py-10 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 ${formData.img ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50'}`}
                    >
                      {uploading ? (
                        <span className="text-blue-500 font-bold animate-pulse">Uploading to S3...</span>
                      ) : formData.img ? (
                        <img src={formData.img} className="h-20 object-contain rounded shadow-sm" alt="Preview" />
                      ) : (
                        <>
                          <FiUploadCloud size={30} className="text-gray-300" />
                          <span className="text-gray-400 text-sm font-medium">Click to Upload to S3</span>
                        </>
                      )}
                    </button>
                  </div>

                  <button 
                    type="submit" 
                    disabled={uploading || !formData.img}
                    className="w-full bg-[#292C44] text-white py-4 rounded-xl font-bold shadow-lg disabled:bg-gray-300 transition-all active:scale-95"
                  >
                    {formData.id ? 'Update Certificate' : 'Save Certificate'}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CertificateAdmin;