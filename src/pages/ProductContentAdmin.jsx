import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSave, FiUploadCloud, FiPlus, FiTrash2 } from 'react-icons/fi';
import { API } from '../config/api';
import { notifySuccess, notifyError } from "../utils/notifications";




const ProductContentAdmin = () => {
  const CMS_API = API.CMS_PRODUCT_CONTENT;
  const UPLOAD_API = API.UPLOAD;

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(null);
  const [selectedSlug, setSelectedSlug] = useState('ms-billets');

  const defaultContent = {
    title: '',
    capacity: '',
    description: [''],
    highlights: [{ text: '' }],
    highlightsImage: '',
    manufacturingImage: '',
    manufacturingProcess: [''],
    coreStrengths: [],
    specifications: [],
    applicationsIntro: '',
    applications: []
  };

  const [formData, setFormData] = useState(defaultContent);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${CMS_API}/${selectedSlug}`);
      if (res.data && res.data.data) {
        const d = res.data.data;
        // ensure arrays exist
        setFormData({
          title: d.title || '',
          capacity: d.capacity || '',
          description: d.description?.length ? d.description : [''],
          highlights: d.highlights?.length ? d.highlights : [{ text: '' }],
          highlightsImage: d.highlightsImage || '',
          manufacturingImage: d.manufacturingImage || '',
          manufacturingProcess: d.manufacturingProcess?.length ? d.manufacturingProcess : [''],
          coreStrengths: d.coreStrengths || [],
          specifications: d.specifications || [],
          applicationsIntro: d.applicationsIntro || '',
          applications: d.applications || []
        });
      } else {
        setFormData(defaultContent);
      }
    } catch { notifyError("Unable to complete the request."); } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [selectedSlug]);

  const handleMediaUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append("file", file);
    setUploading(field);

    try {
      const res = await axios.post(UPLOAD_API, data);
      setFormData(prev => ({ ...prev, [field]: res.data.fileUrl }));
      notifySuccess("Image uploaded to S3 successfully!");
    } catch {
      notifyError("S3 Upload Failed.");
    } finally {
      setUploading(null);
    }
  };

  const handleArrayUpload = async (e, arrayName, index, field) => {
    const file = e.target.files[0];
    if (!file) return;
    const data = new FormData();
    data.append("file", file);
    setUploading(`${arrayName}-${index}`);
    try {
      const res = await axios.post(UPLOAD_API, data);
      const newArray = [...formData[arrayName]];
      newArray[index][field] = res.data.fileUrl;
      setFormData(prev => ({ ...prev, [arrayName]: newArray }));
    } catch {
      notifyError("Upload failed.");
    } finally {
      setUploading(null);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put(`${CMS_API}/${selectedSlug}`, formData);
      notifySuccess("Product content synchronized successfully!");
      fetchContent();
    } catch {      notifyError("Error saving data");
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers for string arrays ---
  const handleStringArrayChange = (arrayName, index, value) => {
    const newArr = [...formData[arrayName]];
    newArr[index] = value;
    setFormData({ ...formData, [arrayName]: newArr });
  };
  const addStringArrayItem = (arrayName) => {
    setFormData({ ...formData, [arrayName]: [...formData[arrayName], ''] });
  };
  const removeStringArrayItem = (arrayName, index) => {
    const newArr = formData[arrayName].filter((_, i) => i !== index);
    setFormData({ ...formData, [arrayName]: newArr });
  };

  // --- Handlers for Object arrays ---
  const handleObjectArrayChange = (arrayName, index, field, value) => {
    const newArr = [...formData[arrayName]];
    newArr[index][field] = value;
    setFormData({ ...formData, [arrayName]: newArr });
  }
  const addObjectArrayItem = (arrayName, defaultObj) => {
    setFormData({ ...formData, [arrayName]: [...formData[arrayName], defaultObj] });
  }
  const removeObjectArrayItem = (arrayName, index) => {
    const newArr = formData[arrayName].filter((_, i) => i !== index);
    setFormData({ ...formData, [arrayName]: newArr });
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20 font-sans text-[#292c44]">
      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm mb-10">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <h1 className="text-xl font-bold">Manage Product Pages</h1>
          
          <select 
            value={selectedSlug} 
            onChange={e => setSelectedSlug(e.target.value)}
            className="px-4 py-2 border rounded-lg outline-none font-bold bg-white shadow-sm"
          >
            <option value="ms-billets">MS Billets</option>
            <option value="erw-pipes">ERW Pipes</option>
            <option value="wire-rods">Wire Rods</option>
            <option value="hr-coils">HR Coils</option>
            <option value="scaffolding">Scaffolding</option>
          </select>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] shadow-lg border border-gray-100 p-8 space-y-8">
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="font-bold text-gray-700 block mb-2">Page Title</label>
              <input 
                className="w-full px-5 py-3 bg-gray-50 border rounded-xl outline-none focus:ring-2"
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})} 
                placeholder="e.g. MS Billets"
              />
            </div>
            <div>
              <label className="font-bold text-gray-700 block mb-2">Capacity</label>
              <input 
                className="w-full px-5 py-3 bg-gray-50 border rounded-xl outline-none focus:ring-2"
                value={formData.capacity} 
                onChange={e => setFormData({...formData, capacity: e.target.value})} 
                placeholder="Annualised Capacity: 1,89,000 MTPA"
              />
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
            <div className="flex justify-between items-center mb-2">
               <h3 className="font-bold text-lg">Intro Description (Paragraphs)</h3>
               <button type="button" onClick={() => addStringArrayItem('description')} className="text-sm bg-white border px-3 py-1 rounded-lg font-bold flex items-center gap-1 hover:bg-gray-100"><FiPlus/> Add Paragraph</button>
            </div>
            {formData.description.map((desc, i) => (
              <div key={i} className="flex gap-4">
                <textarea 
                  rows="3" className="w-full bg-white px-5 py-3 border rounded-xl outline-none"
                  value={desc} onChange={e => handleStringArrayChange('description', i, e.target.value)}
                />
                <button type="button" onClick={() => removeStringArrayItem('description', i)} className="text-red-500 hover:text-red-700"><FiTrash2 size={24}/></button>
              </div>
            ))}
          </div>

          {/* ------------- WINDOW HIGHLIGHTS ------------- */}
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
            <h3 className="font-bold text-lg">Window Highlights Section</h3>
            <label className="flex items-center justify-between px-5 py-4 bg-white border border-dashed border-gray-300 rounded-2xl cursor-pointer hover:bg-gray-50">
              <input type="file" className="hidden" accept="image/*" onChange={e => handleMediaUpload(e, 'highlightsImage')} />
              <span>{uploading === 'highlightsImage' ? 'Uploading...' : formData.highlightsImage ? "Highlights Background Uploaded" : "Upload Highlights Background Image"}</span>
              <FiUploadCloud />
            </label>
            <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wide ml-1">⚠ Note: Please upload images in <span className="text-orange-500">WebP</span> format only</p>
            {formData.highlightsImage && <img src={formData.highlightsImage} className="h-20 rounded shadow" alt="Highlights BG" />}

            <div className="mt-4">
               <div className="flex justify-between items-center mb-2">
                 <h4 className="font-bold text-sm text-gray-500 uppercase">Highlight Text Items</h4>
                 <button type="button" onClick={() => addObjectArrayItem('highlights', {text:''})} className="text-xs bg-white border px-2 py-1 rounded-lg font-bold flex items-center gap-1">Add Item</button>
               </div>
               {formData.highlights.map((item, i) => (
                 <div key={i} className="flex gap-4 mb-2">
                   <input className="w-full bg-white px-4 py-2 border rounded-lg" value={item.text} onChange={e => handleObjectArrayChange('highlights', i, 'text', e.target.value)} placeholder="E.g. High-Capacity Melting" />
                   <button type="button" onClick={() => removeObjectArrayItem('highlights', i)} className="text-red-500"><FiTrash2 size={20}/></button>
                 </div>
               ))}
            </div>
          </div>

          {/* ------------- MANUFACTURING ------------- */}
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
            <h3 className="font-bold text-lg">Manufacturing Process</h3>
            <label className="flex items-center justify-between px-5 py-4 bg-white border border-dashed border-gray-300 rounded-2xl cursor-pointer hover:bg-gray-50">
              <input type="file" className="hidden" accept="image/*" onChange={e => handleMediaUpload(e, 'manufacturingImage')} />
              <span>{uploading==='manufacturingImage' ? 'Uploading...' : formData.manufacturingImage ? "Process Image Uploaded" : "Upload Manufacturing Process Image"}</span>
              <FiUploadCloud />
            </label>
            <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wide ml-1">⚠ Note: Please upload images in <span className="text-orange-500">WebP</span> format only</p>
            {formData.manufacturingImage && <img src={formData.manufacturingImage} className="h-20 rounded shadow" alt="Manufacturing" />}

            <div className="mt-4">
               <div className="flex justify-between items-center mb-2">
                 <h4 className="font-bold text-sm text-gray-500 uppercase">Process Paragraphs</h4>
                 <button type="button" onClick={() => addStringArrayItem('manufacturingProcess')} className="text-xs bg-white border px-2 py-1 rounded-lg font-bold flex items-center gap-1">Add Paragraph</button>
               </div>
               {formData.manufacturingProcess.map((desc, i) => (
                 <div key={i} className="flex gap-4 mb-2">
                   <textarea rows="2" className="w-full bg-white px-4 py-2 border rounded-lg" value={desc} onChange={e => handleStringArrayChange('manufacturingProcess', i, e.target.value)} />
                   <button type="button" onClick={() => removeStringArrayItem('manufacturingProcess', i)} className="text-red-500"><FiTrash2 size={20}/></button>
                 </div>
               ))}
            </div>
          </div>

          {/* ------------- CORE STRENGTHS ------------- */}
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
             <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-lg">Core Strengths (Grid Cards)</h3>
                 <button type="button" onClick={() => addObjectArrayItem('coreStrengths', {title:'', desc:'', img:''})} className="text-sm bg-white border px-3 py-1 rounded-lg font-bold flex items-center gap-1 hover:bg-gray-100"><FiPlus/> Add Card</button>
             </div>
             
             {formData.coreStrengths.map((item, i) => (
               <div key={i} className="p-4 bg-white border rounded-xl relative mb-4">
                  <button type="button" onClick={() => removeObjectArrayItem('coreStrengths', i)} className="absolute top-4 right-4 text-red-500"><FiTrash2 size={18}/></button>
                  <div className="grid grid-cols-[100px_1fr] gap-4">
                     <label className="flex flex-col items-center justify-center p-2 border border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <input type="file" className="hidden" accept="image/*" onChange={(e)=>handleArrayUpload(e, 'coreStrengths', i, 'img')} />
                        {uploading === `coreStrengths-${i}` ? <span className="text-xs">Upl...</span> : item.img ? <img src={item.img} className="h-10 object-contain"/> : <FiUploadCloud size={24} className="text-gray-400" />}
                        <span className="text-[7px] font-bold text-orange-400 uppercase text-center leading-tight mt-1">WebP only</span>
                     </label>
                     <div className="space-y-2">
                       <input className="w-full px-3 py-2 border rounded shadow-sm text-sm" placeholder="Card Title" value={item.title} onChange={e => handleObjectArrayChange('coreStrengths', i, 'title', e.target.value)} />
                       <textarea rows="2" className="w-full px-3 py-2 border rounded shadow-sm text-sm" placeholder="Card Description" value={item.desc} onChange={e => handleObjectArrayChange('coreStrengths', i, 'desc', e.target.value)} />
                     </div>
                  </div>
               </div>
             ))}
          </div>

          {/* ------------- SPECIFICATIONS ------------- */}
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
             <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-lg">Specifications (Table)</h3>
                 <button type="button" onClick={() => addObjectArrayItem('specifications', {parameter:'', details:''})} className="text-sm bg-white border px-3 py-1 rounded-lg font-bold flex items-center gap-1 hover:bg-gray-100"><FiPlus/> Add Spec</button>
             </div>
             
             {formData.specifications.map((item, i) => (
               <div key={i} className="flex gap-4 mb-2">
                 <input className="w-1/3 bg-white px-4 py-2 border rounded-lg" value={item.parameter} onChange={e=>handleObjectArrayChange('specifications', i, 'parameter', e.target.value)} placeholder="Parameter (e.g. Cross-Section)" />
                 <input className="w-2/3 bg-white px-4 py-2 border rounded-lg" value={item.details} onChange={e=>handleObjectArrayChange('specifications', i, 'details', e.target.value)} placeholder="Details" />
                 <button type="button" onClick={() => removeObjectArrayItem('specifications', i)} className="text-red-500"><FiTrash2 size={24}/></button>
               </div>
             ))}
          </div>

          {/* ------------- APPLICATIONS ------------- */}
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
            <h3 className="font-bold text-lg">Applications</h3>
            <textarea 
              rows="2" className="w-full px-5 py-3 border rounded-xl outline-none mb-4"
              value={formData.applicationsIntro} onChange={e => setFormData({...formData, applicationsIntro: e.target.value})} 
              placeholder="Applications integration text..."
            />
             
            <div className="flex justify-between items-center mb-4">
                 <h4 className="font-bold text-sm text-gray-500 uppercase">Industries Grid</h4>
                 <button type="button" onClick={() => addObjectArrayItem('applications', {label:'', img:''})} className="text-xs bg-white border px-2 py-1 rounded-lg font-bold flex items-center gap-1 hover:bg-gray-100"><FiPlus/> Add Industry</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {formData.applications.map((item, i) => (
                <div key={i} className="p-3 bg-white border rounded-xl flex items-center gap-3">
                    <label className="w-12 h-14 flex flex-col items-center justify-center border border-dashed rounded cursor-pointer bg-gray-50 hover:bg-gray-100 flex-shrink-0">
                        <input type="file" className="hidden" accept="image/*" onChange={(e)=>handleArrayUpload(e, 'applications', i, 'img')} />
                        {uploading === `applications-${i}` ? <span className="text-[10px]">..</span> : item.img ? <img src={item.img} className="h-6 object-contain"/> : <FiUploadCloud size={16} className="text-gray-400" />}
                        <span className="text-[7px] font-bold text-orange-400 uppercase leading-tight mt-0.5">webp</span>
                    </label>
                    <input className="w-full px-3 py-2 border rounded text-sm" value={item.label} onChange={e=>handleObjectArrayChange('applications', i, 'label', e.target.value)} placeholder="Industry Name" />
                    <button type="button" onClick={() => removeObjectArrayItem('applications', i)} className="text-red-500"><FiTrash2 size={16}/></button>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 mt-6 bg-[#292c44] text-white rounded-2xl font-bold shadow-lg disabled:bg-gray-400">
             <FiSave className="inline mr-2" />
             {loading ? "Saving..." : "Save Product Pages Content"}
          </button>
        </form>
      </main>
    </div>
  );
};

export default ProductContentAdmin;
