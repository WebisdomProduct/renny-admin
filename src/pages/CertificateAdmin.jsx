import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const CertificateAdmin = () => {
  const [certs, setCerts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Form States
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  
  // Edit Modal States
  const [editingCert, setEditingCert] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editFile, setEditFile] = useState(null);

  // Refs to trigger hidden file inputs
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);

  useEffect(() => { fetchCerts(); }, []);

  const fetchCerts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/certificates');
      const certificatesData = data?.certificates || data || [];
      setCerts(Array.isArray(certificatesData) ? certificatesData : []);
    } catch (err) {
      setCerts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title) return alert("Title and Image required");
    const formData = new FormData();
    formData.append('title', title);
    formData.append('image', file);
    try {
      await axios.post('/api/certificates', formData);
      setTitle(''); setFile(null); fetchCerts();
    } catch (err) { alert("Upload failed"); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', editTitle);
    if (editFile) formData.append('image', editFile);
    try {
      await axios.put(`/api/certificates/${editingCert._id}`, formData);
      setEditingCert(null); setEditFile(null); fetchCerts();
    } catch (err) { alert("Update failed"); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete certificate?")) {
      try {
        await axios.delete(`/api/certificates/${id}`);
        fetchCerts();
      } catch (err) { alert("Delete failed"); }
    }
  };

  const filteredCerts = Array.isArray(certs) 
    ? certs.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <h1 className="text-3xl font-bold">Certificate Management</h1>
          <div className="relative w-full md:w-96">
            <input 
              type="text" placeholder="🔍 Search certificates..."
              className="w-full pl-4 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* UPLOAD FORM WITH BUTTON-STYLE FILE CHOOSE */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border mb-10">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Add New Certificate</h2>
          <form onSubmit={handleUpload} className="flex flex-col md:flex-row gap-6 items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm font-bold text-gray-600 mb-2">Standard Title</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e)=>setTitle(e.target.value)} 
                className="w-full border p-2.5 rounded-lg outline-none focus:border-green-500 transition-all" 
                placeholder="e.g. IS 1239" 
              />
            </div>

            <div className="flex-1 w-full">
              <label className="block text-sm font-bold text-gray-600 mb-2">Certificate Image</label>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={(e)=>setFile(e.target.files[0])} 
                className="hidden" // Hidden the default input
              />
              <button 
                type="button"
                onClick={() => fileInputRef.current.click()}
                className={`w-full py-2.5 px-4 rounded-lg border-2 border-dashed transition-all flex items-center justify-center gap-2 font-medium ${file ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-300 text-gray-500 hover:border-gray-400'}`}
              >
                <span>{file ? `✓ ${file.name}` : '📁 Choose File'}</span>
              </button>
            </div>

            <button className="bg-green-600 text-white px-10 py-2.5 rounded-lg font-bold hover:bg-green-700 shadow-lg shadow-green-200 transition-all active:scale-95">
              Upload
            </button>
          </form>
        </div>

        {/* GRID LISTING */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredCerts.map((cert) => (
            <motion.div layout key={cert._id} className="bg-white p-4 rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
              <div className="aspect-[3/4] mb-4 overflow-hidden rounded-xl border bg-gray-50 flex items-center justify-center">
                <img src={cert.img} alt={cert.title} className="max-w-full max-h-full object-contain p-2" />
              </div>
              <p className="font-bold text-gray-800 mb-4 truncate text-center">{cert.title}</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => { setEditingCert(cert); setEditTitle(cert.title); }}
                  className="flex-1 bg-blue-50 text-blue-600 font-bold py-2 rounded-lg hover:bg-blue-600 hover:text-white transition-all text-xs uppercase"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(cert._id)}
                  className="flex-1 bg-red-50 text-red-500 font-bold py-2 rounded-lg hover:bg-red-500 hover:text-white transition-all text-xs uppercase"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* EDIT MODAL WITH BUTTON-STYLE FILE CHOOSE */}
        <AnimatePresence>
          {editingCert && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[1000]">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Certificate</h2>
                <form onSubmit={handleUpdate} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1 ml-1">Title</label>
                    <input type="text" value={editTitle} onChange={(e)=>setEditTitle(e.target.value)} className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1 ml-1">Change Image</label>
                    <input 
                      type="file" 
                      ref={editFileInputRef}
                      onChange={(e)=>setEditFile(e.target.files[0])} 
                      className="hidden" 
                    />
                    <button 
                      type="button"
                      onClick={() => editFileInputRef.current.click()}
                      className={`w-full py-3 rounded-xl border-2 border-dashed transition-all flex items-center justify-center gap-2 ${editFile ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500'}`}
                    >
                      {editFile ? `Selected: ${editFile.name}` : 'Click to Replace Image'}
                    </button>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button type="submit" className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100">Save</button>
                    <button type="button" onClick={()=>setEditingCert(null)} className="flex-1 bg-gray-100 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-200 transition-all">Cancel</button>
                  </div>
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