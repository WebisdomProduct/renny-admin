import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit2, FiTrash2, FiPlus, FiX, FiFileText, FiExternalLink } from 'react-icons/fi';

const IPODocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [formData, setFormData] = useState({ 
    recordId: "", 
    title: "", 
    url: "" 
  });

  const brandColor = "#292C44";
  const CMS_API = "http://localhost:3000/cms/ipo-documents"; // Matches your CMS prefix
  const PUBLIC_API = "http://localhost:3000/api/ipo-documents";

  // 1. GET: Fetch IPO documents
  const fetchIpoDocs = async () => {
    try {
      const res = await axios.get(PUBLIC_API);
      // Controller returns pageData.documents directly
      setDocuments(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchIpoDocs(); }, []);

  // 2. UPSERT: Add or Update Record
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Sends recordId only during edit mode
      await axios.post(`${CMS_API}/upsert`, {
        recordId: isEditing ? formData.recordId : undefined,
        title: formData.title,
        url: formData.url
      });
      closeModal();
      fetchIpoDocs();
    } catch (err) {
      alert("Error saving IPO document");
    }
  };

  // 3. DELETE: Remove particular record
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this IPO document?")) {
      try {
        // Assuming your router follows: router.delete('/record/:recordId', ...)
        await axios.delete(`${CMS_API}/record/${id}`);
        fetchIpoDocs();
        alert("Document deleted successfully");
      } catch (err) {
        console.error("Delete Error:", err);
        alert("Failed to delete record.");
      }
    }
  };

  const openEditModal = (doc) => {
    setFormData({
      recordId: doc._id,
      title: doc.title,
      url: doc.url
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setFormData({ recordId: "", title: "", url: "" });
  };

  if (loading) return <div className="p-10 text-center animate-pulse font-bold text-gray-400">Loading IPO Documents...</div>;

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
          <FiPlus strokeWidth={3} /> Add New Document
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              <th className="px-8 py-5">Document Title</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {documents.length > 0 ? documents.map((doc) => (
              <tr key={doc._id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-gray-100 rounded-lg text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      <FiFileText size={20} />
                    </div>
                    <div>
                      <span className="font-bold text-gray-700 block">{doc.title}</span>
                      <a href={doc.url} target="_blank" rel="noreferrer" className="text-[11px] font-bold text-blue-500 flex items-center gap-1 mt-1 hover:underline">
                        VIEW PDF LINK <FiExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[11px] font-bold">
                    Published
                  </span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center justify-center gap-4">
                    <button onClick={() => openEditModal(doc)} className="p-2 text-gray-400 hover:text-blue-600 transition-all"><FiEdit2 size={18}/></button>
                    <button onClick={() => handleDelete(doc._id)} className="p-2 text-gray-400 hover:text-red-600 transition-all"><FiTrash2 size={18}/></button>
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

      {/* MODAL SECTION */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="px-8 py-6 border-b flex justify-between items-center bg-gray-50">
                <h2 className="text-xl font-bold text-gray-800">{isEditing ? "Edit IPO Document" : "Add IPO Document"}</h2>
                <button onClick={closeModal} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><FiX /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">Document Name (e.g., DRHP)</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.title} 
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">Google Drive Link</label>
                  <input 
                    type="url" 
                    required 
                    value={formData.url} 
                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={closeModal} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 py-3 text-white rounded-xl font-bold shadow-lg" style={{ backgroundColor: brandColor }}>
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