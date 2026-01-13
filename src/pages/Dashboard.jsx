import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FileText,
  Newspaper,
  Calendar,
  Briefcase,
  Mail,
  Plus,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  // State for real-time data
  const [stats, setStats] = useState({
    news: { total: 0, published: 0, draft: 0 },
    events: { total: 0, upcoming: 0 },
    apps: { total: 0 },
    enquiries: { total: 0, unread: 0 }
  });

  const fetchData = async () => {
    try {
      // 1. Fetch News
      const newsRes = await axios.get("http://localhost:3000/cms/news");
      const newsData = Array.isArray(newsRes.data) ? newsRes.data : newsRes.data.data || [];

      // 2. Fetch Events (sending role=admin to get all)
      const eventsRes = await axios.get("http://localhost:3000/cms/events?role=admin");
      const eventsData = eventsRes.data.data || [];

      // 3. Fetch Applications
      const appsRes = await axios.get("http://localhost:3000/cms/career/applications");
      const appsData = appsRes.data.data || [];

      // 4. Fetch Enquiries
      const contactRes = await axios.get("http://localhost:3000/cms/contact");
      const contactData = contactRes.data.data || [];

      setStats({
        news: {
          total: newsData.length,
          published: newsData.filter(n => n.status === 'published').length,
          draft: newsData.filter(n => n.status === 'draft').length
        },
        events: {
          total: eventsData.length,
          upcoming: eventsData.filter(e => e.status === 'published').length
        },
        apps: { total: appsData.length },
        enquiries: { 
          total: contactData.length,
          unread: contactData.filter(c => c.status === 'new').length 
        }
      });
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const summaryCards = [
    {
      title: 'Blogs',
      total: 12, // Remaining static as requested
      meta: '8 Published • 4 Drafts',
      icon: FileText,
      route: '/admin/blogs',
    },
    {
      title: 'News',
      total: stats.news.total,
      meta: `${stats.news.published} Published • ${stats.news.draft} Drafts`,
      icon: Newspaper,
      route: '/admin/news',
    },
    {
      title: 'Events',
      total: stats.events.total,
      meta: `${stats.events.upcoming} Active Highlights`,
      icon: Calendar,
      route: '/admin/events',
    },
    {
      title: 'Applications',
      total: stats.apps.total,
      meta: 'Latest candidate resumes',
      icon: Briefcase,
      route: '/admin/careers',
    },
    {
      title: 'Enquiries',
      total: stats.enquiries.total,
      meta: `${stats.enquiries.unread} Unread Messages`,
      icon: Mail,
      route: '/admin/contacts',
    },
  ];

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
            Welcome to Renny Admin Dashboard
          </h1>
          <p className="text-sm font-medium text-gray-500">
            {greeting()} Admin!
          </p>
          <p className="text-sm text-gray-600 mt-1 max-w-xl">
            Manage blogs, news, events, and user inquiries from one place.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">Admin</p>
            <p className="text-xs text-gray-500">Content Manager</p>
          </div>

          <div className="h-10 w-10 rounded-full bg-gray-900 flex items-center justify-center">
            <i className="ri-user-3-fill text-white text-2xl"></i>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {summaryCards.map((card, i) => (
          <Link
            key={i}
            to={card.route}
            className="group bg-white rounded-xl border border-gray-200 p-5 transition hover:border-gray-300"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-md bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition">
                  <card.icon className="text-gray-700" size={16} />
                </div>

                <h3 className="text-lg font-semibold text-gray-700">
                  {card.title}
                </h3>
              </div>

              <span className="text-3xl font-semibold text-gray-900">
                {card.total}
              </span>
            </div>

            <p className="text-sm text-gray-500 mt-3">{card.meta}</p>
          </Link>
        ))}
      </div>

      {/* Needs Attention + Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Needs Attention
          </h3>

          <ul className="space-y-3 text-sm">
            <li className="flex items-center justify-between px-2 py-1 rounded-md transition hover:font-semibold">
              <span className="text-gray-700">Draft Blogs</span>
              <Link to="/admin/blogs?status=draft" className="font-medium text-gray-900 hover:font-semibold">4</Link>
            </li>

            <li className="flex items-center justify-between px-2 py-1 rounded-md transition hover:font-semibold">
              <span className="text-gray-700">Draft News Articles</span>
              <Link to="/admin/news?status=draft" className="font-medium text-gray-900 hover:font-semibold">
                {stats.news.draft}
              </Link>
            </li>

            <li className="flex items-center justify-between px-2 py-1 rounded-md transition hover:font-semibold">
              <span className="text-gray-700">Unread Enquiries</span>
              <Link to="/admin/contacts" className="font-medium text-gray-900 hover:font-semibold">
                {stats.enquiries.unread}
              </Link>
            </li>
          </ul>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>

          <div className="space-y-3">
            <a href="/admin/blogs" className="flex items-center gap-2 text-sm font-medium text-gray-900 hover:font-semibold">
              <Plus size={16} /> Create Blog
            </a>
            <a href="/admin/news" className="flex items-center gap-2 text-sm font-medium text-gray-900 hover:font-semibold">
              <Plus size={16} /> Create News
            </a>
            <a href="/admin/events" className="flex items-center gap-2 text-sm font-medium text-gray-900 hover:font-semibold">
              <Plus size={16} /> Create Event
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;