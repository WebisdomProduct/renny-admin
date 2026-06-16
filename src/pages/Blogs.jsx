import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiEdit3, FiTrash2, FiFileText, FiType, FiList,
  FiChevronDown, FiChevronUp, FiChevronRight, FiImage, FiX, FiLayers, FiCalendar, FiHash, FiUploadCloud, FiGrid
} from 'react-icons/fi';
import { API } from '../config/api';
import { notifySuccess, notifyError } from "../utils/notifications";




const BlogAdmin = () => {
  const CMS_API = API.CMS_BLOGS;
  const UPLOAD_API = API.UPLOAD;

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    mainImage: '',
    status: 'draft',
    date: '', // Managed "Display Date"
    bodySections: [],
    seoTitle: '',
    seoDescription: '',
    seoKeywords: ''
  });

  useEffect(() => { fetchBlogs(); }, []);

  const fetchBlogs = async () => {
    try {
      const res = await axios.get(`${CMS_API}?role=admin`);
      setBlogs(res.data.data || []);
    } catch { notifyError("Unable to load blog posts."); }
  };

  const handleMainImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const data = new FormData();
    data.append("file", file);
    setUploading(true);
    try {
      const res = await axios.post(UPLOAD_API, data);
      setFormData({ ...formData, mainImage: res.data.fileUrl });
    } catch {
      notifyError("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSectionImageUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    const data = new FormData();
    data.append("file", file);
    try {
      const res = await axios.post(UPLOAD_API, data);
      const updated = [...formData.bodySections];
      updated[index].image = res.data.fileUrl;
      setFormData({ ...formData, bodySections: updated });
    } catch {
      notifyError("Section image upload failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.seoTitle && formData.seoTitle.length > 70) {
      notifyError("SEO Title cannot exceed 70 characters.");
      return;
    }
    if (formData.seoDescription && formData.seoDescription.length > 160) {
      notifyError("SEO Description cannot exceed 160 characters.");
      return;
    }

    setLoading(true);

    const payload = {
      ...formData,
      date: formData.date ? new Date(formData.date) : new Date(), // Fallback to now
      publishedAt: formData.date ? new Date(formData.date) : new Date() // Syncing both for consistency
    };

    try {
      if (isEditing) {
        await axios.put(`${CMS_API}/${editingId}`, payload);
      } else {
        await axios.post(CMS_API, payload);
      }
      resetForm();
      fetchBlogs();
      notifySuccess("Blog synchronized successfully!");
    } catch (err) {
      notifyError(`Error: ${err.response?.data?.message || "Server Error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (e, blog) => {
    e.stopPropagation();
    setFormData({
      title: blog.title,
      excerpt: blog.excerpt,
      mainImage: blog.mainImage,
      status: blog.status,
      date: blog.date ? new Date(blog.date).toISOString().split('T')[0] : '',
      seoTitle: blog.seoTitle || '',
      seoDescription: blog.seoDescription || '',
      seoKeywords: blog.seoKeywords || '',
      bodySections: (blog.bodySections || []).map(sec => {
        if (sec.type === 'table' && !sec.table) {
          return { ...sec, table: { headers: ['Column 1'], rows: [['']] } };
        }
        if (sec.type && sec.type.includes('list') && sec.listItems) {
          return {
            ...sec,
            listItems: sec.listItems.map(item => ({
              ...item,
              descriptions: item.descriptions && item.descriptions.length > 0
                ? item.descriptions
                : [item.description || '']
            }))
          };
        }
        return sec;
      })
    });
    setEditingId(blog._id);
    setIsEditing(true);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      excerpt: '',
      mainImage: '',
      status: 'draft',
      date: '',
      bodySections: [],
      seoTitle: '',
      seoDescription: '',
      seoKeywords: ''
    });
    setIsEditing(false);
    setEditingId(null);
    setShowForm(false);
  };

  const addSection = (type, insertIndex = null) => {
    const newSection = {
      type,
      content: '',
      image: type === 'image' ? '' : undefined,
      listItems: type.includes('list') ? [{ title: '', description: '', descriptions: [''] }] : [],
      table: type === 'table' ? { headers: ['Column 1'], rows: [['']] } : undefined
    };
    if (insertIndex !== null) {
      const updated = [...formData.bodySections];
      updated.splice(insertIndex, 0, newSection);
      setFormData({ ...formData, bodySections: updated });
    } else {
      setFormData({ ...formData, bodySections: [...formData.bodySections, newSection] });
    }
  };

  const moveSectionUp = (index) => {
    if (index === 0) return;
    const updated = [...formData.bodySections];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    setFormData({ ...formData, bodySections: updated });
  };

  const moveSectionDown = (index) => {
    if (index === formData.bodySections.length - 1) return;
    const updated = [...formData.bodySections];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    setFormData({ ...formData, bodySections: updated });
  };

  const updateSection = (index, value) => {
    const updated = [...formData.bodySections];
    updated[index] = { ...updated[index], content: value };
    setFormData({ ...formData, bodySections: updated });
  };

  const removeSection = (index) => {
    setFormData({ ...formData, bodySections: formData.bodySections.filter((_, i) => i !== index) });
  };

  const updateListItem = (sIdx, lIdx, field, value) => {
    const updated = [...formData.bodySections];
    const section = { ...updated[sIdx], listItems: [...updated[sIdx].listItems] };
    section.listItems[lIdx] = { ...section.listItems[lIdx], [field]: value };
    updated[sIdx] = section;
    setFormData({ ...formData, bodySections: updated });
  };

  const addListItem = (sIdx) => {
    const updated = [...formData.bodySections];
    const section = { ...updated[sIdx], listItems: [...updated[sIdx].listItems] };
    section.listItems.push({ title: '', description: '', descriptions: [''] });
    updated[sIdx] = section;
    setFormData({ ...formData, bodySections: updated });
  };

  const removeListItem = (sIdx, lIdx) => {
    const updated = [...formData.bodySections];
    const section = { ...updated[sIdx], listItems: updated[sIdx].listItems.filter((_, i) => i !== lIdx) };
    updated[sIdx] = section;
    setFormData({ ...formData, bodySections: updated });
  };

  const updateListDescription = (sIdx, lIdx, dIdx, value) => {
    const updated = [...formData.bodySections];
    const section = { ...updated[sIdx], listItems: [...updated[sIdx].listItems] };
    const item = { ...section.listItems[lIdx] };
    const descs = [...(item.descriptions || [item.description || ''])];
    descs[dIdx] = value;
    item.descriptions = descs;
    item.description = descs[0] || '';
    section.listItems[lIdx] = item;
    updated[sIdx] = section;
    setFormData({ ...formData, bodySections: updated });
  };

  const addListDescription = (sIdx, lIdx) => {
    const updated = [...formData.bodySections];
    const section = { ...updated[sIdx], listItems: [...updated[sIdx].listItems] };
    const item = { ...section.listItems[lIdx] };
    const descs = [...(item.descriptions || [item.description || ''])];
    descs.push('');
    item.descriptions = descs;
    section.listItems[lIdx] = item;
    updated[sIdx] = section;
    setFormData({ ...formData, bodySections: updated });
  };

  const removeListDescription = (sIdx, lIdx, dIdx) => {
    const updated = [...formData.bodySections];
    const section = { ...updated[sIdx], listItems: [...updated[sIdx].listItems] };
    const item = { ...section.listItems[lIdx] };
    let descs = [...(item.descriptions || [item.description || ''])];
    if (descs.length <= 1) return;
    descs = descs.filter((_, i) => i !== dIdx);
    item.descriptions = descs;
    item.description = descs[0] || '';
    section.listItems[lIdx] = item;
    updated[sIdx] = section;
    setFormData({ ...formData, bodySections: updated });
  };

  // Table Helpers
  const addTableColumn = (sectionIndex) => {
    const updatedSections = [...formData.bodySections];
    const section = { ...updatedSections[sectionIndex] };
    const tableData = { ...section.table, headers: [...section.table.headers], rows: section.table.rows.map(row => [...row]) };
    tableData.headers.push(`Column ${tableData.headers.length + 1}`);
    tableData.rows = tableData.rows.map(row => { row.push(''); return row; });
    section.table = tableData;
    updatedSections[sectionIndex] = section;
    setFormData({ ...formData, bodySections: updatedSections });
  };

  const removeTableColumn = (sectionIndex, colIdx) => {
    const updatedSections = [...formData.bodySections];
    const section = { ...updatedSections[sectionIndex] };
    const tableData = { ...section.table, headers: [...section.table.headers], rows: section.table.rows.map(row => [...row]) };
    if (tableData.headers.length <= 1) return;
    tableData.headers = tableData.headers.filter((_, i) => i !== colIdx);
    tableData.rows = tableData.rows.map(row => row.filter((_, i) => i !== colIdx));
    section.table = tableData;
    updatedSections[sectionIndex] = section;
    setFormData({ ...formData, bodySections: updatedSections });
  };

  const updateTableHeader = (sectionIndex, colIdx, val) => {
    const updatedSections = [...formData.bodySections];
    const section = { ...updatedSections[sectionIndex] };
    const tableData = { ...section.table, headers: [...section.table.headers] };
    tableData.headers[colIdx] = val;
    section.table = tableData;
    updatedSections[sectionIndex] = section;
    setFormData({ ...formData, bodySections: updatedSections });
  };

  const addTableRow = (sectionIndex) => {
    const updatedSections = [...formData.bodySections];
    const section = { ...updatedSections[sectionIndex] };
    const tableData = { ...section.table, rows: [...section.table.rows] };
    tableData.rows.push(new Array(section.table.headers.length).fill(''));
    section.table = tableData;
    updatedSections[sectionIndex] = section;
    setFormData({ ...formData, bodySections: updatedSections });
  };

  const removeTableRow = (sectionIndex, rowIdx) => {
    const updatedSections = [...formData.bodySections];
    const section = { ...updatedSections[sectionIndex] };
    const tableData = { ...section.table, rows: section.table.rows.filter((_, i) => i !== rowIdx) };
    section.table = tableData;
    updatedSections[sectionIndex] = section;
    setFormData({ ...formData, bodySections: updatedSections });
  };

  const updateTableCell = (sectionIndex, rowIdx, colIdx, val) => {
    const updatedSections = [...formData.bodySections];
    const section = { ...updatedSections[sectionIndex] };
    const tableData = { ...section.table, rows: [...section.table.rows] };
    const newRow = [...tableData.rows[rowIdx]];
    newRow[colIdx] = val;
    tableData.rows[rowIdx] = newRow;
    section.table = tableData;
    updatedSections[sectionIndex] = section;
    setFormData({ ...formData, bodySections: updatedSections });
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Delete this article permanently?")) return;
    try {
      await axios.delete(`${CMS_API}/${id}`);
      fetchBlogs();
    } catch { notifyError("Delete failed"); }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20 font-helvetica text-[#292c44]">
      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#292c44] rounded-xl flex items-center justify-center text-white shadow-lg">
            <FiFileText size={20} />
          </div>
          <h1 className="text-xl font-poppins font-bold">Blog Studio</h1>
        </div>
        <button onClick={() => (showForm ? resetForm() : setShowForm(true))} className="bg-[#292c44] text-white px-6 py-2.5 rounded-full font-bold shadow-lg hover:scale-105 transition-all">
          {showForm ? 'Cancel Edit' : 'Create Article'}
        </button>
      </nav>

      {/* Full-screen slide-in form panel */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-50 bg-[#F9FAFB] overflow-y-auto"
          >
            <div className="max-w-4xl mx-auto px-6 py-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-[#292c44]">{isEditing ? '⚡ Update Article' : '📝 New Article'}</h2>
                <button onClick={resetForm} className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-full font-bold hover:bg-gray-200 transition-all">✕ Close</button>
              </div>
              <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl p-10">
                <form onSubmit={handleSubmit} className="space-y-8">{/* form content below */}
                  <div className="space-y-4">
                    <input className="w-full p-5 bg-gray-50 rounded-2xl outline-none text-2xl font-bold font-poppins border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-[#292c44]" placeholder="Article Title..." value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                    <textarea className="w-full p-5 bg-gray-50 rounded-2xl outline-none ring-1 ring-gray-100" placeholder="Brief summary for cards..." rows="2" value={formData.excerpt} onChange={e => setFormData({ ...formData, excerpt: e.target.value })} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Main Image Upload */}
                      <div className="relative group">
                        <input type="file" id="main-up" className="hidden" onChange={handleMainImageUpload} accept="image/*" />
                        <label htmlFor="main-up" className={`w-full p-4 flex items-center justify-between bg-gray-50 rounded-2xl outline-none ring-1 ring-gray-100 cursor-pointer hover:bg-gray-100 transition-all ${formData.mainImage ? 'text-green-600' : 'text-gray-400'}`}>
                          <span className="truncate max-w-[150px]">{uploading ? "Uploading..." : formData.mainImage ? "Image Ready" : "Upload Main Image"}</span>
                          <FiUploadCloud size={18} />
                        </label>
                        {formData.mainImage && <img src={formData.mainImage} className="absolute -top-12 right-0 w-12 h-12 rounded-lg border-2 border-white shadow-md group-hover:scale-150 transition-all" />}
                        <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wide ml-1 mt-1">⚠ Note: Please upload images in <span className="text-orange-500">WebP</span> format only</p>
                      </div>

                      {/* Display Date Only */}
                      <div className="relative">
                        <label className="absolute -top-6 left-2 text-[10px] font-black uppercase text-gray-300">Display Date</label>
                        <input type="date" className="w-full p-4 bg-gray-50 rounded-2xl outline-none ring-1 ring-gray-100 text-gray-500 font-bold" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                        <span className="absolute right-4 top-4 text-gray-300 pointer-events-none"><FiCalendar /></span>
                      </div>
                    </div>
                  </div>

                  {/* SEO Metadata Section */}
                  <div className="space-y-6 border-t pt-8">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#292c44]/5 flex items-center justify-center text-[#292c44]">
                        <FiLayers size={16} />
                      </div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-[#292c44]">SEO Metadata</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <input
                          type="text"
                          maxLength={70}
                          className="w-full p-4 bg-gray-50 rounded-2xl outline-none ring-1 ring-gray-100 focus:ring-2 focus:ring-[#292c44] text-sm font-medium"
                          placeholder="Search engine title..."
                          value={formData.seoTitle || ''}
                          onChange={e => setFormData({ ...formData, seoTitle: e.target.value })}
                        />
                        <div className="flex justify-between items-center px-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">SEO Title</label>
                          <span className={`text-[10px] font-bold ${(formData.seoTitle || '').length >= 70 ? 'text-red-500 font-black' : 'text-gray-400'}`}>
                            {(formData.seoTitle || '').length} / 70
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <input
                          type="text"
                          maxLength={160}
                          className="w-full p-4 bg-gray-50 rounded-2xl outline-none ring-1 ring-gray-100 focus:ring-2 focus:ring-[#292c44] text-sm font-medium"
                          placeholder="Brief description for search engines..."
                          value={formData.seoDescription || ''}
                          onChange={e => setFormData({ ...formData, seoDescription: e.target.value })}
                        />
                        <div className="flex justify-between items-center px-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">SEO Description</label>
                          <span className={`text-[10px] font-bold ${(formData.seoDescription || '').length >= 160 ? 'text-red-500 font-black' : 'text-gray-400'}`}>
                            {(formData.seoDescription || '').length} / 160
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <input
                          type="text"
                          className="w-full p-4 bg-gray-50 rounded-2xl outline-none ring-1 ring-gray-100 focus:ring-2 focus:ring-[#292c44] text-sm font-medium"
                          placeholder="comma, separated, keywords..."
                          value={formData.seoKeywords || ''}
                          onChange={e => setFormData({ ...formData, seoKeywords: e.target.value })}
                        />
                        <div className="flex justify-between items-center px-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">SEO Keywords</label>
                          <span className={`text-[10px] font-bold text-gray-400`}>
                            {(formData.seoKeywords || '').length} characters
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b pb-4">
                      <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Content Builder</h3>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => addSection('heading')} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl hover:bg-gray-100 text-xs font-bold"><FiType /> Heading</button>
                        <button type="button" onClick={() => addSection('sub-heading')} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl hover:bg-gray-100 text-xs font-bold"><FiEdit3 /> Sub Heading</button>
                        <button type="button" onClick={() => addSection('sub-point')} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl hover:bg-gray-100 text-xs font-bold"><FiChevronRight /> Sub Point</button>
                        <button type="button" onClick={() => addSection('paragraph')} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl hover:bg-gray-100 text-xs font-bold"><FiLayers /> Paragraph</button>
                        <button type="button" onClick={() => addSection('image')} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl hover:bg-gray-100 text-xs font-bold"><FiImage /> Image</button>
                        <button type="button" onClick={() => addSection('bullet-list')} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl hover:bg-gray-100 text-xs font-bold"><FiList /> Points</button>
                        <button type="button" onClick={() => addSection('numbered-list')} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl hover:bg-gray-100 text-xs font-bold"><FiHash /> Numbers</button>
                        <button type="button" onClick={() => addSection('table')} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl hover:bg-gray-100 text-xs font-bold"><FiGrid /> Table</button>
                      </div>
                    </div>

                    {formData.bodySections.map((section, sIndex) => (
                      <React.Fragment key={sIndex}>
                        {/* Insert Section Toolbar */}
                        <div className="flex justify-center -my-3 relative z-10 opacity-0 hover:opacity-100 focus-within:opacity-100 transition-all duration-300 h-6 items-center group/insert">
                          <div className="w-full absolute h-[1px] bg-blue-100 top-1/2 -z-10 hidden group-hover/insert:block"></div>
                          <div className="bg-white border border-gray-200 shadow-md rounded-full px-3 py-1 flex gap-2 items-center scale-90 hover:scale-100 transition-transform">
                            <span className="text-[10px] font-bold text-gray-400 mr-1">INSERT:</span>
                            <button type="button" onClick={() => addSection('heading', sIndex)} className="p-1 hover:bg-blue-50 hover:text-blue-600 rounded text-gray-400" title="Heading"><FiType size={14} /></button>
                            <button type="button" onClick={() => addSection('sub-heading', sIndex)} className="p-1 hover:bg-blue-50 hover:text-blue-600 rounded text-gray-400" title="Sub Heading"><FiEdit3 size={14} /></button>
                            <button type="button" onClick={() => addSection('sub-point', sIndex)} className="p-1 hover:bg-blue-50 hover:text-blue-600 rounded text-gray-400" title="Sub Point"><FiChevronRight size={14} /></button>
                            <button type="button" onClick={() => addSection('paragraph', sIndex)} className="p-1 hover:bg-blue-50 hover:text-blue-600 rounded text-gray-400" title="Paragraph"><FiLayers size={14} /></button>
                            <button type="button" onClick={() => addSection('image', sIndex)} className="p-1 hover:bg-blue-50 hover:text-blue-600 rounded text-gray-400" title="Image"><FiImage size={14} /></button>
                            <button type="button" onClick={() => addSection('bullet-list', sIndex)} className="p-1 hover:bg-blue-50 hover:text-blue-600 rounded text-gray-400" title="Points"><FiList size={14} /></button>
                            <button type="button" onClick={() => addSection('numbered-list', sIndex)} className="p-1 hover:bg-blue-50 hover:text-blue-600 rounded text-gray-400" title="Numbers"><FiHash size={14} /></button>
                            <button type="button" onClick={() => addSection('table', sIndex)} className="p-1 hover:bg-blue-50 hover:text-blue-600 rounded text-gray-400" title="Table"><FiGrid size={14} /></button>
                          </div>
                        </div>

                        <div className="relative p-6 bg-gray-50/50 rounded-3xl border border-gray-100 group">
                          {/* Section Actions */}
                          <div className="absolute -top-3 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-all z-10">
                            {sIndex > 0 && (
                              <button type="button" onClick={() => moveSectionUp(sIndex)} className="w-8 h-8 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center shadow-sm hover:bg-blue-100" title="Move Up"><FiChevronUp size={16} /></button>
                            )}
                            {sIndex < formData.bodySections.length - 1 && (
                              <button type="button" onClick={() => moveSectionDown(sIndex)} className="w-8 h-8 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center shadow-sm hover:bg-blue-100" title="Move Down"><FiChevronDown size={16} /></button>
                            )}
                            <button type="button" onClick={() => removeSection(sIndex)} className="w-8 h-8 bg-red-50 text-red-500 rounded-full flex items-center justify-center shadow-sm hover:bg-red-100 ml-2" title="Remove Section"><FiX size={14} /></button>
                          </div>

                          {section.type === 'image' ? (
                            <div className="space-y-4 flex flex-col items-center">
                              <input type="file" id={`sec-up-${sIndex}`} className="hidden" onChange={(e) => handleSectionImageUpload(e, sIndex)} accept="image/*" />
                              <label htmlFor={`sec-up-${sIndex}`} className={`w-full max-w-sm flex flex-col items-center justify-center py-8 border-2 border-dashed rounded-3xl cursor-pointer transition-all ${section.image ? 'bg-white border-green-200' : 'bg-gray-50'}`}>
                                {section.image ? (
                                  <img src={section.image} className="max-h-40 rounded-xl shadow-sm mb-2" />
                                ) : (
                                  <FiUploadCloud size={24} className="text-gray-300 mb-2" />
                                )}
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                  {section.image ? "Change Image" : "Upload Section Image"}
                                </span>
                              </label>
                              <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wide">⚠ Note: Please upload images in <span className="text-orange-500">WebP</span> format only</p>
                              <input className="w-full bg-transparent text-center text-xs text-gray-400 outline-none italic" placeholder="Image Caption (Optional)" value={section.content} onChange={(e) => updateSection(sIndex, e.target.value)} />
                            </div>
                          ) : (section.type === 'heading' || section.type === 'sub-heading' || section.type === 'sub-point' || section.type === 'paragraph') ? (
                            <textarea className={`w-full bg-transparent outline-none ${section.type === 'heading' ? 'text-lg font-bold' : section.type === 'sub-heading' ? 'text-base font-semibold text-gray-800' : section.type === 'sub-point' ? 'text-sm font-normal text-gray-600 leading-none' : 'text-sm text-gray-600'}`} value={section.content} onChange={(e) => updateSection(sIndex, e.target.value)} rows={section.type === 'heading' || section.type === 'sub-heading' ? 1 : section.type === 'sub-point' ? 2 : 4} placeholder={`Enter ${section.type}...`} />
                          ) : (section.type === 'table' && section.table) ? (
                            <div className="space-y-4 overflow-x-auto">
                              <div className="flex gap-2 mb-4">
                                {section.table.headers.map((header, idx) => (
                                  <div key={`th-${sIndex}-${idx}`} className="flex-1 min-w-[150px] relative group">
                                    <input
                                      value={header}
                                      onChange={(e) => updateTableHeader(sIndex, idx, e.target.value)}
                                      className="w-full p-3 bg-gray-100 border border-gray-200 text-gray-800 rounded-xl text-center text-xs font-bold outline-none placeholder-gray-400 focus:ring-2 focus:ring-[#292c44]"
                                      placeholder="Header Name"
                                    />
                                    <button type="button" onClick={() => removeTableColumn(sIndex, idx)} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-all">×</button>
                                  </div>
                                ))}
                                <button type="button" onClick={() => addTableColumn(sIndex)} className="w-10 flex items-center justify-center bg-gray-200 rounded-xl hover:bg-gray-300 transition-all text-gray-500">+</button>
                              </div>
                              <div className="space-y-2">
                                {section.table.rows.map((row, rIdx) => (
                                  <div key={`tr-${sIndex}-${rIdx}`} className="flex gap-2 items-center group">
                                    {row.map((cell, cIdx) => (
                                      <input
                                        key={`td-${sIndex}-${rIdx}-${cIdx}`}
                                        value={cell}
                                        onChange={(e) => updateTableCell(sIndex, rIdx, cIdx, e.target.value)}
                                        className="flex-1 min-w-[150px] p-3 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 outline-none focus:border-[#292c44]"
                                        placeholder="..."
                                      />
                                    ))}
                                    <div className="w-10 flex justify-center opacity-0 group-hover:opacity-100">
                                      <button type="button" onClick={() => removeTableRow(sIndex, rIdx)} className="text-red-300 hover:text-red-500"><FiTrash2 size={14} /></button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <button type="button" onClick={() => addTableRow(sIndex)} className="mt-4 w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-xs font-bold text-gray-400 hover:border-[#292c44] hover:text-[#292c44] transition-all">
                                + Add Row
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {section.listItems.map((item, lIndex) => (
                                <div key={lIndex} className="flex gap-2 items-start pl-4 border-l-2 border-[#292c44]/20">
                                  <div className="flex-1 grid grid-cols-1 gap-2">
                                    <input className="bg-transparent font-bold text-sm outline-none" placeholder="Item Title" value={item.title} onChange={(e) => updateListItem(sIndex, lIndex, 'title', e.target.value)} />
                                    <div className="space-y-2 pl-2 border-l border-gray-100">
                                      {(item.descriptions || [item.description || '']).map((desc, dIndex) => (
                                        <div key={dIndex} className="flex gap-2 items-center">
                                          <span className="text-[10px] text-gray-400 font-bold">{dIndex + 1}.</span>
                                          <textarea 
                                            className="flex-1 bg-transparent text-xs text-gray-500 outline-none" 
                                            placeholder={`Description ${dIndex + 1} (Optional)`} 
                                            value={desc} 
                                            onChange={(e) => updateListDescription(sIndex, lIndex, dIndex, e.target.value)} 
                                            rows="1" 
                                          />
                                          {(item.descriptions || [item.description || '']).length > 1 && (
                                            <button 
                                              type="button" 
                                              onClick={() => removeListDescription(sIndex, lIndex, dIndex)} 
                                              className="text-red-300 hover:text-red-500 p-1" 
                                              title="Remove Description"
                                            >
                                              <FiX size={12} />
                                            </button>
                                          )}
                                        </div>
                                      ))}
                                      <button 
                                        type="button" 
                                        onClick={() => addListDescription(sIndex, lIndex)} 
                                        className="text-[10px] font-bold text-blue-500 hover:text-blue-700 uppercase tracking-wider"
                                      >
                                        + Add Description Paragraph
                                      </button>
                                    </div>
                                  </div>
                                  <button type="button" onClick={() => removeListItem(sIndex, lIndex)} className="text-red-300 hover:text-red-500 mt-1" title="Remove Item"><FiTrash2 size={14} /></button>
                                </div>
                              ))}
                              <button type="button" onClick={() => addListItem(sIndex)} className="text-[10px] font-black text-blue-600 uppercase tracking-widest">+ Add New Item</button>
                            </div>
                          )}
                        </div>
                      </React.Fragment>
                    ))}
                  </div>



                  <div className="flex gap-4 pt-6">
                    <select className="px-6 py-4 bg-gray-50 rounded-2xl font-bold outline-none" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                      <option value="draft">Save as Draft</option>
                      <option value="published">Publish Now</option>
                    </select>
                    <button type="submit" disabled={loading || uploading} className="flex-1 py-4 bg-[#292c44] text-white rounded-2xl font-poppins font-bold shadow-xl">
                      {loading ? "Saving..." : (isEditing ? "Update Article" : "Create Article")}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-4xl mx-auto px-6 mt-10">
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-4">Content Repository</h3>
          {blogs.map(blog => (
            <div key={blog._id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 flex items-center justify-between hover:bg-gray-50/50 cursor-pointer transition-all" onClick={() => setExpandedId(expandedId === blog._id ? null : blog._id)}>
                <div className="flex gap-4 items-center">
                  <img src={blog.mainImage} className="w-16 h-16 rounded-2xl object-cover bg-gray-100" alt="" />
                  <div>
                    <h4 className="font-poppins font-bold text-lg text-[#292c44]">{blog.title}</h4>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                      {blog.status} • {new Date(blog.date || blog.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex gap-1">
                    <button onClick={(e) => { e.stopPropagation(); handleEdit(e, blog); }} className="p-3 text-gray-400 hover:text-[#292c44]"><FiEdit3 size={18} /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(e, blog._id); }} className="p-3 text-red-200 hover:text-red-500"><FiTrash2 size={18} /></button>
                  </div>
                  {expandedId === blog._id ? <FiChevronUp /> : <FiChevronDown />}
                </div>
              </div>
              {expandedId === blog._id && (
                <div className="px-6 pb-6 border-t border-gray-100 pt-4 bg-gray-50/30 space-y-4">
                  <div>
                    <span className="text-[10px] font-black uppercase text-gray-400 block mb-1">Excerpt / Summary</span>
                    <p className="text-sm text-gray-600 font-medium">{blog.excerpt || 'No excerpt provided.'}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-100 pt-4">
                    <div>
                      <span className="text-[10px] font-black uppercase text-gray-400 block mb-1">SEO Title</span>
                      <p className="text-sm text-[#292c44] font-bold">{blog.seoTitle || '—'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-gray-400 block mb-1">SEO Description</span>
                      <p className="text-sm text-[#292c44] font-medium">{blog.seoDescription || '—'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-gray-400 block mb-1">SEO Keywords</span>
                      <p className="text-sm text-[#292c44] font-medium">{blog.seoKeywords || '—'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default BlogAdmin;