import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit2, FiTrash2, FiPlus, FiX, FiVideo, FiExternalLink, FiUploadCloud, FiLink, FiCheckCircle } from 'react-icons/fi';

const IPAudioVisual = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadMode, setUploadMode] = useState('file'); 

  const [formData, setFormData] = useState({ 
    videoId: "", 
    title: "", 
    driveUrl: "", // This is the source of truth for the link
    type: "file" 
  });

  const brandColor = "#292C44";
  const CMS_API = "http://localhost:3000/cms/ipo-av"; 
  const PUBLIC_API = "http://localhost:3000/api/ipo-av";
  const UPLOAD_API = "http://localhost:3000/cms/upload/upload";

  const fetchVideos = async () => {
    try {
      const res = await axios.get(PUBLIC_API);
      setVideos(res.data);
    } catch (err) { console.error("Fetch error:", err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchVideos(); }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      alert("Please select a valid video file.");
      return;
    }

    const data = new FormData();
    data.append("file", file);
    setUploading(true);
    try {
      const res = await axios.post(UPLOAD_API, data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      // Corrected: Updating driveUrl to match the handleSubmit logic
      setFormData((prev) => ({ ...prev, driveUrl: res.data.fileUrl, type: 'file' }));
    } catch (err) {
      alert("S3 Upload Failed.");
    } finally { setUploading(false); }
  };

  // IPAudioVisual.jsx
const handleSubmit = async (e) => {
  e.preventDefault();

  // Basic validation to prevent sending empty data
  if (!formData.driveUrl) {
    alert("Please upload a file or paste a link first.");
    return;
  }

  try {
    await axios.post(`${CMS_API}/upsert`, {
      videoId: isEditing ? formData.videoId : undefined,
      title: formData.title,
      driveUrl: formData.driveUrl, // This value is pushed to videoUrl in the controller
      type: formData.type
    });
    closeModal();
    fetchVideos();
  } catch (err) {
    console.error("Server Response:", err.response?.data);
    alert("Save failed: Check console for field mismatch.");
  }
};

  const handleDelete = async (id) => {
    if (window.confirm("Delete this video?")) {
      try {
        await axios.delete(`${CMS_API}/video/${id}`);
        fetchVideos();
      } catch (err) { alert("Delete failed"); }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setUploadMode('file');
    setFormData({ videoId: "", title: "", driveUrl: "", type: "file" });
  };

  const openEditModal = (video) => {
    setFormData({
      videoId: video._id,
      title: video.title,
      driveUrl: video.driveUrl,
      type: video.type || 'file'
    });
    setUploadMode(video.type || 'file');
    setIsEditing(true);
    setIsModalOpen(true);
  };

  if (loading) return <div className="p-10 text-center font-bold text-gray-400">Loading Gallery...</div>;

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen font-sans text-[#292c44]">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">IPO Audio Visual</h1>
          <p className="text-gray-500 mt-1">Manage cloud-hosted videos and external links</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 text-white px-6 py-3 rounded-lg font-bold shadow-md hover:opacity-90" style={{ backgroundColor: brandColor }}>
          <FiPlus strokeWidth={3} /> Add Video Content
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              <th className="px-8 py-5">Video Title & Type</th>
              <th className="px-8 py-5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {videos.map((video) => (
              <tr key={video._id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-lg ${video.type === 'link' ? 'bg-blue-50 text-blue-500' : 'bg-red-50 text-red-500'}`}>
                      {video.type === 'link' ? <FiLink size={20} /> : <FiVideo size={20} />}
                    </div>
                    <div>
                      <span className="font-bold text-gray-700 block">{video.title}</span>
                      <a href={video.driveUrl} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-gray-400 flex items-center gap-1 mt-1 hover:text-blue-500 uppercase">
                        {video.type === 'link' ? 'External Link' : 'S3 Cloud File'} <FiExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5 text-center">
                  <div className="flex justify-center gap-4">
                    <button onClick={() => openEditModal(video)} className="text-gray-400 hover:text-blue-600"><FiEdit2 size={18}/></button>
                    <button onClick={() => handleDelete(video._id)} className="text-gray-400 hover:text-red-600"><FiTrash2 size={18}/></button>
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
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="px-8 py-6 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold">{isEditing ? "Edit Video" : "Add Video"}</h2>
                <button onClick={closeModal}><FiX /></button>
              </div>

              <div className="px-8 mt-6">
                <div className="flex bg-gray-100 p-1 rounded-xl">
                  <button type="button" onClick={() => {setUploadMode('file'); setFormData({...formData, type: 'file', driveUrl: ''})}} className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all ${uploadMode === 'file' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}>
                    <FiUploadCloud /> Local Upload
                  </button>
                  <button type="button" onClick={() => {setUploadMode('link'); setFormData({...formData, type: 'link', driveUrl: ''})}} className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all ${uploadMode === 'link' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}>
                    <FiLink /> Video Link
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Title</label>
                  <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-gray-50 border rounded-xl px-4 py-3 outline-none focus:border-blue-500" />
                </div>

                {uploadMode === 'file' ? (
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Video File</label>
                    <input type="file" accept="video/*" onChange={handleFileUpload} className="hidden" id="v-up" />
                    <label htmlFor="v-up" className={`w-full flex flex-col items-center py-6 border-2 border-dashed rounded-xl cursor-pointer transition-all ${formData.driveUrl && formData.type === 'file' ? 'bg-green-50 border-green-400' : 'bg-gray-50 border-gray-200'}`}>
                      {uploading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mb-2"></div> : (formData.driveUrl && formData.type === 'file' ? <FiCheckCircle size={24} className="text-green-500 mb-2"/> : <FiUploadCloud size={24} className="text-gray-400 mb-2"/>)}
                      <span className="text-sm font-bold text-gray-500">{uploading ? "Uploading to S3..." : (formData.driveUrl && formData.type === 'file' ? "Video Ready!" : "Choose local video")}</span>
                    </label>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">External URL</label>
                    <input type="url" required value={formData.driveUrl} onChange={(e) => setFormData({...formData, driveUrl: e.target.value, type: 'link'})} className="w-full bg-gray-50 border rounded-xl px-4 py-3 outline-none focus:border-blue-500" placeholder="https://youtube.com/..." />
                  </div>
                )}

                {/* VIDEO PREVIEW SECTION */}
                {formData.driveUrl && formData.type === 'file' && (
                  <div className="rounded-xl overflow-hidden bg-black aspect-video shadow-inner">
                    <video src={formData.driveUrl} controls className="w-full h-full" />
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={closeModal} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold">Cancel</button>
                  <button type="submit" disabled={uploading || !formData.driveUrl} className="flex-1 py-3 text-white rounded-xl font-bold shadow-lg disabled:bg-gray-300 transition-all" style={{ backgroundColor: (uploading || !formData.driveUrl) ? '#D1D5DB' : brandColor }}>
                    Save Record
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

export default IPAudioVisual;