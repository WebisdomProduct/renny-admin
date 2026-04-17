import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit3, FiImage, FiUploadCloud, FiChevronDown, FiChevronUp, FiLayout, FiX } from 'react-icons/fi';
import { API } from '../config/api';
import { notifySuccess, notifyError } from "../utils/notifications";





const toPageName = (route) => {
  const clean = route.replace(/^\/+|\/+$/g, ''); // strip leading & trailing slashes
  return clean === '' ? 'home' : clean.toLowerCase();
};

const PageSectionsAdmin = () => {
  const CMS_API = API.CMS_PAGE;
  const UPLOAD_API = API.UPLOAD;

  const pages = [
    { route: '/',                        label: '🏠  Home' },
    { route: '/company-overview-2/',      label: '🏢  Company Overview' },
    { route: '/manufacturing-Process/',     label: '🏭  Manufacturing Process' },
    { route: '/quality-standard/',        label: '✅  Quality Standard' },
    { route: '/design-centre/',           label: '🎨  Design Centre' },
    { route: '/ms-billets/',              label: '⚙️  MS Billets' },
    { route: '/wire-rods-2/',             label: '🔩  Wire Rods' },
    { route: '/narrow-hrcoil/',           label: '🔧  Narrow HR Coil' },
    { route: '/erw-pipes-and-tubes/',     label: '🪛  ERW Pipes & Tubes' },
    { route: '/scaffolding-formwork/',    label: '🏗️  Scaffolding & Formwork' },
    { route: '/financials/',              label: '💰  Financials' },
    { route: '/corporate-governance/',    label: '🏛️  Corporate Governance' },
    { route: '/industry-report/',         label: '📊  Industry Report' },
    { route: '/ipo/',                     label: '📈  IPO' },
    { route: '/ipo-audio-visual/',        label: '🎬  IPO Audio Visual' },
    { route: '/share-holding-pattern/',   label: '📋  Shareholding Pattern' },
    { route: '/our-policies/',            label: '📜  Our Policies' },
    { route: '/ec/',                      label: '⚡  EC' },
    { route: '/sustainability/',          label: '🌿  Sustainability' },
    { route: '/news-room/',               label: '📰  News Room' },
    { route: '/blog/',                    label: '✍️  Blog' },
    { route: '/events/',                  label: '🎉  Events' },
    { route: '/contact-us/',              label: '📞  Contact Us' },
    { route: '/careers',                  label: '💼  Careers' },
  ];

  const [selectedPage, setSelectedPage] = useState(pages[0].route);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  // Holds the raw File object chosen by the user; only uploaded to S3 on submit
  const [selectedFile, setSelectedFile] = useState(null);

  const [formData, setFormData] = useState({
    page: '/',
    sectionName: 'Hero Banner',
    mediaUrl: '',
    mediaType: 'image',
    heading: ''
  });

  const fetchSections = async (page) => {
    try {
      const pageName = toPageName(page);
      const res = await axios.get(`${CMS_API}/${encodeURIComponent(pageName)}`);
      // Handle either array response or { success: true, data: [] }
      setSections(res.data.data || res.data || []);
    } catch {
      setSections([]);
    }
  };

  useEffect(() => {
    fetchSections(selectedPage);
    setFormData(prev => ({ ...prev, page: selectedPage }));
    setShowForm(false);
  }, [selectedPage]);

  // Step 1 is deferred to handleSubmit — just capture the file here
  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    // Show the filename as a preview label (mediaUrl stays empty until submit)
    setFormData(prev => ({ ...prev, mediaUrl: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let mediaUrl = formData.mediaUrl;

      // ── Step 1: Upload file to S3 (if a new file was selected) ──────────────
      if (selectedFile) {
        setUploading(true);
        try {
          const uploadData = new FormData();
          uploadData.append('file', selectedFile);
          const uploadRes = await axios.post(UPLOAD_API, uploadData);
          mediaUrl = uploadRes.data.fileUrl;
          if (!mediaUrl) throw new Error('No fileUrl returned from upload.');
        } catch (uploadErr) {
          notifyError('Step 1 Failed: Could not upload file to S3. ' + (uploadErr.response?.data?.message || uploadErr.message));
          return; // Do NOT proceed to Step 2 if upload failed
        } finally {
          setUploading(false);
        }
      }

      // ── Step 2: Save / upsert section in MongoDB ─────────────────────────────
      const pageName    = toPageName(formData.page);
      const sectionName = formData.sectionName.trim();

      const payload = {
        mediaUrl,
        mediaType: formData.mediaType,
        heading:   formData.heading,
      };

      try {
        await axios.put(
          `${CMS_API}/${encodeURIComponent(pageName)}/${encodeURIComponent(sectionName)}`,
          payload
        );
      } catch (saveErr) {
        notifyError('Step 2 Failed: File uploaded to S3 but could NOT save to database. ' + (saveErr.response?.data?.message || saveErr.message));
        return;
      }

      resetForm();
      fetchSections(selectedPage);
      notifySuccess(`Section "${sectionName}" saved successfully for page "${pageName}"!`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (e, item) => {
    e.stopPropagation();
    setFormData({
      page: selectedPage,
      sectionName: item.sectionName || 'Hero Banner',
      mediaUrl: item.mediaUrl || '',
      mediaType: item.mediaType || 'image',
      heading: item.heading || ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ page: selectedPage, sectionName: 'Hero Banner', mediaUrl: '', mediaType: 'image', heading: '' });
    setSelectedFile(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20 font-sans text-[#292c44]">
      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#292c44] rounded-xl flex items-center justify-center text-white shadow-lg">
              <FiLayout size={20} />
            </div>
            <h1 className="text-xl font-bold">Page Sections Admin</h1>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="px-6 py-2.5 rounded-full font-bold text-sm bg-[#292c44] text-white transition-all hover:opacity-90"
          >
            Add/Edit Section
          </button>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 mt-10">
        <div className="mb-8">
          <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">Select Page to Manage</label>
          <select 
            className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#292c44] font-bold text-lg shadow-sm"
            value={selectedPage}
            onChange={(e) => setSelectedPage(e.target.value)}
          >
            {pages.map(p => (
              <option key={p.route} value={p.route}>{p.label}</option>
            ))}
          </select>
        </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={resetForm}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-[#292c44]">Configure Section</h2>
                <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-full transition-all"><FiX size={22}/></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <input className="w-full px-5 py-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-[#292c44]" placeholder="Section Name (e.g. hero, features)" value={formData.sectionName} onChange={(e) => setFormData({...formData, sectionName: e.target.value})} required />
                <input className="w-full px-5 py-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-[#292c44]" placeholder="Heading" value={formData.heading} onChange={(e) => setFormData({...formData, heading: e.target.value})} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select className="px-5 py-4 bg-gray-50 rounded-2xl font-bold outline-none border" value={formData.mediaType} onChange={(e) => setFormData({...formData, mediaType: e.target.value})}>
                    <option value="image">Media: Image</option>
                    <option value="video">Media: Video</option>
                  </select>
                  <div>
                    <label className={`flex items-center justify-between px-5 py-4 bg-gray-50 border rounded-2xl cursor-pointer ${ selectedFile ? 'text-blue-600 border-blue-200' : formData.mediaUrl ? 'text-green-600 border-green-200' : 'text-gray-400' }`}>
                      <input type="file" className="hidden" accept={formData.mediaType === 'image' ? 'image/*' : 'video/*'} onChange={handleMediaUpload} />
                      <span className="truncate">{uploading ? 'Uploading to S3...' : selectedFile ? `✓ ${selectedFile.name}` : formData.mediaUrl ? 'Existing Media (no change)' : 'Upload Media'}</span>
                      <FiUploadCloud />
                    </label>
                    {formData.mediaType === 'image' && (
                      <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wide ml-1 mt-1">⚠ Note: Please upload images in <span className="text-orange-500">WebP</span> format only</p>
                    )}
                  </div>
                </div>
                <button type="submit" disabled={loading || uploading || !formData.sectionName} className="w-full py-4 bg-[#292c44] text-white rounded-2xl font-bold shadow-lg disabled:bg-gray-300">
                  {loading ? "Saving..." : "Save Section"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

        <div className="space-y-6">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">{selectedPage} Sections</h3>
          {sections.map((item, idx) => (
            <div key={item._id || idx} onClick={() => setExpandedId(expandedId === item.sectionName ? null : item.sectionName)} className="bg-white border border-gray-100 rounded-[2.5rem] p-6 cursor-pointer hover:shadow-lg transition-all">
               <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-[#292c44] relative overflow-hidden">
                    <FiImage size={18} className="z-10" />
                    {item.mediaUrl && item.mediaType === 'image' && <img src={item.mediaUrl} className="absolute inset-0 w-full h-full object-cover opacity-30" alt="" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800">{item.sectionName || 'Unnamed Section'}</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase truncate">{item.heading || 'No heading'}</p>
                  </div>
                  {expandedId === item.sectionName ? <FiChevronUp /> : <FiChevronDown />}
               </div>
               
               <AnimatePresence>
                 {expandedId === item.sectionName && (
                   <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-6 pt-6 border-t border-gray-50 overflow-hidden">
                      {item.mediaUrl && (
                        item.mediaType === 'image' 
                          ? <img src={item.mediaUrl} alt="Section Media" className="w-full rounded-2xl bg-gray-50 aspect-video object-cover mb-4 shadow-inner" />
                          : <video src={item.mediaUrl} controls className="w-full rounded-2xl bg-black aspect-video mb-4 shadow-inner" />
                      )}
                      {item.heading && <h5 className="font-bold text-lg mb-6">{item.heading}</h5>}
                      <div className="flex gap-2">
                         <button onClick={(e) => handleEdit(e, item)} className="flex-1 py-2 bg-gray-50 text-blue-600 text-[11px] font-bold rounded-lg uppercase hover:bg-blue-50">Edit</button>
                      </div>
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>
          ))}
          {sections.length === 0 && !loading && (
            <div className="text-center py-10 text-gray-400 font-bold">No sections found for this page.</div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PageSectionsAdmin;
