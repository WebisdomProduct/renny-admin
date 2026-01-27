import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit2, FiTrash2, FiPlus, FiX, FiFileText, FiExternalLink, FiUploadCloud, FiLink } from 'react-icons/fi';

const IPODocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadMode, setUploadMode] = useState('file'); // 'file' or 'link'

  const [formData, setFormData] = useState({ recordId: "", title: "", url: "", type: "file" });

  const brandColor = "#292C44";
  const CMS_API = "http://localhost:3000/cms/ipo-documents";
  const PUBLIC_API = "http://localhost:3000/api/ipo-documents";
  const UPLOAD_API = "http://localhost:3000/cms/upload/upload"; 

  // 1. FETCH: Get all documents
  const fetchIpoDocs = async () => {
    try {
      const res = await axios.get(PUBLIC_API);
      setDocuments(res.data);
    } catch (err) { 
      console.error("Fetch Error:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchIpoDocs(); }, []);

  // 2. UPLOAD: Handle S3 PDF Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const data = new FormData();
    data.append("file", file);
    setUploading(true);
    try {
      const res = await axios.post(UPLOAD_API, data);
      setFormData(prev => ({ ...prev, url: res.data.fileUrl, type: 'file' }));
      alert("PDF uploaded to S3!");
    } catch (err) { 
      alert("S3 Upload Failed"); 
    } finally { 
      setUploading(false); 
    }
  };

  // 3. UPSERT: Save or Update Record
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
      fetchIpoDocs();
    } catch (err) { 
      alert("Error saving document"); 
    }
  };

  // 4. DELETE: Remove particular record (The missing piece)
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this document? This action cannot be undone.")) {
      try {
        // Calls your backend route: router.delete('/record/:recordId', ...)
        const res = await axios.delete(`${CMS_API}/record/${id}`);
        
        if (res.status === 200) {
          alert("Document deleted successfully");
          fetchIpoDocs(); // Refresh table
        }
      } catch (err) {
        console.error("Delete Error:", err.response?.data || err.message);
        alert("Failed to delete record: " + (err.response?.data?.message || "Server Error"));
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setUploadMode('file');
    setFormData({ recordId: "", title: "", url: "", type: "file" });
  };

  if (loading) return <div className="p-10 text-center animate-pulse font-bold text-gray-400">Loading Documents...</div>;

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen font-sans">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">IPO Documents</h1>
          <p className="text-gray-500 mt-1">Manage Offer Documents, DRHP, and Prospectus</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="flex items-center gap-2 text-white px-6 py-3 rounded-lg font-bold shadow-md hover:scale-105 transition-all" 
          style={{ backgroundColor: brandColor }}
        >
          <FiPlus strokeWidth={3} /> Add Document
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              <th className="px-8 py-5">Document Title</th>
              <th className="px-8 py-5">Source</th>
              <th className="px-8 py-5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {documents.length > 0 ? documents.map((doc) => (
              <tr key={doc._id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-8 py-5">
                   <div className="flex items-center gap-3">
                     <FiFileText className="text-blue-500" />
                     <div>
                       <span className="font-bold text-gray-700 block">{doc.title}</span>
                       <a href={doc.url} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-blue-400 flex items-center gap-1 hover:underline">
                         PREVIEW <FiExternalLink size={10}/>
                       </a>
                     </div>
                   </div>
                </td>
                <td className="px-8 py-5">
                   <span className={`text-[10px] font-bold px-2 py-1 rounded ${doc.type === 'file' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                     {doc.type === 'file' ? 'S3 CLOUD' : 'DRIVE LINK'}
                   </span>
                </td>
                <td className="px-8 py-5 text-center">
                   <div className="flex justify-center gap-4">
                     <button 
                        onClick={() => { setFormData({ recordId: doc._id, title: doc.title, url: doc.url, type: doc.type }); setIsEditing(true); setIsModalOpen(true); }} 
                        className="p-2 text-gray-400 hover:text-blue-600 transition-all"
                     >
                        <FiEdit2 size={18}/>
                     </button>
                     <button 
                        onClick={() => handleDelete(doc._id)} 
                        className="p-2 text-gray-400 hover:text-red-600 transition-all"
                     >
                        <FiTrash2 size={18}/>
                     </button>
                   </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="3" className="px-8 py-10 text-center text-gray-400 italic">No IPO documents found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
              <div className="px-8 py-6 border-b flex justify-between bg-gray-50">
                <h2 className="text-xl font-bold">{isEditing ? "Edit Document" : "Add New Document"}</h2>
                <button onClick={closeModal}><FiX /></button>
              </div>

              <div className="px-8 mt-6">
                <div className="flex bg-gray-100 p-1 rounded-xl">
                  <button onClick={() => setUploadMode('file')} className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all ${uploadMode === 'file' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}><FiUploadCloud /> S3 Upload</button>
                  <button onClick={() => setUploadMode('link')} className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all ${uploadMode === 'link' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}><FiLink /> Drive Link</button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Document Title</label>
                  <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-gray-50 border rounded-xl px-4 py-3 outline-none focus:border-blue-500" />
                </div>
                
                {uploadMode === 'file' ? (
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">PDF File</label>
                    <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" id="pdf-up" />
                    <label htmlFor="pdf-up" className={`w-full flex flex-col items-center py-8 border-2 border-dashed rounded-xl cursor-pointer transition-all ${formData.url && formData.type === 'file' ? 'bg-green-50 border-green-400' : 'bg-gray-50'}`}>
                      {uploading ? "Uploading to S3..." : formData.url && formData.type === 'file' ? <span className="text-green-600 font-bold">PDF Ready!</span> : "Click to Upload PDF"}
                    </label>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">External URL</label>
                    <input type="url" required value={formData.url} onChange={(e) => setFormData({...formData, url: e.target.value, type: 'link'})} className="w-full bg-gray-50 border rounded-xl px-4 py-3 outline-none focus:border-blue-500" placeholder="https://drive.google.com/..." />
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={closeModal} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold">Cancel</button>
                  <button type="submit" disabled={uploading || !formData.url} className="flex-1 py-3 text-white rounded-xl font-bold shadow-lg disabled:bg-gray-300" style={{ backgroundColor: (uploading || !formData.url) ? '#D1D5DB' : brandColor }}>
                    {isEditing ? "Update Document" : "Save Document"}
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

export default IPODocuments;