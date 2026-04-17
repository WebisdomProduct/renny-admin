import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Phone, User, MessageSquare, Trash2, ChevronDown, ChevronUp, Clock, Tag, Search, Inbox } from 'lucide-react';
import { API } from '../config/api';
import { format } from 'date-fns';
import { Card } from '../components/ui/Card';
import { notifyError } from "../utils/notifications";




const Contact = () => {
  const CMS_API = API.CMS_CONTACT;

  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const res = await axios.get(CMS_API);
      setEnquiries(res.data.data || []);
    } catch {
      setEnquiries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to remove this enquiry?")) {
      try {
        await axios.delete(`${CMS_API}/${id}`);
        setEnquiries((prev) => prev.filter((item) => item._id !== id));
        if (expandedId === id) setExpandedId(null);
      } catch {
        notifyError("Delete failed.");
      }
    }
  };

  const filteredEnquiries = enquiries.filter((item) =>
    item.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Enquiries Console</h1>
        <p className="text-sm text-gray-500 mt-1">Manage and respond to customer messages.</p>
      </div>

      <Card className="overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100/75 bg-gray-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all outline-none"
            />
          </div>
          <div className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <Inbox className="w-4 h-4" />
            {enquiries.length} Messages
          </div>
        </div>

        {/* List Content */}
        <div className="divide-y divide-gray-100/75">
          {loading ? (
            <div className="p-12 pl-1 flex items-center justify-center flex-col gap-3 text-gray-500">
               <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
               <p className="text-sm font-medium">Loading enquiries...</p>
            </div>
          ) : filteredEnquiries.length === 0 ? (
             <div className="p-16 text-center">
               <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Inbox className="text-gray-300 w-8 h-8" />
               </div>
               <h3 className="text-lg font-medium text-gray-900">No enquiries found</h3>
               <p className="text-sm text-gray-500 mt-1">Your inbox is clear, or try adjusting the search terms.</p>
             </div>
          ) : (
            filteredEnquiries.map((item) => (
              <div 
                key={item._id} 
                className={`transition-colors cursor-pointer ${expandedId === item._id ? 'bg-gray-50/50' : 'hover:bg-gray-50/30 bg-white'}`}
                onClick={() => setExpandedId(expandedId === item._id ? null : item._id)}
              >
                {/* List Row Item */}
                <div className="p-4 sm:px-6 flex items-center gap-4">
                  
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 flex-shrink-0">
                    <User size={18} />
                  </div>
                  
                  {/* Content Preview */}
                  <div className="flex-1 min-w-0">
                     <div className="flex items-center gap-3 mb-0.5">
                       <h4 className="text-sm font-semibold text-gray-900 truncate">{item.fullName}</h4>
                       <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                         item.status === 'new' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                       }`}>
                         {item.enquiryType || 'General'}
                       </span>
                     </div>
                     <div className="text-sm text-gray-500 truncate flex items-center gap-3">
                       <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {item.email}</span>
                     </div>
                  </div>

                  {/* Date & Expand Icon */}
                  <div className="flex items-center gap-4 text-gray-400">
                    <span className="text-xs font-medium hidden sm:flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {item.createdAt ? format(new Date(item.createdAt), 'MMM dd, yyyy') : 'N/A'}
                    </span>
                    {expandedId === item._id ? <ChevronUp className="w-5 h-5 text-gray-600" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>

                {/* Expanded Detail */}
                {expandedId === item._id && (
                  <div className="px-6 pb-6 pt-2 cursor-default border-t border-gray-100/50" onClick={(e) => e.stopPropagation()}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                      <div className="p-4 bg-white border border-gray-100 rounded-xl space-y-1">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Contact Details</label>
                        <div className="text-sm font-medium text-gray-900 flex items-center gap-2 mt-2">
                            <Mail className="w-4 h-4 text-gray-400" /> <a href={`mailto:${item.email}`} className="hover:text-blue-600 transition-colors">{item.email}</a>
                        </div>
                        <div className="text-sm font-medium text-gray-900 flex items-center gap-2 mt-1">
                            <Phone className="w-4 h-4 text-gray-400" /> <a href={`tel:${item.phoneNumber}`} className="hover:text-blue-600 transition-colors">{item.phoneNumber || 'N/A'}</a>
                        </div>
                      </div>
                      <div className="p-4 bg-white border border-gray-100 rounded-xl space-y-1">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Timeline Status</label>
                        <div className="text-sm font-medium text-gray-900 mt-2">
                           Received: {item.createdAt ? format(new Date(item.createdAt), 'MMM dd, yyyy h:mm a') : 'N/A'}
                        </div>
                         <div className="text-sm font-medium text-gray-500 mt-1">
                           Current Status: {item.status || 'New'}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                        <MessageSquare className="w-3.5 h-3.5" /> Message Content
                      </label>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {item.message || "No message provided."}
                      </p>
                    </div>

                    <div className="flex gap-3 mt-4">
                      <a 
                        href={`mailto:${item.email}`}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                      >
                        <Mail className="w-4 h-4" /> Reply
                      </a>
                      <button 
                        onClick={(e) => handleDelete(e, item._id)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Card>
      
    </div>
  );
};

export default Contact;