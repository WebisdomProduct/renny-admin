import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiX,
  FiUploadCloud,
} from "react-icons/fi";

const GOVERNANCE_TABS = [
  { key: "board", label: "Board of Directors" },
  { key: "committee", label: "Committee Composition of Board" },
  { key: "contact", label: "Investor Contacts" },
];
const COMMITTEE_TITLES = [
  "AUDIT COMMITTEE",
  "NOMINATION & REMUNERATION COMMITTEE",
  "STAKEHOLDER RELATIONSHIP COMMITTEE",
  "CORPORATE SOCIAL RESPONSIBILITY",
  "RISK MANAGEMENT COMMITTEE",
  "IPO COMMITTEE",
];

const CorporateGovernance = () => {
  const [activeTab, setActiveTab] = useState("board");
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false); // New state for image upload
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({});

  const CMS_API = "http://localhost:3000/cms/governance";
  const PUBLIC_API = "http://localhost:3000/api/governance";
  const UPLOAD_API = "http://localhost:3000/cms/upload/upload"; // Matches your registered route

  const fetchGovernance = async () => {
    try {
      const res = await axios.get(PUBLIC_API);
      setSections(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGovernance();
  }, []);

  // NEW: Handle Board Member Image Upload to S3
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append("file", file); // Must match 'file' key in multer middleware

    setUploading(true);
    try {
      const res = await axios.post(UPLOAD_API, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Backend route returns { success: true, fileUrl: "..." }
      setFormData((prev) => ({ ...prev, img: res.data.fileUrl }));
      alert("Director photo uploaded to S3!");
    } catch (err) {
      console.error("S3 Upload Failed:", err);
      alert("Failed to upload image to S3.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${CMS_API}/upsert`, {
        slug: activeTab,
        label: GOVERNANCE_TABS.find((t) => t.key === activeTab).label,
        ...formData,
      });
      closeModal();
      fetchGovernance();
    } catch (err) {
      alert("Save failed");
    }
  };

  const handleDelete = async (itemId) => {
    if (window.confirm("Are you sure you want to remove this entry?")) {
      try {
        await axios.delete(`${CMS_API}/${activeTab}/item/${itemId}`);
        fetchGovernance();
      } catch (err) {
        alert("Failed to delete.");
      }
    }
  };

  const openEditModal = (item) => {
    setFormData({ recordId: item._id, ...item });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setFormData({});
  };

  if (loading) return <div className="p-10 text-center">Loading Governance Data...</div>;

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Corporate Governance</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#292C44] text-white px-6 py-3 rounded-lg font-bold shadow-md flex items-center gap-2"
        >
          <FiPlus /> Add {GOVERNANCE_TABS.find((t) => t.key === activeTab).label}
        </button>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex gap-4 mb-8 border-b border-gray-200">
        {GOVERNANCE_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-4 px-2 font-bold transition-all ${
              activeTab === tab.key ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              <th className="px-8 py-5">Name & Detail</th>
              <th className="px-8 py-5">Role / Context</th>
              <th className="px-8 py-5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sections.find((s) => s.slug === activeTab)?.content.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-8 py-5 flex items-center gap-4">
                  {activeTab === "board" && item.img && (
                    <img src={item.img} className="w-10 h-10 rounded-full object-cover border" alt="" />
                  )}
                  <div>
                    <span className="font-bold text-gray-700 block">{item.name}</span>
                    {activeTab === "contact" && <span className="text-xs text-gray-400">{item.email}</span>}
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="text-sm font-medium text-gray-500">{item.designation || item.position}</span>
                </td>
                <td className="px-8 py-5 text-center">
                  <div className="flex justify-center gap-4">
                    <button onClick={() => openEditModal(item)} className="text-gray-400 hover:text-blue-600"><FiEdit2 size={18} /></button>
                    <button onClick={() => handleDelete(item._id)} className="text-gray-400 hover:text-red-600"><FiTrash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DYNAMIC MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-y-auto max-h-[90vh]">
              <form onSubmit={handleSubmit} className="p-8 space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Manage {activeTab}</h2>
                  <button type="button" onClick={closeModal}><FiX /></button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Full Name</label>
                  <input type="text" required value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-gray-50 border rounded-xl px-4 py-2 outline-none" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Designation</label>
                  <input type="text" required value={formData.designation || ""} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} className="w-full bg-gray-50 border rounded-xl px-4 py-2 outline-none" />
                </div>

                {/* BOARD IMAGE UPLOAD */}
                {activeTab === "board" && (
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Profile Photo (Upload from Laptop)</label>
                    <div className="relative">
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="governance-img" />
                      <label htmlFor="governance-img" className={`w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer ${formData.img ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                        {uploading ? <span className="animate-pulse">Uploading to S3...</span> : (
                          <><FiUploadCloud /> {formData.img ? "Photo Ready" : "Select Photo"}</>
                        )}
                      </label>
                    </div>
                  </div>
                )}

                {/* COMMITTEE FIELDS */}
                {activeTab === "committee" && (
                  <div className="space-y-4">
                    <select value={formData.committeeTitle || ""} onChange={(e) => setFormData({ ...formData, committeeTitle: e.target.value })} className="w-full bg-gray-50 border rounded-xl px-4 py-2 outline-none" required>
                      <option value="" disabled>Select a Committee</option>
                      {COMMITTEE_TITLES.map((title) => <option key={title} value={title}>{title}</option>)}
                    </select>
                    <input type="text" required value={formData.position || ""} onChange={(e) => setFormData({ ...formData, position: e.target.value })} className="w-full bg-gray-50 border rounded-xl px-4 py-2 outline-none" placeholder="e.g. Chairman / Member" />
                  </div>
                )}

                {/* CONTACT FIELDS */}
                {activeTab === "contact" && (
                  <div className="space-y-4">
                    <input type="email" placeholder="Email" value={formData.email || ""} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-gray-50 border rounded-xl px-4 py-2 outline-none" />
                    <input type="text" placeholder="Phone" value={formData.phone || ""} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-gray-50 border rounded-xl px-4 py-2 outline-none" />
                    <textarea placeholder="Office Address" value={formData.officeAddress || ""} onChange={(e) => setFormData({ ...formData, officeAddress: e.target.value })} className="w-full bg-gray-50 border rounded-xl px-4 py-2 outline-none" rows="2" />
                  </div>
                )}

                <button type="submit" disabled={uploading} className="w-full py-3 bg-[#292C44] text-white rounded-xl font-bold mt-4 shadow-lg hover:opacity-90 disabled:bg-gray-400">
                  Save Entry
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CorporateGovernance;