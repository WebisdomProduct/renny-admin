import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FiEdit2, FiTrash2, FiPlus, FiX, FiFileText, FiExternalLink } from "react-icons/fi";

const Financial = () => {
  const [data, setFinancials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const PUBLIC_API = "http://localhost:3000/api/financials";
  const CMS_API = "http://localhost:3000/cms/financials";

  // Your exact required keys
  const CATEGORIES = [
    { key: "audited", label: "Audited Financials of the Company" },
    { key: "creditors", label: "Outstanding Dues to Material Creditors" },
    { key: "renny-casting", label: "Renny Steel Casting Pvt Limited" },
    { key: "noval-paints", label: "Noval Paints (India) Limited" },
    { key: "annual-returns", label: "Annual Returns" }
  ];

  const [formData, setFormData] = useState({ 
    categoryId: "", 
    docId: "", 
    slug: "audited", 
    label: "Audited Financials of the Company", 
    title: "", 
    fileUrl: "" 
  });

  const fetchFinancials = async () => {
    try {
      const res = await axios.get(PUBLIC_API);
      setFinancials(res.data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchFinancials(); }, []);

  // EDIT FUNCTIONALITY: Opens modal and fills data
  const handleEditClick = (category, doc) => {
    setFormData({
      categoryId: category._id,
      docId: doc._id,
      slug: category.slug,
      label: category.label,
      title: doc.title,
      fileUrl: doc.fileUrl
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        // Calls: router.put('/category/:categoryId/document/:docId')
        await axios.put(`${CMS_API}/category/${formData.categoryId}/document/${formData.docId}`, {
          title: formData.title,
          fileUrl: formData.fileUrl
        });
      } else {
        // Calls: router.post('/upsert')
        await axios.post(`${CMS_API}/upsert`, {
          slug: formData.slug,
          label: formData.label,
          title: formData.title,
          fileUrl: formData.fileUrl
        });
      }
      closeModal();
      fetchFinancials();
    } catch (err) {
      alert("Error saving data. Check console.");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setFormData({ categoryId: "", docId: "", slug: "audited", label: "Audited Financials of the Company", title: "", fileUrl: "" });
  };

  const handleDeleteDoc = async (catId, docId) => {
    if (window.confirm("Delete this PDF?")) {
      await axios.delete(`${CMS_API}/category/${catId}/document/${docId}`);
      fetchFinancials();
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-[#292C44]">Financial</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-[#292C44] text-white px-6 py-3 rounded-lg font-bold">
          <FiPlus className="inline mr-2" /> Add Record
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              <th className="px-8 py-5">Title</th>
              <th className="px-8 py-5">Category</th>
              <th className="px-8 py-5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((category) => (
              category.documents?.map((doc) => (
                <tr key={doc._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-8 py-5 font-bold text-gray-700">{doc.title}</td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">{category.label}</span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="flex justify-center gap-3">
                      <button onClick={() => handleEditClick(category, doc)} className="text-blue-500 hover:text-blue-700"><FiEdit2 size={18}/></button>
                      <button onClick={() => handleDeleteDoc(category._id, doc._id)} className="text-red-400 hover:text-red-600"><FiTrash2 size={18}/></button>
                    </div>
                  </td>
                </tr>
              ))
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
              <form onSubmit={handleSubmit} className="p-8 space-y-5">
                <h2 className="text-xl font-bold">{isEditing ? "Edit Financial PDF" : "Add Financial PDF"}</h2>
                
                {!isEditing && (
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Category</label>
                    <select 
                      value={formData.slug} 
                      onChange={(e) => {
                        const selected = CATEGORIES.find(c => c.key === e.target.value);
                        setFormData({...formData, slug: selected.key, label: selected.label});
                      }}
                      className="w-full bg-gray-50 border rounded-xl px-4 py-3 outline-none"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat.key} value={cat.key}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Document Title</label>
                  <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-gray-50 border rounded-xl px-4 py-3 outline-none" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Drive Link</label>
                  <input type="url" required value={formData.fileUrl} onChange={(e) => setFormData({...formData, fileUrl: e.target.value})} className="w-full bg-gray-50 border rounded-xl px-4 py-3 outline-none" />
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={closeModal} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold">Cancel</button>
                  <button type="submit" className="flex-1 py-3 bg-[#292C44] text-white rounded-xl font-bold">
                    {isEditing ? "Update PDF" : "Save PDF"}
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

export default Financial;