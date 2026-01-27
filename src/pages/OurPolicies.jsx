import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit2, FiTrash2, FiPlus, FiX, FiShield, FiUploadCloud, FiLink } from 'react-icons/fi';

const OurPolicies = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadMode, setUploadMode] = useState('file'); // 'file' or 'link'

  const POLICY_TYPES = [
    { slug: "archival", label: "Archival Policy" },
    { slug: "independent", label: "Terms of an Independent Director’s Appointment" },
    { slug: "party", label: "Policy on Material Related Party Transaction" },
    { slug: "disclosure", label: "Policy on Disclosure on Material Event Information" },
    { slug: "whistle", label: "Whistle Blower Policy" },
    { slug: "nomination", label: "Nomination & Remuneration Policy" },
    { slug: "familiarisation", label: "Familiarisation Programme for Independent Directors" },
    { slug: "conduct", label: "Code of Conduct for Board & Senior Managements" },
    { slug: "risk", label: "Risk Management Policy" },
    { slug: "fair", label: "Code of Fair Disclosure" },
    { slug: "csr", label: "Corporate Social Responsibility Policy" },
    { slug: "succession", label: "Succession Policy" },
    { slug: "posh", label: "Policy on Prevention of Sexual Harassment at Workplace" },
    { slug: "dividend", label: "Dividend Policy" },
    { slug: "trading", label: "Code of Conduct to Regulate Monitor and Report Trading" },
    { slug: "evaluation", label: "Board Evaluation Policy" },
    { slug: "diversity", label: "Policy on Diversity of the Board" }
  ];

  const [formData, setFormData] = useState({ id: "", slug: "archival", label: "Archival Policy", docName: "", url: "", type: "file" });

  const brandColor = "#292C44";
  const CMS_API = "http://localhost:3000/cms/policies";
  const PUBLIC_API = "http://localhost:3000/api/policies";
  const UPLOAD_API = "http://localhost:3000/cms/upload/upload";

  const fetchPolicies = async () => {
    try {
      const res = await axios.get(PUBLIC_API);
      setPolicies(res.data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPolicies(); }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const data = new FormData();
    data.append("file", file);
    setUploading(true);
    try {
      const res = await axios.post(UPLOAD_API, data);
      setFormData(prev => ({ ...prev, url: res.data.fileUrl, type: 'file' }));
      alert("Policy PDF uploaded to S3!");
    } catch (err) { alert("S3 Upload Failed"); } 
    finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const autoOrder = POLICY_TYPES.findIndex(p => p.slug === formData.slug) + 1;

    try {
      await axios.post(`${CMS_API}/upsert`, {
        ...formData,
        order: autoOrder
      });
      closeModal();
      fetchPolicies();
    } catch (err) { alert("Error saving policy."); }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setUploadMode('file');
    setFormData({ id: "", slug: "archival", label: "Archival Policy", docName: "", url: "", type: "file" });
  };

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Our Policies</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-[#292C44] text-white px-6 py-3 rounded-lg font-bold shadow-md">
          <FiPlus className="inline mr-2" /> Add Policy
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              <th className="px-8 py-5">Policy Name</th>
              <th className="px-8 py-5 text-center">Type</th>
              <th className="px-8 py-5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {policies.map((policy) => (
              <tr key={policy._id} className="hover:bg-gray-50/50">
                <td className="px-8 py-5">
                  <span className="font-bold text-gray-700 block">{policy.docName}</span>
                  <span className="text-[10px] text-blue-500 font-bold uppercase tracking-tighter">Category: {policy.label}</span>
                </td>
                <td className="px-8 py-5 text-center">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold ${policy.type === 'file' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                    {policy.type === 'file' ? 'S3 CLOUD' : 'EXTERNAL'}
                  </span>
                </td>
                <td className="px-8 py-5 text-center">
                  <div className="flex justify-center gap-4">
                    <button onClick={() => { setFormData({...policy, id: policy._id}); setIsEditing(true); setIsModalOpen(true); setUploadMode(policy.type || 'file'); }} className="text-gray-400 hover:text-blue-600"><FiEdit2 /></button>
                    <button onClick={async () => { if(window.confirm("Delete?")) { await axios.delete(`${CMS_API}/${policy._id}`); fetchPolicies(); } }} className="text-gray-400 hover:text-red-600"><FiTrash2 /></button>
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
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl w-full max-w-lg overflow-hidden">
              <div className="px-8 py-6 border-b flex justify-between bg-gray-50">
                <h2 className="text-xl font-bold">Manage Policy</h2>
                <button onClick={closeModal}><FiX /></button>
              </div>

              <div className="px-8 mt-6">
                <div className="flex bg-gray-100 p-1 rounded-xl">
                  <button type="button" onClick={() => setUploadMode('file')} className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 ${uploadMode === 'file' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}><FiUploadCloud /> S3 Upload</button>
                  <button type="button" onClick={() => setUploadMode('link')} className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 ${uploadMode === 'link' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}><FiLink /> Drive Link</button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Policy Category</label>
                  <select disabled={isEditing} value={formData.slug} onChange={(e) => { const s = POLICY_TYPES.find(p => p.slug === e.target.value); setFormData({...formData, slug: s.slug, label: s.label}); }} className="w-full bg-gray-50 border rounded-xl px-4 py-3">
                    {POLICY_TYPES.map(p => <option key={p.slug} value={p.slug}>{p.label}</option>)}
                  </select>
                </div>

                <input type="text" placeholder="Full Display Name" required value={formData.docName} onChange={(e) => setFormData({...formData, docName: e.target.value})} className="w-full bg-gray-50 border rounded-xl px-4 py-3 outline-none" />

                {uploadMode === 'file' ? (
                  <label className={`w-full flex flex-col items-center py-10 border-2 border-dashed rounded-xl cursor-pointer ${formData.url && formData.type === 'file' ? 'bg-green-50 border-green-400' : 'bg-gray-50'}`}>
                    <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
                    <span className="text-sm font-bold text-gray-500">{uploading ? "Uploading..." : (formData.url && formData.type === 'file' ? "Policy Ready!" : "Upload Policy PDF")}</span>
                  </label>
                ) : (
                  <input type="url" placeholder="Google Drive Link" required value={formData.url} onChange={(e) => setFormData({...formData, url: e.target.value, type: 'link'})} className="w-full bg-gray-50 border rounded-xl px-4 py-3 outline-none" />
                )}

                <button type="submit" disabled={uploading || !formData.url} className="w-full py-4 bg-[#292C44] text-white rounded-xl font-bold shadow-lg disabled:bg-gray-300">
                  Save Corporate Policy
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OurPolicies;