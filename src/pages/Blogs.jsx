import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, FiEdit3, FiTrash2, FiFileText, FiType, FiList, 
  FiChevronDown, FiChevronUp, FiImage, FiX, FiLayers, FiCalendar, FiHash 
} from 'react-icons/fi';

const BlogAdmin = () => {
  const CMS_API = "http://localhost:3000/cms/blogs";

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    mainImage: '',
    status: 'draft',
    publishedAt: '',
    bodySections: []
  });

  useEffect(() => { fetchBlogs(); }, []);

  const fetchBlogs = async () => {
    try {
      const res = await axios.get(`${CMS_API}?role=admin`);
      setBlogs(res.data.data || []);
    } catch (err) { console.error("Fetch error:", err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const payload = {
      ...formData,
      publishedAt: formData.publishedAt ? new Date(formData.publishedAt) : (formData.status === 'published' ? new Date() : null)
    };

    try {
      if (isEditing) {
        await axios.put(`${CMS_API}/${editingId}`, payload);
      } else {
        await axios.post(CMS_API, payload);
      }
      resetForm();
      fetchBlogs();
      alert("Blog synchronized successfully!");
    } catch (err) {
      console.error("Submission Error:", err.response?.data);
      alert(`Error: ${err.response?.data?.message || "Server Error"}`);
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
      publishedAt: blog.publishedAt ? new Date(blog.publishedAt).toISOString().split('T')[0] : '',
      bodySections: blog.bodySections
    });
    setEditingId(blog._id);
    setIsEditing(true);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Delete this article permanently?")) return;
    try {
      await axios.delete(`${CMS_API}/${id}`);
      fetchBlogs();
    } catch (err) { alert("Delete failed"); }
  };

  const resetForm = () => {
    setFormData({ title: '', excerpt: '', mainImage: '', status: 'draft', publishedAt: '', bodySections: [] });
    setIsEditing(false);
    setEditingId(null);
    setShowForm(false);
  };

  // --- Section Logic ---
  const addSection = (type) => {
    const newSection = {
      type,
      content: '',
      listItems: type.includes('list') ? [{ title: '', description: '' }] : []
    };
    setFormData({ ...formData, bodySections: [...formData.bodySections, newSection] });
  };

  const updateSection = (index, value) => {
    const updated = [...formData.bodySections];
    updated[index].content = value;
    setFormData({ ...formData, bodySections: updated });
  };

  const removeSection = (index) => {
    setFormData({ ...formData, bodySections: formData.bodySections.filter((_, i) => i !== index) });
  };

  const updateListItem = (sIdx, lIdx, field, value) => {
    const updated = [...formData.bodySections];
    updated[sIdx].listItems[lIdx][field] = value;
    setFormData({ ...formData, bodySections: updated });
  };

  const addListItem = (sIdx) => {
    const updated = [...formData.bodySections];
    updated[sIdx].listItems.push({ title: '', description: '' });
    setFormData({ ...formData, bodySections: updated });
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20 font-helvetica text-[#292c44]">
      {/* Navigation */}
      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#292c44] rounded-xl flex items-center justify-center text-white shadow-lg">
            <FiFileText size={20} />
          </div>
          <h1 className="text-xl font-poppins font-bold">Blog Studio</h1>
        </div>
        <button onClick={() => (showForm ? resetForm() : setShowForm(true))} className="bg-[#292c44] text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-blue-900/10 hover:scale-105 transition-all">
          {showForm ? 'Cancel Edit' : 'Create Article'}
        </button>
      </nav>

      <main className="max-w-4xl mx-auto px-6 mt-10">
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl p-10 mb-12">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-4">
                  <input className="w-full p-5 bg-gray-50 rounded-2xl outline-none text-2xl font-bold font-poppins border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-[#292c44]" placeholder="Article Title..." value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                  <textarea className="w-full p-5 bg-gray-50 rounded-2xl outline-none ring-1 ring-gray-100" placeholder="Brief summary for cards..." rows="2" value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} required />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input className="w-full p-4 bg-gray-50 rounded-2xl outline-none ring-1 ring-gray-100" placeholder="Main Image URL" value={formData.mainImage} onChange={e => setFormData({...formData, mainImage: e.target.value})} />
                    <div className="relative">
                       <input type="date" className="w-full p-4 bg-gray-50 rounded-2xl outline-none ring-1 ring-gray-100 text-gray-500 font-bold" value={formData.publishedAt} onChange={e => setFormData({...formData, publishedAt: e.target.value})} />
                       <span className="absolute right-4 top-4 text-gray-300 pointer-events-none"><FiCalendar /></span>
                    </div>
                  </div>
                </div>

                {/* Section Builder Controls */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b pb-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Content Builder</h3>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => addSection('heading')} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl hover:bg-gray-100 text-xs font-bold"><FiType /> Heading</button>
                      <button type="button" onClick={() => addSection('paragraph')} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl hover:bg-gray-100 text-xs font-bold"><FiLayers /> Paragraph</button>
                      <button type="button" onClick={() => addSection('bullet-list')} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl hover:bg-gray-100 text-xs font-bold"><FiList /> Points</button>
                      <button type="button" onClick={() => addSection('numbered-list')} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl hover:bg-gray-100 text-xs font-bold"><FiHash /> Numbers</button>
                    </div>
                  </div>

                  {formData.bodySections.map((section, sIndex) => (
                    <div key={sIndex} className="relative p-6 bg-gray-50/50 rounded-3xl border border-gray-100 group">
                      <button type="button" onClick={() => removeSection(sIndex)} className="absolute -top-2 -right-2 w-8 h-8 bg-red-50 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm"><FiX size={14} /></button>
                      
                      {section.type === 'heading' || section.type === 'paragraph' ? (
                        <textarea className={`w-full bg-transparent outline-none ${section.type === 'heading' ? 'text-lg font-bold' : 'text-sm text-gray-600'}`} value={section.content} onChange={(e) => updateSection(sIndex, e.target.value)} rows={section.type === 'heading' ? 1 : 4} placeholder={`Enter ${section.type}...`} />
                      ) : (
                        <div className="space-y-4">
                          {section.listItems.map((item, lIndex) => (
                            <div key={lIndex} className="grid grid-cols-1 gap-2 pl-4 border-l-2 border-[#292c44]/20">
                              <input className="bg-transparent font-bold text-sm outline-none" placeholder="Item Title" value={item.title} onChange={(e) => updateListItem(sIndex, lIndex, 'title', e.target.value)} />
                              <textarea className="bg-transparent text-xs text-gray-500 outline-none" placeholder="Description (Optional)" value={item.description} onChange={(e) => updateListItem(sIndex, lIndex, 'description', e.target.value)} rows="1" />
                            </div>
                          ))}
                          <button type="button" onClick={() => addListItem(sIndex)} className="text-[10px] font-black text-blue-600 uppercase tracking-widest">+ Add New Item</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-4 pt-6">
                  <select className="px-6 py-4 bg-gray-50 rounded-2xl font-bold outline-none" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="draft">Save as Draft</option>
                    <option value="published">Publish Now</option>
                  </select>
                  <button type="submit" disabled={loading} className="flex-1 py-4 bg-[#292c44] text-white rounded-2xl font-poppins font-bold shadow-xl">
                    {loading ? "Saving..." : (isEditing ? "Update Article" : "Create Article")}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* List View with Full Expansion */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-4">Content Repository</h3>
          {blogs.map(blog => (
            <div key={blog._id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 flex items-center justify-between hover:bg-gray-50/50 cursor-pointer transition-all" onClick={() => setExpandedId(expandedId === blog._id ? null : blog._id)}>
                <div className="flex gap-4 items-center">
                  <img src={blog.mainImage || 'https://via.placeholder.com/100'} className="w-16 h-16 rounded-2xl object-cover bg-gray-100" />
                  <div>
                    <h4 className="font-poppins font-bold text-lg text-[#292c44]">{blog.title}</h4>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                      {blog.status} • {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="flex gap-1">
                      <button onClick={(e) => handleEdit(e, blog)} className="p-3 text-gray-400 hover:text-[#292c44]"><FiEdit3 size={18}/></button>
                      <button onClick={(e) => handleDelete(e, blog._id)} className="p-3 text-red-200 hover:text-red-500"><FiTrash2 size={18}/></button>
                   </div>
                   {expandedId === blog._id ? <FiChevronUp /> : <FiChevronDown />}
                </div>
              </div>

              <AnimatePresence>
                {expandedId === blog._id && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="bg-gray-50/30 border-t border-gray-50">
                    <div className="p-10 space-y-10">
                      <div>
                        <span className="text-[10px] font-black uppercase text-gray-300">Summary</span>
                        <p className="mt-2 text-gray-600 leading-relaxed italic">{blog.excerpt}</p>
                      </div>

                      <div className="space-y-6">
                        {blog.bodySections?.map((section, idx) => (
                          <div key={idx} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                            <span className="text-[9px] font-black uppercase text-blue-500 px-3 py-1 bg-blue-50 rounded-full">{section.type.replace('-', ' ')}</span>
                            <div className="mt-4">
                              {section.type === 'heading' && <h3 className="text-xl font-bold">{section.content}</h3>}
                              {section.type === 'paragraph' && <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{section.content}</p>}
                              
                              {/* Bullet Points Logic */}
                              {section.type === 'bullet-list' && (
                                <ul className="space-y-3 mt-2 list-disc pl-5">
                                  {section.listItems.map((item, i) => (
                                    <li key={i} className="text-sm text-gray-600">
                                      <span className="font-bold block text-[#292c44]">{item.title}</span>
                                      {item.description && <p className="text-gray-400 text-xs mt-1">{item.description}</p>}
                                    </li>
                                  ))}
                                </ul>
                              )}

                              {/* Numbered List Logic */}
                              {section.type === 'numbered-list' && (
                                <ol className="space-y-3 mt-2 list-decimal pl-5">
                                  {section.listItems.map((item, i) => (
                                    <li key={i} className="text-sm text-gray-600">
                                      <span className="font-bold block text-[#292c44]">{item.title}</span>
                                      {item.description && <p className="text-gray-400 text-xs mt-1">{item.description}</p>}
                                    </li>
                                  ))}
                                </ol>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default BlogAdmin;