import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClock, FiUploadCloud, FiChevronDown, FiChevronUp, FiImage } from 'react-icons/fi';
import { API } from '../config/api';
import { notifySuccess, notifyError } from "../utils/notifications";
import { Button } from '../components/ui/Button';
import { Card, CardTitle, CardContent } from '../components/ui/Card';
import { Input, Label } from '../components/ui/Input';




const TimelineAdmin = () => {
  const CMS_API = API.CMS_TIMELINE;
  const UPLOAD_API = API.UPLOAD;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const [formData, setFormData] = useState({
    id: null,
    year: '',
    image: '',
    content: '',
    order: 0
  });

  const fetchItems = async () => {
    setFetching(true);
    try {
      const res = await axios.get(CMS_API);
      setItems(res.data.data || res.data || []);
    } catch {
      notifyError("Unable to complete the request.");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleMediaUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append("file", file);
    setUploading(true);

    try {
      const res = await axios.post(UPLOAD_API, data);
      setFormData(prev => ({ ...prev, image: res.data.fileUrl }));
      notifySuccess("Image uploaded to S3 successfully!");
    } catch {
      notifyError("S3 Upload Failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = { ...formData };
    if (!isEditing || !payload.id) delete payload.id;

    try {
      if (isEditing && formData.id) {
        await axios.put(`${CMS_API}/${formData.id}`, payload);
      } else {
        await axios.post(CMS_API, payload);
      }
      resetForm();
      fetchItems();
      notifySuccess("Timeline entry synchronized successfully!");
    } catch (err) {
      notifyError("Error: " + (err.response?.data?.message || "Server error"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Delete this timeline entry permanently?")) {
      try {
        await axios.delete(`${CMS_API}/${id}`);
        setItems(prev => prev.filter(item => item._id !== id));
        if (expandedId === id) setExpandedId(null);
      } catch {
        notifyError("Delete failed");
      }
    }
  };

  const handleEdit = (e, item) => {
    e.stopPropagation();
    setFormData({
      id: item._id,
      year: item.year,
      image: item.image,
      content: item.content,
      order: item.order || 0
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ id: null, year: '', image: '', content: '', order: 0 });
    setIsEditing(false);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20 font-sans text-[#292c44]">
      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#292c44] rounded-xl flex items-center justify-center text-white shadow-lg">
              <FiClock size={20} />
            </div>
            <h1 className="text-xl font-bold">About Us - Timeline</h1>
          </div>
          <button
            onClick={() => { resetForm(); setIsEditing(false); setShowForm(true); }}
            className="px-6 py-2.5 rounded-full font-bold text-sm bg-[#292c44] text-white transition-all hover:opacity-90"
          >
            Add Milestone
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={resetForm}
            aria-modal="true"
            role="dialog"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-2xl rounded-[2.5rem] p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-black text-[#111827]">
                    {isEditing ? 'Update Milestone' : 'Add a New Milestone'}
                  </h2>
                  <p className="text-sm text-gray-500 mt-2">Keep your timeline chronological and add a supporting image when available.</p>
                </div>
                <Button type="button" variant="ghost" size="md" className="text-gray-500" onClick={resetForm} aria-label="Close form">
                  <FiX size={20} />
                </Button>
              </div>
              <Card>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="timeline-year">Year</Label>
                      <Input
                        id="timeline-year"
                        placeholder="e.g. 1990"
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="timeline-order">Display order</Label>
                      <Input
                        id="timeline-order"
                        type="number"
                        placeholder="0"
                        value={formData.order}
                        onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="timeline-image">Timeline image</Label>
                    <label htmlFor="timeline-image" className={`group mt-2 flex items-center justify-between gap-3 rounded-2xl border px-5 py-4 transition-all ${formData.image ? 'border-green-200 bg-green-50 text-green-700' : 'border-gray-200 bg-gray-50 text-gray-500'} hover:border-gray-300 cursor-pointer`}>
                      <span className="truncate">{uploading ? 'Uploading…' : formData.image ? 'Image selected' : 'Choose image to upload'}</span>
                      <FiUploadCloud className="text-lg" />
                    </label>
                    <input
                      id="timeline-image"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleMediaUpload}
                    />
                    <p className="mt-2 text-sm text-gray-500">Recommended image size: 1200x800px. Supports common formats.</p>
                  </div>

                  <div>
                    <Label htmlFor="timeline-content">Milestone details</Label>
                    <textarea
                      id="timeline-content"
                      rows="4"
                      className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#292c44] transition-all"
                      placeholder="Describe the milestone in one or two sentences"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-gray-500">All timeline entries are ordered by the display index.</p>
                    <Button type="submit" variant="primary" size="lg" disabled={loading || uploading}>
                      {loading ? 'Saving...' : isEditing ? 'Update milestone' : 'Save milestone'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-5xl mx-auto px-6 mt-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gray-400">Timeline inventory</p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">Published milestones</h2>
          </div>
          <p className="text-sm text-gray-500">Tap any card to expand and manage a milestone.</p>
        </div>

        {fetching ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="animate-pulse rounded-[2rem] bg-white border border-gray-100 p-6 h-32" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <Card className="p-8 text-center">
            <CardTitle className="text-lg">No timeline entries yet</CardTitle>
            <CardContent className="text-sm text-gray-500">Create your first milestone by clicking Add Milestone.</CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {items.sort((a, b) => a.order - b.order).map((item) => (
              <div
                key={item._id}
                role="button"
                tabIndex={0}
                onClick={() => setExpandedId(expandedId === item._id ? null : item._id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setExpandedId(expandedId === item._id ? null : item._id); } }}
                className="w-full rounded-[2rem] border border-gray-100 bg-white p-6 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#292c44]"
                aria-expanded={expandedId === item._id}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-700 shadow-sm">
                      <FiImage size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-500">{item.year}</p>
                      <h3 className="mt-1 text-lg font-semibold text-gray-900">{item.year} milestone</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400">
                    <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-gray-600">Order {item.order ?? 0}</span>
                    {expandedId === item._id ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                  </div>
                </div>
                <AnimatePresence>
                  {expandedId === item._id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-6 overflow-hidden"
                    >
                      <div className="grid gap-4 lg:grid-cols-[1fr_120px]">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={`Timeline ${item.year}`}
                            className="h-40 w-full rounded-3xl object-cover shadow-inner"
                          />
                        )}
                        <div className="space-y-4">
                          <p className="text-sm text-gray-600 leading-relaxed">{item.content}</p>
                          <div className="flex flex-col gap-3 sm:flex-row">
                            <Button type="button" variant="secondary" size="md" onClick={(e) => handleEdit(e, item)}>
                              Edit
                            </Button>
                            <Button
                              type="button"
                              variant="danger"
                              size="md"
                              onClick={(e) => handleDelete(e, item._id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default TimelineAdmin;
