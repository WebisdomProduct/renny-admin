import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit2, FiTrash2, FiPlus, FiX, FiFileText, FiExternalLink, FiUploadCloud, FiLink } from 'react-icons/fi';

const ShareHoldingPattern = () => {
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadMode, setUploadMode] = useState('file'); // 'file' or 'link'

  const [formData, setFormData] = useState({ recordId: "", title: "", url: "", type: "file" });

  const brandColor = "#292C44";
  const CMS_API = "http://localhost:3000/cms/shareholding-pattern"; 
  const PUBLIC_API = "http://localhost:3000/api/shareholding-pattern";
  const UPLOAD_API = "http://localhost:3000/cms/upload/upload";

  const fetchPatterns = async () => {
    try {
      const res = await axios.get(PUBLIC_API);
      setPatterns(res.data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPatterns(); }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const data = new FormData();
    data.append("file", file);
    setUploading(true);
    try {
      const res = await axios.post(UPLOAD_API, data);
      setFormData(prev => ({ ...prev, url: res.data.fileUrl, type: 'file' }));
      alert("Document uploaded to S3!");
    } catch (err) { alert("S3 Upload Failed"); } 
    finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${CMS_API}/upsert`, {
        recordId: isEditing ? formData.recordId : undefined,
        title: formData.title,
        url: formData.url,
        type: formData.type
      });
      closeModal();
      fetchPatterns();
    } catch (err) { alert("Error saving record"); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Permanently delete this pattern?")) {
      try {
        await axios.delete(`${CMS_API}/record/${id}`);
        fetchPatterns();
      } catch (err) { alert("Delete failed"); }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setUploadMode('file');
    setFormData({ recordId: "", title: "", url: "", type: "file" });
  };

  if (loading) return <div className="p-10 text-center animate-pulse text-gray-400 font-bold">Loading Patterns...</div>;

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shareholding Pattern</h1>
          <p className="text-gray-500 mt-1">Cloud-managed official documents</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 text-white px-6 py-3 rounded-lg font-bold shadow-md hover:opacity-90" style={{ backgroundColor: brandColor }}>
          <FiPlus strokeWidth={3} /> Add New Pattern
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              <th className="px-8 py-5">Pattern Title</th>
              <th className="px-8 py-5">Source</th>
              <th className="px-8 py-5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {patterns.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <FiFileText size={20} className="text-blue-500" />
                    <div>
                      <span className="font-bold text-gray-700 block">{item.title}</span>
                      <a href={item.url} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-gray-400 flex items-center gap-1 mt-1 hover:text-blue-500 uppercase">
                        View {item.type === 'file' ? 'S3 File' : 'Drive Link'} <FiExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                   <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${item.type === 'file' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                     {item.type === 'file' ? 'S3 CLOUD' : 'EXTERNAL'}
                   </span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex justify-center gap-4">
                    <button onClick={() => { setFormData({ recordId: item._id, title: item.title, url: item.url, type: item.type }); setIsEditing(true); setIsModalOpen(true); setUploadMode(item.type || 'file'); }} className="text-gray-400 hover:text-blue-600"><FiEdit2 size={18}/></button>
                    <button onClick={() => handleDelete(item._id)} className="text-gray-400 hover:text-red-600"><FiTrash2 size={18}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="px-8 py-6 border-b flex justify-between items-center bg-gray-50">
                <h2 className="text-xl font-bold">{isEditing ? "Edit Pattern" : "Add Pattern"}</h2>
                <button onClick={closeModal}><FiX /></button>
              </div>

              <div className="px-8 mt-6">
                <div className="flex bg-gray-100 p-1 rounded-xl">
                  <button type="button" onClick={() => setUploadMode('file')} className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all ${uploadMode === 'file' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}><FiUploadCloud /> S3 Upload</button>
                  <button type="button" onClick={() => setUploadMode('link')} className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all ${uploadMode === 'link' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}><FiLink /> External Link</button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-5">
                <input type="text" required placeholder="Pattern Title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-gray-50 border rounded-xl px-4 py-3 outline-none focus:border-blue-500" />
                
                {uploadMode === 'file' ? (
                  <label className={`w-full flex flex-col items-center py-10 border-2 border-dashed rounded-xl cursor-pointer ${formData.url && formData.type === 'file' ? 'bg-green-50 border-green-400' : 'bg-gray-50 border-gray-200'}`}>
                    <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
                    <span className="text-sm font-bold text-gray-500">{uploading ? "Uploading..." : (formData.url && formData.type === 'file' ? "PDF Uploaded!" : "Select PDF for S3")}</span>
                  </label>
                ) : (
                  <input type="url" required placeholder="External Drive URL" value={formData.url} onChange={(e) => setFormData({...formData, url: e.target.value, type: 'link'})} className="w-full bg-gray-50 border rounded-xl px-4 py-3 outline-none focus:border-blue-500" />
                )}

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={closeModal} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold">Cancel</button>
                  <button type="submit" disabled={uploading || !formData.url} className="flex-1 py-3 text-white rounded-xl font-bold shadow-lg disabled:bg-gray-300" style={{ backgroundColor: (uploading || !formData.url) ? '#D1D5DB' : brandColor }}>
                    Save Pattern
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShareHoldingPattern;