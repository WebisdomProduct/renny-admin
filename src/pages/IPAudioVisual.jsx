import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit2, FiTrash2, FiPlus, FiX, FiVideo, FiExternalLink } from 'react-icons/fi';

const IPAudioVisual = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form State matching your Controller keys
  const [formData, setFormData] = useState({ 
    videoId: "", 
    title: "", 
    driveUrl: "" 
  });

  const brandColor = "#292C44";
  const CMS_API = "http://localhost:3000/cms/ipo-av"; 
  const PUBLIC_API = "http://localhost:3000/api/ipo-av";

  // 1. GET: Fetch existing videos
  const fetchVideos = async () => {
    try {
      const res = await axios.get(PUBLIC_API);
      // Your controller returns pageData.videos directly
      setVideos(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVideos(); }, []);

  // 2. UPSERT: Add or Update Video
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Logic for both new record and update matches upsertIpoVideo
      await axios.post(`${CMS_API}/upsert`, {
        videoId: isEditing ? formData.videoId : undefined,
        title: formData.title,
        driveUrl: formData.driveUrl
      });
      closeModal();
      fetchVideos();
    } catch (err) {
      alert("Error saving IPO video");
    }
  };

  // 3. DELETE: Remove particular video
  const handleDelete = async (id) => {
    if (window.confirm("Permanently delete this IPO video?")) {
      try {
        // Assuming route: router.delete('/record/:videoId', ...)
        await axios.delete(`${CMS_API}/video/${id}`);
        fetchVideos();
        alert("Video removed successfully");
      } catch (err) {
        console.error("Delete Error:", err);
        alert("Failed to delete video.");
      }
    }
  };

  const openEditModal = (video) => {
    setFormData({
      videoId: video._id,
      title: video.title,
      driveUrl: video.driveUrl
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setFormData({ videoId: "", title: "", driveUrl: "" });
  };

  if (loading) return <div className="p-10 text-center animate-pulse text-gray-400 font-bold">Loading Video Gallery...</div>;

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen font-sans">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">IPO Audio Visual</h1>
          <p className="text-gray-500 mt-1">Manage statutory IPO videos and presentations</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 text-white px-6 py-3 rounded-lg font-bold shadow-md hover:opacity-90 transition-all"
          style={{ backgroundColor: brandColor }}
        >
          <FiPlus strokeWidth={3} /> Add New Video
        </button>
      </div>

      {/* VIDEO LIST TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              <th className="px-8 py-5">Video Title</th>
              <th className="px-8 py-5">Uploaded On</th>
              <th className="px-8 py-5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {videos.length > 0 ? videos.map((video) => (
              <tr key={video._id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-gray-100 rounded-lg text-gray-400 group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
                      <FiVideo size={20} />
                    </div>
                    <div>
                      <span className="font-bold text-gray-700 block">{video.title}</span>
                      <a href={video.driveUrl} target="_blank" rel="noreferrer" className="text-[11px] font-bold text-blue-500 flex items-center gap-1 mt-1 hover:underline uppercase tracking-tight">
                        Open Video Link <FiExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5 text-sm text-gray-500">
                  {video.uploadedAt ? new Date(video.uploadedAt).toLocaleDateString() : "N/A"}
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center justify-center gap-4">
                    <button onClick={() => openEditModal(video)} className="p-2 text-gray-400 hover:text-blue-600 transition-all"><FiEdit2 size={18}/></button>
                    <button onClick={() => handleDelete(video._id)} className="p-2 text-gray-400 hover:text-red-600 transition-all"><FiTrash2 size={18}/></button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="3" className="px-8 py-10 text-center text-gray-400 italic">No videos found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL SECTION */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="px-8 py-6 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold">{isEditing ? "Edit Video Info" : "Add New Video"}</h2>
                <button onClick={closeModal}><FiX /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Video Title</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.title} 
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-red-500 transition-colors"
                    placeholder="e.g. DRHP Statutory AV - English" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Google Drive URL</label>
                  <input 
                    type="url" 
                    required 
                    value={formData.driveUrl} 
                    onChange={(e) => setFormData({...formData, driveUrl: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-red-500 transition-colors"
                    placeholder="Paste Drive share link" 
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={closeModal} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold">Cancel</button>
                  <button type="submit" className="flex-1 py-3 text-white rounded-xl font-bold shadow-lg" style={{ backgroundColor: brandColor }}>
                    {isEditing ? "Update Video" : "Save Video"}
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