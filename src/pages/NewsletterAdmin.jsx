import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiMail, FiDownload, FiTrash2, FiSearch, FiCalendar } from 'react-icons/fi';
import { API } from '../config/api';
import { notifyWarning } from "../utils/notifications";




const NewsletterAdmin = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const API_URL = API.API_NEWSLETTER;

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(API_URL);
      setSubscribers(data.data || []);
    } catch { notifyError("Unable to complete the request."); } finally {
      setLoading(false);
    }
  };

  // Function to export data to CSV
  const exportToCSV = () => {
    if (subscribers.length === 0) return notifyWarning("No data to export");

    const headers = ["Name,Email,Subscribed On\n"];
    const rows = subscribers.map(s => 
      `${s.name},${s.email},${new Date(s.subscribedAt).toLocaleDateString()}`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Newsletter_Subscribers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredSubscribers = subscribers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#292C44] flex items-center gap-3">
              <FiMail /> Newsletter Leads
            </h1>
            <p className="text-gray-500 text-sm">Manage your email marketing audience</p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search subscribers..."
                className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={exportToCSV}
              className="bg-green-600 text-white px-5 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-green-700 transition-all"
            >
              <FiDownload /> Export CSV
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Total Subscribers</p>
            <h2 className="text-4xl font-bold text-[#292C44] mt-1">{subscribers.length}</h2>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">New This Month</p>
            <h2 className="text-4xl font-bold text-blue-600 mt-1">
              {subscribers.filter(s => new Date(s.subscribedAt).getMonth() === new Date().getMonth()).length}
            </h2>
          </div>
        </div>

        {/* Table View */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden">
          {loading ? (
            <div className="text-center py-20 text-gray-400 animate-pulse font-bold">Fetching Audience...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#292C44] text-white">
                  <th className="p-5 font-semibold text-sm">Subscriber Name</th>
                  <th className="p-5 font-semibold text-sm">Email Address</th>
                  <th className="p-5 font-semibold text-sm flex items-center gap-2">
                    <FiCalendar /> Join Date
                  </th>
                  <th className="p-5 font-semibold text-sm text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSubscribers.length > 0 ? (
                  filteredSubscribers.map((sub) => (
                    <tr key={sub._id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="p-5 text-gray-800 font-medium">{sub.name}</td>
                      <td className="p-5 text-blue-600 hover:underline cursor-pointer">{sub.email}</td>
                      <td className="p-5 text-gray-500 text-sm">
                        {new Date(sub.subscribedAt).toLocaleDateString('en-GB', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </td>
                      <td className="p-5 text-center">
                        <button className="text-red-400 hover:text-red-600 transition-colors">
                          <FiTrash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-20 text-center text-gray-400 italic">
                      No subscribers found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsletterAdmin;