import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUploadCloud, FiTrash2, FiEdit3, FiSearch, FiPlus, FiX, FiInfo } from 'react-icons/fi';

const CertificateAdmin = () => {
  const [certs, setCerts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Added description to initial state to match provided dummy data
  const [formData, setFormData] = useState({ 
    id: null, 
    title: '', 
    img: '', 
    description: '', // New field
    type: 'file' 
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const CMS_API = "http://localhost:3000/api/certificates";
  const UPLOAD_API = "http://localhost:3000/cms/upload/upload"; 
  const fileInputRef = useRef(null);

  useEffect(() => { fetchCerts(); }, []);

  const fetchCerts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(CMS_API);
      // Backend now returns { success: true, data: [...] }
      setCerts(Array.isArray(res.data.data) ? res.data.data : []);
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
    } catch (err) {
      alert("Cloud upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.img || !formData.title || !formData.description) {
      return alert("Title, Description and Image are required");
    }

    try {
      // Atlas-compliant payload cleaning
      const payload = { ...formData };
      if (!payload.id) delete payload.id;

      await axios.post(`${CMS_API}/upsert`, payload);
      setIsModalOpen(false);
      resetForm();
      fetchCerts();
    } catch (err) { alert("Save failed"); }
  };

  const resetForm = () => {
    setFormData({ id: null, title: '', img: '', description: '', type: 'file' });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Permanently delete this certificate?")) {
      try {
        await axios.delete(`${CMS_API}/${id}`);
        fetchCerts();
      } catch (err) { alert("Delete failed"); }
    }
  };

  const filteredCerts = certs.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#292C44]">Certifications</h1>
            <p className="text-gray-500 text-sm">Manage ISO Standards & Quality Descriptions</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input 
                type="text" placeholder="Search certifications..."
                className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#292C44] bg-white"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="bg-[#292C44] text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-black transition-all"
            >
              <FiPlus /> Add Certificate
            </button>
          </div>
        </div>

        {/* Grid View */}
        {loading ? (
          <div className="text-center py-20 text-gray-400 animate-pulse font-bold uppercase tracking-widest text-xs">Syncing Certificates...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredCerts.map((cert) => (
              <motion.div layout key={cert._id} className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                <div className="aspect-[3/4] mb-4 overflow-hidden rounded-2xl border bg-gray-50 flex items-center justify-center relative">
                  <img src={cert.img} alt={cert.title} className="max-w-full max-h-full object-contain p-4" />
                  <div className="absolute inset-0 bg-[#292C44]/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button onClick={() => { setFormData({ id: cert._id, title: cert.title, img: cert.img, description: cert.description, type: cert.type }); setIsModalOpen(true); }} className="p-3 bg-white rounded-full text-blue-600 shadow-xl hover:scale-110 transition-transform"><FiEdit3 /></button>
                    <button onClick={() => handleDelete(cert._id)} className="p-3 bg-white rounded-full text-red-500 shadow-xl hover:scale-110 transition-transform"><FiTrash2 /></button>
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-bold text-[#292C44] truncate mb-1">{cert.title}</p>
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Quality Standard</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[1000]">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white p-8 rounded-[2.5rem] w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-[#292C44]">{formData.id ? 'Edit Certificate' : 'New Certificate'}</h2>
                  <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><FiX size={24} /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">Standard Title</label>
                    <input 
                      type="text" required
                      value={formData.title} 
                      onChange={(e)=>setFormData({...formData, title: e.target.value})} 
                      className="w-full border p-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#292C44] bg-gray-50" 
                      placeholder="e.g. IS 9001 : 2015" 
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">Standard Description</label>
                    <textarea 
                      required
                      rows={4}
                      value={formData.description} 
                      onChange={(e)=>setFormData({...formData, description: e.target.value})} 
                      className="w-full border p-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#292C44] bg-gray-50 resize-none" 
                      placeholder="Enter the certificate details and compliance info..." 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">Upload Certificate Image (S3)</label>
                    <input type="file" ref={fileInputRef} onChange={handleS3Upload} className="hidden" accept="image/*" />
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className={`w-full py-12 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 ${formData.img ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50'}`}
                    >
                      {uploading ? (
                        <span className="text-blue-500 font-bold animate-pulse">Uploading to Cloud...</span>
                      ) : formData.img ? (
                        <div className="flex flex-col items-center">
                          <img src={formData.img} className="h-24 object-contain rounded-lg shadow-sm mb-2" alt="Preview" />
                          <span className="text-[10px] text-green-600 font-bold uppercase">Change Image</span>
                        </div>
                      ) : (
                        <>
                          <FiUploadCloud size={30} className="text-gray-300" />
                          <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Browse Cloud Storage</span>
                        </>
                      )}
                    </button>
                  </div>

                  <button 
                    type="submit" 
                    disabled={uploading || !formData.img}
                    className="w-full bg-[#292C44] text-white py-4 rounded-2xl font-bold shadow-xl shadow-[#292C44]/20 disabled:bg-gray-300 transition-all active:scale-95"
                  >
                    {formData.id ? 'Save Changes' : 'Publish Certificate'}
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