import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FiEdit2, FiTrash2, FiPlus, FiX, FiFileText, FiUploadCloud } from "react-icons/fi";

const Financial = () => {
  const [data, setFinancials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false); // New state for upload progress
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const PUBLIC_API = "http://localhost:3000/api/financials";
  const CMS_API = "http://localhost:3000/cms/financials";
 // Change this in your Financial.jsx:
const UPLOAD_API = "http://localhost:3000/cms/upload/upload";

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

  // NEW: Handles Local PDF Upload to S3
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append("file", file);

    setUploading(true);
    try {
      const res = await axios.post(UPLOAD_API, data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      // Set the returned S3 URL into the fileUrl field
      setFormData((prev) => ({ ...prev, fileUrl: res.data.fileUrl }));
      alert("PDF uploaded to S3 successfully!");
    } catch (err) {
      console.error(err);
      alert("S3 Upload Failed");
    } finally {
      setUploading(false);
    }
  };

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
        await axios.put(`${CMS_API}/category/${formData.categoryId}/document/${formData.docId}`, {
          title: formData.title,
          fileUrl: formData.fileUrl
        });
      } else {
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
      alert("Error saving data.");
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
        <h1 className="text-3xl font-bold text-[#292C44]">Financial Studio</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-[#292C44] text-white px-6 py-3 rounded-lg font-bold">
          <FiPlus className="inline mr-2" /> Add PDF Record
        </button>
      </div>

      {/* Table Section (same as your original) */}
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
                <div className="flex justify-between items-center">
                   <h2 className="text-xl font-bold">{isEditing ? "Edit Document" : "Upload New PDF"}</h2>
                   <button type="button" onClick={closeModal}><FiX size={24} className="text-gray-400"/></button>
                </div>
                
                {!isEditing && (
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Select Category</label>
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
                  <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="e.g., Annual Report 2024" className="w-full bg-gray-50 border rounded-xl px-4 py-3 outline-none" />
                </div>

                {/* FILE UPLOAD SECTION */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Upload PDF from Laptop</label>
                  <div className="relative">
                    <input 
                      type="file" 
                      accept=".pdf" 
                      onChange={handleFileUpload} 
                      className="hidden" 
                      id="file-upload" 
                    />
                    <label 
                      htmlFor="file-upload" 
                      className={`w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${formData.fileUrl ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}
                    >
                      {uploading ? (
                        <span className="text-sm font-bold animate-pulse text-gray-500">Uploading to S3...</span>
                      ) : (
                        <>
                          <FiUploadCloud className={formData.fileUrl ? "text-green-600" : "text-gray-400"} />
                          <span className={`text-sm font-bold ${formData.fileUrl ? 'text-green-700' : 'text-gray-500'}`}>
                            {formData.fileUrl ? "File Ready in S3" : "Choose PDF File"}
                          </span>
                        </>
                      )}
                    </label>
                  </div>
                  {formData.fileUrl && (
                    <p className="mt-2 text-[10px] text-gray-400 break-all bg-gray-50 p-2 rounded">
                      <strong>S3 URL:</strong> {formData.fileUrl}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={closeModal} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold">Cancel</button>
                  <button 
                    type="submit" 
                    disabled={uploading || !formData.fileUrl} 
                    className={`flex-1 py-3 text-white rounded-xl font-bold transition-all ${uploading || !formData.fileUrl ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#292C44] shadow-lg'}`}
                  >
                    {isEditing ? "Update Entry" : "Save Entry"}
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