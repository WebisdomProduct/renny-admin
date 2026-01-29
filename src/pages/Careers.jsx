import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlus, FiEdit3, FiTrash2, FiMapPin, FiClock, FiX, FiChevronDown, 
  FiChevronUp, FiBriefcase, FiDollarSign, FiFileText, FiSearch, 
  FiUser, FiMail, FiPhone, FiCalendar, FiGlobe, FiExternalLink
} from "react-icons/fi";

const CareerAdmin = () => {
  // API Configuration
  const CMS_API = "http://localhost:3000/cms/career";

  // List States
  const [jobs, setJobs] = useState([]);
  const [apps, setApps] = useState([]);
  const [view, setView] = useState("jobs"); // "jobs" or "applications"
  const [loading, setLoading] = useState(false);

  // UI Control States
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [expandedAppId, setExpandedAppId] = useState(null);

  // Search and Filter States (for Candidate Management)
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Form State (Job Postings)
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    department: "Engineering",
    location: "",
    jobType: "Full-time",
    salary: "",
    aboutCompany: "",
    description: "",
    status: "published",
    order: 0,
  });

  // Fetch data whenever view or filters change
  useEffect(() => {
    fetchData();
  }, [view, searchTerm, statusFilter]);

  const fetchData = async () => {
    try {
      const endpoint = view === "jobs"
          ? `${CMS_API}/jobs?role=admin`
          : `${CMS_API}/applications?search=${searchTerm}&status=${statusFilter}`;
      
      const res = await axios.get(endpoint);
      view === "jobs" 
        ? setJobs(res.data.data || []) 
        : setApps(res.data.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // CLEAN PAYLOAD FOR ATLAS: Ensure id is handled correctly
    const payload = { ...formData };
    if (!isEditing || !payload.id) {
      delete payload.id; // Forces backend to use .create()
    }

    try {
      await axios.post(`${CMS_API}/jobs/upsert`, payload);
      resetForm();
      fetchData();
      alert("Job record synchronized successfully!");
    } catch (err) {
      alert("Save failed: " + (err.response?.data?.message || "Server Error"));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (e, item) => {
    e.stopPropagation();
    setFormData({
      id: item._id,
      title: item.title,
      department: item.department,
      location: item.location,
      jobType: item.jobType,
      salary: item.salary,
      aboutCompany: item.aboutCompany,
      description: item.description,
      status: item.status,
      order: item.order
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (e, type, id) => {
    e.stopPropagation();
    if (!window.confirm(`Delete this ${type} permanently?`)) return;
    
    const path = type === "job" ? `jobs/${id}` : `applications/${id}`;
    try {
      await axios.delete(`${CMS_API}/${path}`);
      fetchData();
    } catch (err) {
      alert("Delete failed");
    }
  };

  const resetForm = () => {
    setFormData({
      id: null, title: "", department: "Engineering", location: "",
      jobType: "Full-time", salary: "", aboutCompany: "",
      description: "", status: "published", order: 0,
    });
    setIsEditing(false);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20 font-helvetica text-[#292c44]">
      {/* Dynamic Header */}
      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 h-20 flex items-center justify-between">
        <div className="flex gap-10">
          <button
            onClick={() => setView("jobs")}
            className={`text-lg font-poppins font-bold transition-all ${
              view === "jobs" ? "text-[#292c44] border-b-2 border-[#292c44]" : "text-gray-300"
            }`}
          >
            Job Board
          </button>
          <button
            onClick={() => setView("applications")}
            className={`text-lg font-poppins font-bold transition-all ${
              view === "applications" ? "text-[#292c44] border-b-2 border-[#292c44]" : "text-gray-300"
            }`}
          >
            Applications
          </button>
        </div>

        {view === "jobs" ? (
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="bg-[#292c44] text-white px-6 py-2.5 rounded-full font-bold flex items-center gap-2 shadow-lg"
          >
            <FiPlus /> New Opening
          </button>
        ) : (
          <div className="flex gap-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search candidates..." 
                className="pl-10 pr-4 py-2 bg-gray-50 rounded-xl border-none outline-none text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="bg-gray-50 px-4 py-2 rounded-xl text-sm border-none outline-none font-bold"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Status: All</option>
              <option value="New">New</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        )}
      </nav>

      <main className="max-w-4xl mx-auto px-6 mt-10">
        {/* --- JOB LIST VIEW --- */}
        {view === "jobs" && (
          <div className="space-y-6">
            {jobs.map((job) => (
              <motion.div
                key={job._id}
                layout
                onClick={() => setExpandedJobId(expandedJobId === job._id ? null : job._id)}
                className={`bg-white border rounded-[2.5rem] transition-all cursor-pointer ${
                  expandedJobId === job._id ? "border-[#292c44] shadow-xl" : "border-gray-100 shadow-sm"
                }`}
              >
                <div className="p-7 flex justify-between items-center">
                  <div className="flex-1">
                    <span className="text-[10px] font-black uppercase text-gray-300 tracking-widest">{job.department}</span>
                    <h4 className="text-xl font-bold">{job.title}</h4>
                    <div className="flex gap-4 mt-2 text-xs text-gray-400 font-bold">
                       <span className="flex items-center gap-1"><FiMapPin /> {job.location}</span>
                       <span className="flex items-center gap-1"><FiClock /> {job.jobType}</span>
                    </div>
                  </div>
                  {expandedJobId === job._id ? <FiChevronUp /> : <FiChevronDown />}
                </div>

                <AnimatePresence>
                  {expandedJobId === job._id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="px-7 pb-7 space-y-6">
                      <div className="pt-6 border-t border-gray-50 space-y-6">
                        <div>
                          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2">Job Description</p>
                          {/* whitespace-pre-wrap ensures formatting is preserved */}
                          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{job.description}</p>
                        </div>
                        <div className="flex gap-3">
                          <button onClick={(e) => handleEdit(e, job)} className="flex-1 py-3 bg-gray-50 text-[#292c44] font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-100 transition-all"><FiEdit3 /> Edit Vacancy</button>
                          <button onClick={(e) => handleDelete(e, "job", job._id)} className="flex-1 py-3 bg-red-50 text-red-500 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-red-100 transition-all"><FiTrash2 /> Remove</button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}

        {/* --- APPLICATIONS LIST VIEW --- */}
        {view === "applications" && (
          <div className="space-y-6">
            {apps.map((app) => (
              <motion.div
                key={app._id}
                layout
                onClick={() => setExpandedAppId(expandedAppId === app._id ? null : app._id)}
                className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center font-bold text-xl">{app.firstName ? app.firstName[0] : "C"}</div>
                    <div>
                      <h4 className="text-xl font-bold">{app.fullName}</h4>
                      <p className="text-xs text-gray-400 font-bold uppercase">{app.jobId?.title || "Unknown Position"}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${app.status === 'New' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>{app.status}</span>
                    <button onClick={(e) => handleDelete(e, "app", app._id)} className="text-gray-200 hover:text-red-500"><FiTrash2 size={20}/></button>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedAppId === app._id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-8 pt-8 border-t border-gray-50 space-y-8">
                      {/* Grid for New Candidate Fields (Address, DOB, Gender) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <h5 className="text-[10px] font-black uppercase text-gray-300 tracking-widest">Personal Details</h5>
                          <div className="space-y-3 text-sm font-bold">
                            <p className="flex items-center gap-3"><FiMail className="text-gray-400"/> {app.email}</p>
                            <p className="flex items-center gap-3"><FiPhone className="text-gray-400"/> {app.phoneNumber}</p>
                            <p className="flex items-center gap-3"><FiCalendar className="text-gray-400"/> DOB: {app.dob ? new Date(app.dob).toLocaleDateString() : "N/A"}</p>
                            <p className="flex items-center gap-3"><FiUser className="text-gray-400"/> Gender: {app.gender}</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <h5 className="text-[10px] font-black uppercase text-gray-300 tracking-widest">Postal Address</h5>
                          <div className="text-sm font-bold text-gray-600 space-y-1">
                            <p>{app.address?.street}</p>
                            <p>{app.address?.city}, {app.address?.state} {app.address?.zipCode}</p>
                            <p className="flex items-center gap-2 mt-2 text-[#292c44]"><FiGlobe className="text-gray-400"/> {app.address?.country}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                         <h5 className="text-[10px] font-black uppercase text-gray-300 tracking-widest">Statement & Resume</h5>
                         <p className="text-sm text-gray-500 italic bg-gray-50 p-6 rounded-3xl">"{app.coverLetter}"</p>
                         <a 
                           href={app.resumeUrl} 
                           target="_blank" 
                           rel="noreferrer" 
                           className="inline-flex items-center gap-3 px-8 py-3 bg-[#292c44] text-white rounded-2xl font-bold text-sm hover:scale-105 transition-transform"
                         >
                           <FiFileText /> View Resume <FiExternalLink size={12}/>
                         </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* --- JOB POSTING MODAL --- */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ y: 20 }} animate={{ y: 0 }} className="bg-white w-full max-w-2xl rounded-[3rem] p-10 max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-[#292c44]">{isEditing ? 'Update Vacancy' : 'New Job Opening'}</h2>
                <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-full transition-all"><FiX size={24} /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block ml-1">Position Title</label>
                  <input className="w-full p-4 bg-gray-50 border-none ring-1 ring-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#292c44]" placeholder="e.g. Senior Production Engineer" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block ml-1">Department</label>
                    <select className="w-full p-4 bg-gray-50 rounded-2xl outline-none ring-1 ring-gray-100 font-bold" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}>
                      <option value="Engineering">Engineering</option>
                      <option value="IT & Software">IT & Software</option>
                      <option value="Operations">Operations</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Finance">Finance</option>
                      <option value="Quality Control">Quality Control</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block ml-1">Job Type</label>
                    <select className="w-full p-4 bg-gray-50 rounded-2xl outline-none ring-1 ring-gray-100 font-bold" value={formData.jobType} onChange={e => setFormData({...formData, jobType: e.target.value})}>
                      <option value="Full-time">Full-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Remote">Remote</option>
                      <option value="Trainee">Trainee</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input className="p-4 bg-gray-50 rounded-2xl outline-none ring-1 ring-gray-100" placeholder="Location" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} required />
                  <input className="p-4 bg-gray-50 rounded-2xl outline-none ring-1 ring-gray-100" placeholder="Salary Range" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} />
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block ml-1">About the Company</label>
                  <textarea className="w-full p-4 bg-gray-50 rounded-2xl outline-none ring-1 ring-gray-100 h-24" value={formData.aboutCompany} onChange={e => setFormData({...formData, aboutCompany: e.target.value})} required />
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block ml-1">Detailed Job Description</label>
                  <textarea className="w-full p-4 bg-gray-50 rounded-2xl outline-none ring-1 ring-gray-100 h-48" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
                </div>

                <div className="flex gap-4">
                   <select className="flex-1 p-4 bg-gray-50 rounded-2xl outline-none font-bold" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                      <option value="published">Status: Published</option>
                      <option value="draft">Status: Draft</option>
                   </select>
                   <input type="number" className="w-24 p-4 bg-gray-50 rounded-2xl outline-none font-bold text-center" value={formData.order} onChange={e => setFormData({...formData, order: Number(e.target.value)})} title="Display Order" />
                </div>

                <button type="submit" disabled={loading} className="w-full py-5 bg-[#292c44] text-white rounded-3xl font-bold shadow-xl shadow-[#292c44]/20 hover:scale-[1.01] active:scale-[0.99] transition-all">
                  {loading ? "Syncing..." : (isEditing ? "Update Vacancy" : "Publish Opening")}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CareerAdmin;