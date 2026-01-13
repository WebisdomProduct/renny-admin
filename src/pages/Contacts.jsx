import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMail, FiPhone, FiUser, FiMessageSquare, FiTrash2, 
  FiChevronDown, FiChevronUp, FiInbox, FiClock, FiTag 
} from 'react-icons/fi';

const Contact = () => {
  // API Route for Admin
  const CMS_API = "http://localhost:3000/cms/contact";

  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  // --- 1. Fetch Enquiries ---
  const fetchEnquiries = async () => {
    try {
      const res = await axios.get(CMS_API);
      // Handles your controller structure: { success: true, data: [...] }
      setEnquiries(res.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error("Fetch Error:", err);
      setEnquiries([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  // --- 2. Delete Enquiry ---
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to remove this lead?")) {
      try {
        await axios.delete(`${CMS_API}/${id}`);
        setEnquiries((prev) => prev.filter((item) => item._id !== id));
        if (expandedId === id) setExpandedId(null);
      } catch (err) {
        alert("Delete failed.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20 font-helvetica text-[#292c44]">
      {/* Navbar */}
      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#292c44] rounded-xl flex items-center justify-center text-white shadow-lg">
              <FiMail size={20} />
            </div>
            <h1 className="text-xl font-poppins font-bold">Enquiry Console</h1>
          </div>
          <div className="text-[10px] font-black bg-gray-100 px-4 py-2 rounded-full text-gray-400 tracking-widest uppercase">
            {enquiries.length} Messages
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 mt-10">
        <div className="space-y-6">
          <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-4 ml-2">Inbox Stream</h3>
          
          {loading ? (
             <div className="py-20 text-center font-poppins text-gray-400">Loading leads...</div>
          ) : (
            <AnimatePresence mode="popLayout">
              {enquiries.map((item) => (
                <motion.div
                  key={item._id}
                  layout
                  onClick={() => setExpandedId(expandedId === item._id ? null : item._id)}
                  className={`bg-white border rounded-[2.5rem] p-6 cursor-pointer transition-all duration-300 ${
                    expandedId === item._id ? 'border-[var(--color-blue)] shadow-xl' : 'border-gray-100 hover:shadow-lg shadow-sm'
                  }`}
                >
                  <div className="flex gap-6 items-center">
                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-[#292c44] flex-shrink-0">
                      <FiUser size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase text-gray-300 tracking-tighter flex items-center gap-1">
                          <FiTag className="text-gray-200" /> {item.enquiryType}
                        </span>
                        <span className="text-[10px] font-black uppercase text-gray-300 ml-2 flex items-center gap-1">
                          <FiClock className="text-gray-200" /> {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-xl font-poppins font-bold truncate leading-tight">{item.fullName}</h4>
                    </div>
                    {expandedId === item._id ? <FiChevronUp className="text-gray-300" /> : <FiChevronDown className="text-gray-300" />}
                  </div>

                  {/* Expanded Detail View */}
                  <AnimatePresence>
                    {expandedId === item._id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-8 pt-8 border-t border-gray-50"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</label>
                            <div className="flex items-center gap-2 text-[#292c44] font-semibold">
                                <FiMail className="text-gray-300" /> {item.email}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone Number</label>
                            <div className="flex items-center gap-2 text-[#292c44] font-semibold">
                                <FiPhone className="text-gray-300" /> {item.phoneNumber}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 bg-gray-50 p-6 rounded-3xl">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                            <FiMessageSquare /> Message Content
                          </label>
                          <p className="text-gray-600 leading-relaxed font-helvetica whitespace-pre-wrap">
                            {item.message}
                          </p>
                        </div>

                        <div className="flex gap-3 mt-8">
                          <a 
                            href={`mailto:${item.email}`}
                            className="flex-1 py-4 bg-[#292c44] text-white rounded-2xl font-poppins font-bold flex items-center justify-center gap-2 hover:opacity-95 transition-opacity"
                          >
                            Reply via Email
                          </a>
                          <button 
                            onClick={(e) => handleDelete(e, item._id)}
                            className="px-6 py-4 bg-red-50 text-red-500 rounded-2xl font-bold hover:bg-red-100 transition-colors"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {!loading && enquiries.length === 0 && (
            <div className="py-24 text-center border-2 border-dashed border-gray-100 rounded-[3rem]">
              <FiInbox className="mx-auto text-gray-200 mb-4" size={48} />
              <p className="text-gray-400 font-poppins font-bold">Your inbox is clear.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Contact;