import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SustainabilityLeads = () => {
  // Initialize as empty array to prevent map errors on first render
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get('/api/admin/leads');
        
        // Defensive check: Ensure we are setting an array
        // Some APIs return the array directly in 'data', others in 'data.leads'
        const leadsData = data?.leads || data || [];
        setLeads(Array.isArray(leadsData) ? leadsData : []);
        
      } catch (err) {
        console.error("Error fetching leads", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Sustainability Report Submissions</h1>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">Loading leads...</td>
              </tr>
            ) : leads.length > 0 ? (
              leads.map((lead) => (
                <tr key={lead?._id || Math.random()}>
                  <td className="px-6 py-4 whitespace-nowrap">{lead?.name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{lead?.email || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{lead?.phone || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {lead?.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No submissions found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SustainabilityLeads;