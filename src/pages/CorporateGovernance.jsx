import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiX,
  FiUser,
  FiUsers,
  FiMail,
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Dynamic Form State
  const [formData, setFormData] = useState({});

  const brandColor = "#292C44";
  const CMS_API = "http://localhost:3000/cms/governance";
  const PUBLIC_API = "http://localhost:3000/api/governance";

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

  const activeSection = sections.find((s) => s.slug === activeTab) || {
    content: [],
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Matches: upsertGovernanceRecord
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
    // 1. Confirm with the user before performing a permanent action
    if (window.confirm("Are you sure you want to remove this entry?")) {
      try {
        // 2. The URL must match your router: /cms/governance/:slug/item/:itemId
        // activeTab provides the 'slug' (board, committee, or contact)
        const response = await axios.delete(
          `${CMS_API}/${activeTab}/item/${itemId}`
        );

        if (response.status === 200) {
          // 3. Refresh the UI data after successful deletion
          fetchGovernance();
          alert("Item removed successfully");
        }
      } catch (err) {
        console.error("Delete Error:", err.response?.data || err.message);
        alert("Failed to delete. Check console for route mismatch.");
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

  if (loading)
    return <div className="p-10 text-center">Loading Governance Data...</div>;

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Corporate Governance
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#292C44] text-white px-6 py-3 rounded-lg font-bold shadow-md flex items-center gap-2"
        >
          <FiPlus /> Add{" "}
          {GOVERNANCE_TABS.find((t) => t.key === activeTab).label}
        </button>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex gap-4 mb-8 border-b border-gray-200">
        {GOVERNANCE_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-4 px-2 font-bold transition-all ${
              activeTab === tab.key
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* DYNAMIC CONTENT TABLE */}
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
            {activeSection.content.map((item) => (
              <tr
                key={item._id}
                className="hover:bg-gray-50/50 transition-colors group"
              >
                <td className="px-8 py-5">
                  <span className="font-bold text-gray-700 block">
                    {item.name}
                  </span>
                  {activeTab === "contact" && (
                    <span className="text-xs text-gray-400">{item.email}</span>
                  )}
                  {activeTab === "committee" && (
                    <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-bold uppercase">
                      {item.committeeTitle}
                    </span>
                  )}
                </td>
                <td className="px-8 py-5">
                  <span className="text-sm font-medium text-gray-500">
                    {item.designation || item.position}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => openEditModal(item)}
                      className="text-gray-400 hover:text-blue-600"
                    >
                      <FiEdit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <FiTrash2 size={18} />
                    </button>
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-y-auto max-h-[90vh]"
            >
              <form onSubmit={handleSubmit} className="p-8 space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Manage {activeTab}</h2>
                  <button type="button" onClick={closeModal}>
                    <FiX />
                  </button>
                </div>

                {/* Common Fields */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full bg-gray-50 border rounded-xl px-4 py-2 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.designation || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, designation: e.target.value })
                    }
                    className="w-full bg-gray-50 border rounded-xl px-4 py-2 outline-none"
                  />
                </div>

                {/* Tab Specific Fields */}
                {activeTab === "board" && (
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                      Profile Image Link
                    </label>
                    <input
                      type="url"
                      value={formData.img || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, img: e.target.value })
                      }
                      className="w-full bg-gray-50 border rounded-xl px-4 py-2 outline-none"
                    />
                  </div>
                )}

                {activeTab === "committee" && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                        Committee Title
                      </label>
                      <select
                        value={formData.committeeTitle || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            committeeTitle: e.target.value,
                          })
                        }
                        className="w-full bg-gray-50 border rounded-xl px-4 py-2 outline-none focus:border-blue-500 transition-colors"
                        required
                      >
                        <option value="" disabled>
                          Select a Committee
                        </option>
                        {COMMITTEE_TITLES.map((title) => (
                          <option key={title} value={title}>
                            {title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                        Position (Role)
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.position || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, position: e.target.value })
                        }
                        className="w-full bg-gray-50 border rounded-xl px-4 py-2 outline-none focus:border-blue-500 transition-colors"
                        placeholder="e.g. Chairman / Member / Invitee"
                      />
                    </div>
                  </>
                )}

                {activeTab === "contact" && (
                  <div className="space-y-4">
                    <input
                      type="email"
                      placeholder="Email"
                      value={formData.email || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full bg-gray-50 border rounded-xl px-4 py-2 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Phone"
                      value={formData.phone || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full bg-gray-50 border rounded-xl px-4 py-2 outline-none"
                    />
                    <textarea
                      placeholder="Office Address"
                      value={formData.officeAddress || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          officeAddress: e.target.value,
                        })
                      }
                      className="w-full bg-gray-50 border rounded-xl px-4 py-2 outline-none"
                      rows="2"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-[#292C44] text-white rounded-xl font-bold mt-4"
                >
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
