import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit2, FiTrash2, FiPlus, FiX, FiShield, FiExternalLink } from 'react-icons/fi';

const OurPolicies = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Define the master list with implicit order based on index
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

  const [formData, setFormData] = useState({
    id: "",
    slug: "archival",
    label: "Archival Policy",
    docName: "",
    url: "",
  });

  const brandColor = "#292C44";
  const CMS_API = "http://localhost:3000/cms/policies";
  const PUBLIC_API = "http://localhost:3000/api/policies";

  const fetchPolicies = async () => {
    try {
      const res = await axios.get(PUBLIC_API);
      setPolicies(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPolicies(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // AUTOMATIC ORDERING
    // Find the index of the selected slug in the master list and add 1
    const autoOrder = POLICY_TYPES.findIndex(p => p.slug === formData.slug) + 1;

    try {
      await axios.post(`${CMS_API}/upsert`, {
        slug: formData.slug,
        label: formData.label,
        docName: formData.docName,
        url: formData.url,
        order: autoOrder // Order is now calculated automatically
      });
      closeModal();
      fetchPolicies();
    } catch (err) {
      alert("Error saving policy.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this policy?")) {
      await axios.delete(`${CMS_API}/${id}`);
      fetchPolicies();
    }
  };

  const openEditModal = (policy) => {
    setFormData({
      id: policy._id,
      slug: policy.slug,
      label: policy.label,
      docName: policy.docName,
      url: policy.url,
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setFormData({ slug: "archival", label: "Archival Policy", docName: "", url: "" });
  };

  if (loading) return <div className="p-10 text-center">Syncing Policies...</div>;

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Our Policies</h1>
          <p className="text-gray-500 mt-1">Automatic ordering enabled based on policy type</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#292C44] text-white px-6 py-3 rounded-lg font-bold shadow-md"
        >
          <FiPlus className="inline mr-2" /> Add Policy
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              <th className="px-8 py-5">Policy & Document Name</th>
              <th className="px-8 py-5 text-center">Order (Auto)</th>
              <th className="px-8 py-5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {policies.map((policy) => (
              <tr key={policy._id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <FiShield className="text-gray-400" size={20} />
                    <div>
                      <span className="font-bold text-gray-700 block">{policy.docName}</span>
                      <span className="text-[10px] text-blue-500 font-bold uppercase">{policy.label}</span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5 text-center">
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold text-gray-500">#{policy.order}</span>
                </td>
                <td className="px-8 py-5 text-center">
                  <div className="flex justify-center gap-4">
                    <button onClick={() => openEditModal(policy)} className="text-gray-400 hover:text-blue-600"><FiEdit2 size={18}/></button>
                    <button onClick={() => handleDelete(policy._id)} className="text-gray-400 hover:text-red-600"><FiTrash2 size={18}/></button>
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
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
              <form onSubmit={handleSubmit} className="p-8 space-y-5">
                <h2 className="text-xl font-bold mb-4">{isEditing ? "Edit Policy" : "Add Policy"}</h2>
                
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Policy Category</label>
                  <select 
                    value={formData.slug} 
                    onChange={(e) => {
                      const selected = POLICY_TYPES.find(p => p.slug === e.target.value);
                      setFormData({...formData, slug: selected.slug, label: selected.label});
                    }}
                    className="w-full bg-gray-50 border rounded-xl px-4 py-3 outline-none"
                    disabled={isEditing}
                  >
                    {POLICY_TYPES.map(p => (
                      <option key={p.slug} value={p.slug}>{p.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Display Name</label>
                  <input type="text" required value={formData.docName} onChange={(e) => setFormData({...formData, docName: e.target.value})} className="w-full bg-gray-50 border rounded-xl px-4 py-3 outline-none" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Drive Link</label>
                  <input type="url" required value={formData.url} onChange={(e) => setFormData({...formData, url: e.target.value})} className="w-full bg-gray-50 border rounded-xl px-4 py-3 outline-none" />
                </div>

                <button type="submit" className="w-full py-3 bg-[#292C44] text-white rounded-xl font-bold mt-4">Save Policy</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OurPolicies;