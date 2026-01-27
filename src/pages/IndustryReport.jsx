import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FiEdit2, FiTrash2, FiPlus, FiX, FiFileText, FiExternalLink, FiUploadCloud } from "react-icons/fi";

const IndustryReport = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false); // Progress state for S3
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [formData, setFormData] = useState({ 
    reportId: "", 
    title: "", 
    url: "" 
  });

  const brandColor = "#292C44";
  const API_BASE = "http://localhost:3000/cms/industry-report"; 
  const PUBLIC_API = "http://localhost:3000/api/industry-report";
  const UPLOAD_API = "http://localhost:3000/cms/upload/upload"; // Consistent S3 route

  const fetchReports = async () => {
    try {
      const res = await axios.get(PUBLIC_API);
      setReports(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  // NEW: Handle Local PDF Upload to S3
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append("file", file); // Must match backend key 'file'

    setUploading(true);
    try {
      const res = await axios.post(UPLOAD_API, data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      // Set the returned S3 URL into the form state automatically
      setFormData((prev) => ({ ...prev, url: res.data.fileUrl }));
      alert("Report uploaded to Amazon S3!");
    } catch (err) {
      console.error(err);
      alert("S3 Upload Failed. Check your AWS configuration.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/upsert`, {
        reportId: isEditing ? formData.reportId : undefined,
        title: formData.title,
        url: formData.url
      });
      closeModal();
      fetchReports();
    } catch (err) {
      alert("Error saving report");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this industry report?")) {
      try {
        await axios.delete(`${API_BASE}/record/${id}`);
        fetchReports();
      } catch (err) {
        alert("Delete failed");
      }
    }
  };

  const openEditModal = (report) => {
    setFormData({
      reportId: report._id,
      title: report.title,
      url: report.url
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setFormData({ reportId: "", title: "", url: "" });
  };

  if (loading) return <div className="p-10 text-center animate-pulse font-bold text-gray-400">Loading Reports...</div>;

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Industry Reports</h1>
          <p className="text-gray-500 mt-1">Manage all market and industry analysis documents</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 text-white px-6 py-3 rounded-lg font-bold shadow-md hover:scale-105 transition-all"
          style={{ backgroundColor: brandColor }}
        >
          <FiPlus strokeWidth={3} /> Add New Report
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              <th className="px-8 py-5">Report Title</th>
              <th className="px-8 py-5">Upload Date</th>
              <th className="px-8 py-5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reports.length > 0 ? reports.map((report) => (
              <tr key={report._id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-gray-100 rounded-lg text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <FiFileText size={20} />
                    </div>
                    <div>
                      <span className="font-bold text-gray-700 block">{report.title}</span>
                      <a href={report.url} target="_blank" rel="noreferrer" className="text-[11px] font-bold text-indigo-500 flex items-center gap-1 mt-1">
                        VIEW DOCUMENT <FiExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5 text-sm text-gray-500 font-medium">
                  {report.uploadedAt ? new Date(report.uploadedAt).toLocaleDateString() : "N/A"}
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center justify-center gap-4">
                    <button onClick={() => openEditModal(report)} className="p-2 text-gray-400 hover:text-blue-600 transition-all"><FiEdit2 size={18}/></button>
                    <button onClick={() => handleDelete(report._id)} className="p-2 text-gray-400 hover:text-red-600 transition-all"><FiTrash2 size={18}/></button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="3" className="px-8 py-10 text-center text-gray-400 italic">No industry reports found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
              <div className="px-8 py-6 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold">{isEditing ? "Edit Industry Report" : "Upload Industry Report"}</h2>
                <button onClick={closeModal}><FiX /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Report Name</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.title} 
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-colors"
                    placeholder="e.g. Annual Industry Review 2025" 
                  />
                </div>

                {/* FILE UPLOAD SECTION */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Upload file</label>
                  <div className="relative">
                    <input 
                      type="file" 
                      accept=".pdf" 
                      onChange={handleFileUpload} 
                      className="hidden" 
                      id="report-upload" 
                    />
                    <label 
                      htmlFor="report-upload" 
                      className={`w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${formData.url ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}
                    >
                      {uploading ? (
                        <span className="text-sm font-bold animate-pulse text-gray-500">Uploading to AWS...</span>
                      ) : (
                        <>
                          <FiUploadCloud className={formData.url ? "text-green-600" : "text-gray-400"} />
                          <span className={`text-sm font-bold ${formData.url ? 'text-green-700' : 'text-gray-500'}`}>
                            {formData.url ? "File Saved in S3" : "Choose file"}
                          </span>
                        </>
                      )}
                    </label>
                  </div>
                  {formData.url && (
                    <p className="mt-2 text-[9px] text-gray-400 break-all p-2 bg-gray-50 rounded">
                      <strong>Preview URL:</strong> {formData.url}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={closeModal} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold">Cancel</button>
                  <button 
                    type="submit" 
                    disabled={uploading || !formData.url}
                    className={`flex-1 py-3 text-white rounded-xl font-bold shadow-lg transition-all ${uploading || !formData.url ? 'bg-gray-300 cursor-not-allowed' : ''}`}
                    style={{ backgroundColor: uploading || !formData.url ? '#D1D5DB' : brandColor }}
                  >
                    {isEditing ? "Update Report" : "Save to Database"}
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

export default IndustryReport;