import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiMapPin,
  FiClock,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiBriefcase,
  FiDollarSign,
  FiFileText,
} from "react-icons/fi";

const CareerAdmin = () => {
  const CMS_API = "http://localhost:3000/cms/career";

  const [jobs, setJobs] = useState([]);
  const [apps, setApps] = useState([]);
  const [view, setView] = useState("jobs");
  const [showForm, setShowForm] = useState(false);
  const [expandedJobId, setExpandedJobId] = useState(null); // Track expanded job
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    fetchData();
  }, [view]);

  const fetchData = async () => {
    try {
      const endpoint =
        view === "jobs"
          ? `${CMS_API}/jobs?role=admin`
          : `${CMS_API}/applications`;
      const res = await axios.get(endpoint);
      view === "jobs"
        ? setJobs(res.data.data || [])
        : setApps(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${CMS_API}/jobs/upsert`, formData);
      resetForm();
      fetchData();
    } catch (err) {
      alert("Save failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
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
    setShowForm(false);
  };

  const handleEdit = (e, item) => {
    e.stopPropagation();
    setFormData({ id: item._id, ...item });
    setShowForm(true);
  };

  const handleDelete = async (e, type, id) => {
    e.stopPropagation();
    if (!window.confirm("Permanently delete?")) return;
    const path = type === "job" ? `jobs/${id}` : `applications/${id}`;
    await axios.delete(`${CMS_API}/${path}`);
    fetchData();
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20 font-helvetica text-[#292c44]">
      {/* Header Navigation */}
      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 h-20 flex items-center justify-between">
        <div className="flex gap-10">
          <button
            onClick={() => setView("jobs")}
            className={`text-lg font-poppins font-bold ${
              view === "jobs"
                ? "text-[#292c44] border-b-2 border-[#292c44]"
                : "text-gray-300"
            }`}
          >
            Job Board
          </button>
          <button
            onClick={() => setView("applications")}
            className={`text-lg font-poppins font-bold ${
              view === "applications"
                ? "text-[#292c44] border-b-2 border-[#292c44]"
                : "text-gray-300"
            }`}
          >
            Applications
          </button>
        </div>
        {view === "jobs" && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#292c44] text-white px-6 py-2.5 rounded-full font-bold flex items-center gap-2"
          >
            <FiPlus /> Add Job
          </button>
        )}
      </nav>

      <main className="max-w-3xl mx-auto px-6 mt-10">
        {/* Job List with Full Details Display */}
        {view === "jobs" && (
          <div className="space-y-6">
            {jobs.map((job) => (
              <motion.div
                key={job._id}
                layout
                onClick={() =>
                  setExpandedJobId(expandedJobId === job._id ? null : job._id)
                }
                className={`bg-white border rounded-[2.5rem] overflow-hidden transition-all cursor-pointer ${
                  expandedJobId === job._id
                    ? "border-[#292c44] shadow-xl"
                    : "border-gray-100 shadow-sm"
                }`}
              >
                <div className="p-7">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            job.status === "published"
                              ? "bg-green-500"
                              : "bg-amber-400"
                          }`}
                        />
                        <span className="text-[10px] font-black uppercase text-gray-300 tracking-widest">
                          {job.department}
                        </span>
                      </div>
                      <h4 className="text-xl font-poppins font-bold">
                        {job.title}
                      </h4>
                      <div className="flex gap-4 mt-2 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <FiMapPin size={14} /> {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiClock size={14} /> {job.jobType}
                        </span>
                      </div>
                    </div>
                    {expandedJobId === job._id ? (
                      <FiChevronUp />
                    ) : (
                      <FiChevronDown />
                    )}
                  </div>

                  {/* --- FULL DETAILS SECTION --- */}
                  <AnimatePresence>
                    {expandedJobId === job._id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6 pt-6 border-t border-gray-50"
                      >
                        <div className="grid grid-cols-2 gap-6 mb-6">
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                              Salary Package
                            </p>
                            <p className="font-bold flex items-center gap-1 mt-1 text-green-600">
                              <FiDollarSign /> {job.salary || "Not disclosed"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                              Current Status
                            </p>
                            <p className="font-bold mt-1 capitalize">
                              {job.status}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                              About Company
                            </p>
                            <p className="mt-1 text-gray-600 text-sm leading-relaxed">
                              {job.aboutCompany}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                              Full Job Description
                            </p>
                            <p className="mt-1 text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                              {job.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                          <button
                            onClick={(e) => handleEdit(e, job)}
                            className="flex-1 py-3 bg-gray-50 text-[#292c44] font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-100"
                          >
                            <FiEdit3 /> Edit Job
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, "job", job._id)}
                            className="flex-1 py-3 bg-red-50 text-red-500 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-red-100"
                          >
                            <FiTrash2 /> Remove
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Applications View logic inside CareerAdmin.jsx */}
        {view === "applications" && (
          <div className="space-y-6">
            {apps.length === 0 ? (
              <div className="text-center py-20 text-gray-400 border-2 border-dashed border-gray-100 rounded-[3rem]">
                No applications received yet.
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {apps.map((app) => (
                  <motion.div
                    key={app._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-[10px] font-black uppercase text-blue-500 bg-blue-50 px-3 py-1 rounded-full">
                          {app.jobId?.department || "General"}
                        </span>
                        <h4 className="text-2xl font-poppins font-black text-[#292c44] mt-2">
                          {app.fullName}
                        </h4>
                        <p className="text-gray-400 font-bold text-sm mt-1">
                          Applied for:{" "}
                          <span className="text-[#292c44] underline">
                            {app.jobId?.title || "Position Deleted"}
                          </span>
                        </p>
                      </div>

                      {/* DELETE BUTTON */}
                      <button
                        onClick={(e) => handleDelete(e, "app", app._id)}
                        className="p-3 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                        title="Delete Application"
                      >
                        <FiTrash2 size={20} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-6 rounded-3xl mt-4">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          Contact Details
                        </p>
                        <p className="text-sm font-bold flex items-center gap-2">
                          📧 {app.email}
                        </p>
                        <p className="text-sm font-bold flex items-center gap-2">
                          📞 {app.phoneNumber}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          Documents
                        </p>
                        <a
                          href={app.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#292c44] font-black underline flex items-center gap-2 mt-1 hover:text-blue-600 transition-colors"
                        >
                          <FiFileText /> View Resume
                        </a>
                      </div>
                    </div>

                    {app.coverLetter && (
                      <div className="mt-6 px-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                          Candidate Note
                        </p>
                        <p className="text-gray-500 text-sm leading-relaxed whitespace-pre-wrap italic bg-white p-4 rounded-2xl border border-gray-50">
                          "{app.coverLetter}"
                        </p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        )}
      </main>

      {/* Form Modal (Must include ALL fields to avoid 500 error) */}
      <AnimatePresence>
        {showForm && (
          <motion.div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-poppins font-black">
                  Publish Vacancy
                </h2>
                <button onClick={resetForm}>
                  <FiX size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <input
                  className="w-full p-4 bg-gray-50 rounded-2xl outline-none border"
                  placeholder="Title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <select
                    className="p-4 bg-gray-50 rounded-2xl border outline-none"
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="IT & Software">IT & Software</option>
                    <option value="Customer Support">Customer Support</option>
                    <option value="Operations">Operations</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Sales & Marketing">Sales & Marketing</option>
                    <option value="Finance">Finance</option>
                  </select>
                  <input
                    className="p-4 bg-gray-50 rounded-2xl border outline-none"
                    placeholder="Location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <select
                    className="p-4 bg-gray-50 rounded-2xl border outline-none"
                    value={formData.jobType}
                    onChange={(e) =>
                      setFormData({ ...formData, jobType: e.target.value })
                    }
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Remote">Remote</option>
                    <option value="Contract">Contract</option>
                    <option value="Trainee">Trainee</option>
                    <option value="Temporary">Temporary</option>
                  </select>
                  <input
                    className="p-4 bg-gray-50 rounded-2xl border outline-none"
                    placeholder="Salary Range"
                    value={formData.salary}
                    onChange={(e) =>
                      setFormData({ ...formData, salary: e.target.value })
                    }
                  />
                </div>

                <textarea
                  className="w-full p-4 bg-gray-50 rounded-2xl border outline-none"
                  placeholder="About Company"
                  value={formData.aboutCompany}
                  onChange={(e) =>
                    setFormData({ ...formData, aboutCompany: e.target.value })
                  }
                  required
                />
                <textarea
                  className="w-full p-4 bg-gray-50 rounded-2xl border outline-none h-40"
                  placeholder="Job Description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />

                <button
                  type="submit"
                  className="w-full py-4 bg-[#292c44] text-white rounded-2xl font-bold"
                >
                  Publish Opening
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
