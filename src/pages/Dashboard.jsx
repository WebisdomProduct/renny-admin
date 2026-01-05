import {
  FileText,
  Newspaper,
  Calendar,
  Briefcase,
  Mail,
  Plus,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const summaryCards = [
  {
    title: 'Blogs',
    total: 12,
    meta: '8 Published • 4 Drafts',
    icon: FileText,
    route: '/admin/blogs',
  },
  {
    title: 'News',
    total: 6,
    meta: '4 Published • 2 Drafts',
    icon: Newspaper,
    route: '/admin/news',
  },
  {
    title: 'Events',
    total: 3,
    meta: '1 Upcoming • 2 Completed',
    icon: Calendar,
    route: '/admin/events',
  },
  {
    title: 'Applications',
    total: 42,
    meta: 'Latest received today',
    icon: Briefcase,
    route: '/admin/careers',
  },
  {
    title: 'Enquiries',
    total: 16,
    meta: '5 Unread',
    icon: Mail,
    route: '/admin/contacts',
  },
];

const Dashboard = () => {
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

        {/* Admin profile placeholder */}
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
            {/* Top Row */}
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

            {/* Meta */}
            <p className="text-sm text-gray-500 mt-3">{card.meta}</p>
          </Link>
        ))}
      </div>

      {/* Needs Attention + Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Needs Attention */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Needs Attention
          </h3>

          <ul className="space-y-3 text-sm">
            <li className="flex items-center justify-between px-2 py-1 rounded-md transition hover:font-semibold">
              <span className="text-gray-700">Draft Blogs</span>
              <Link
                to="/admin/blogs?status=draft"
                className="font-medium text-gray-900 hover:font-semibold"
              >
                4
              </Link>
            </li>

            <li className="flex items-center justify-between px-2 py-1 rounded-md transition    hover:font-semibold">
              <span className="text-gray-700">Draft News Articles</span>
              <Link
                to="/admin/news?status=draft"
                className="font-medium text-gray-900 hover:font-semibold"
              >
                2
              </Link>
            </li>

            <li className="flex items-center justify-between px-2 py-1 rounded-md transition hover:font-semibold">
              <span className="text-gray-700">Upcoming Events</span>
              <Link
                to="/admin/events?filter=upcoming"
                className="font-medium text-gray-900 hover:font-semibold"
              >
                1
              </Link>
            </li>
          </ul>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>

          <div className="space-y-3">
            <a
              href="/admin/blogs"
              className="flex items-center gap-2 text-sm font-medium text-gray-900 hover:font-semibold"
            >
              <Plus size={16} /> Create Blog
            </a>

            <a
              href="/admin/news"
              className="flex items-center gap-2 text-sm font-medium text-gray-900 hover:font-semibold"
            >
              <Plus size={16} /> Create News
            </a>

            <a
              href="/admin/events"
              className="flex items-center gap-2 text-sm font-medium text-gray-900 hover:font-semibold"
            >
              <Plus size={16} /> Create Event
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
