import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FileText,
  Newspaper,
  Calendar,
  Briefcase,
  Mail,
  Plus,
  ArrowRight,
  TrendingUp,
  Activity,
  Users
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { API } from '../config/api';
import { Card, CardContent } from '../components/ui/Card';
import { notifyError } from "../utils/notifications";

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
      const [newsRes, eventsRes, appsRes, contactRes] = await Promise.all([
        axios.get(API.CMS_NEWS).catch(() => ({ data: [] })),
        axios.get(`${API.CMS_EVENTS}?role=admin`).catch(() => ({ data: { data: [] } })),
        axios.get(`${API.CMS_CAREER}/applications`).catch(() => ({ data: { data: [] } })),
        axios.get(API.CMS_CONTACT).catch(() => ({ data: { data: [] } }))
      ]);

      const newsData = Array.isArray(newsRes.data) ? newsRes.data : newsRes.data.data || [];
      const eventsData = eventsRes.data?.data || [];
      const appsData = appsRes.data?.data || [];
      const contactData = contactRes.data?.data || [];

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
    } catch { notifyError("Unable to complete the request."); }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const summaryCards = [
    {
      title: 'Active Blogs',
      total: 12, // Static
      trend: '+2 this week',
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      route: '/admin/blogs',
    },
    {
      title: 'News Articles',
      total: stats.news.total,
      trend: `${stats.news.published} Published`,
      icon: Newspaper,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      route: '/admin/news',
    },
    {
      title: 'Upcoming Events',
      total: stats.events.total,
      trend: `${stats.events.upcoming} Active`,
      icon: Calendar,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      route: '/admin/events',
    },
    {
      title: 'Applications',
      total: stats.apps.total,
      trend: 'Latest resumes',
      icon: Briefcase,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      route: '/admin/careers',
    },
    {
      title: 'Unread Enquiries',
      total: stats.enquiries.unread,
      trend: `${stats.enquiries.total} Total`,
      icon: Mail,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-200/60">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {greeting()}, Admin
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Here's what's happening with your content today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/admin/news" className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow hover:bg-gray-800 transition-colors">
            <Plus className="mr-2 h-4 w-4" /> New Article
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {summaryCards.map((card, i) => (
          <Link key={i} to={card.route} className="block group">
            <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-gray-300">
              <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl ${card.bg} ${card.color}`}>
                    <card.icon className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600 transition-colors -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold tracking-tight text-gray-900">{card.total}</h3>
                  <p className="text-sm font-medium text-gray-500 mt-1 flex items-center gap-1.5">
                    {card.title}
                  </p>
                </div>
                <div className="text-xs text-gray-400 font-medium">
                  {card.trend}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Needs Attention */}
        <div className="lg:col-span-2">
          <Card className="h-full border-gray-200/75 shadow-sm">
            <div className="p-6 pb-4 border-b border-gray-100/75 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold tracking-tight text-gray-900">Needs Attention</h3>
                <p className="text-sm text-gray-500 mt-1">Items requiring your review.</p>
              </div>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
            <div className="p-6">
              <div className="space-y-4">
                
                <div className="group flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-200 hover:shadow-sm transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="bg-amber-100 text-amber-700 p-2 rounded-lg">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">Unread Enquiries</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Check out new customer messages</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                      {stats.enquiries.unread}
                    </span>
                    <Link to="/admin/contacts" className="text-sm font-medium text-gray-900 group-hover:text-amber-600 transition-colors">Review →</Link>
                  </div>
                </div>

                <div className="group flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-200 hover:shadow-sm transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="bg-indigo-100 text-indigo-700 p-2 rounded-lg">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">Draft Content</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Resume writing or publish drafts</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                      News: {stats.news.draft}
                    </span>
                    <Link to="/admin/news?status=draft" className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">Review →</Link>
                  </div>
                </div>

              </div>
            </div>
          </Card>
        </div>

        {/* Quick Links */}
        <div>
          <Card className="h-full border-gray-200/75 shadow-sm">
            <div className="p-6 pb-4 border-b border-gray-100/75">
               <h3 className="text-lg font-semibold tracking-tight text-gray-900">Quick Actions</h3>
               <p className="text-sm text-gray-500 mt-1">Jump right in</p>
            </div>
            <div className="p-6">
              <div className="space-y-2">
                {[
                  { label: 'Create Blog Post', icon: FileText, route: '/admin/blogs' },
                  { label: 'Publish News', icon: Newspaper, route: '/admin/news' },
                  { label: 'Add Event', icon: Calendar, route: '/admin/events' },
                  { label: 'Manage Roles', icon: Users, route: '/admin/roles' },
                ].map((action, i) => (
                  <Link 
                    key={i} 
                    to={action.route}
                    className="flex items-center justify-between p-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <action.icon className="w-4 h-4 text-gray-400" />
                      {action.label}
                    </div>
                    <Plus className="w-4 h-4 text-gray-400" />
                  </Link>
                ))}
              </div>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;