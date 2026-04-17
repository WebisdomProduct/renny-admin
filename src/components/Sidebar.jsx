import React, { useState } from 'react';
import logo from '../assets/RennyLogo.png';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LazyImage } from './ui/LazyImage';
import { 
  BarChart, Users, FileText, Newspaper, Calendar, LayoutTemplate, 
  Clock, Factory, ShieldCheck, Leaf, Star, Box, Package, ChevronDown, 
  LogOut, Layers, MessageSquare, Briefcase, Mail, Award, Settings, MapPin, UserPlus
} from 'lucide-react';
import { getAdminInfo, isSuperadmin } from '../utils/auth';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [openInvestor, setOpenInvestor] = useState(false);
  const adminInfo = getAdminInfo();

  const isInvestorPathActive = location.pathname.includes('/admin/financials') ||
    location.pathname.includes('/admin/corporate-governance') ||
    location.pathname.includes('/admin/industry-report') ||
    location.pathname.includes('/admin/ipo') ||
    location.pathname.includes('/admin/Share-holding-pattern') ||
    location.pathname.includes('/admin/our-policies');

  const isInvestorOpen = openInvestor || isInvestorPathActive;

  const navItemClass = ({ isActive }) =>
    `group flex items-center gap-3 px-3 py-2 rounded-2xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-slate-100 text-slate-900 shadow-sm'
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500'
    }`;

  const navSubItemClass = ({ isActive }) =>
    `group flex items-center gap-3 px-3 py-1.5 rounded-2xl text-sm transition-all duration-200 ml-7 ${
      isActive
        ? 'font-medium text-slate-900 bg-slate-50'
        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500'
    }`;

  return (
    <aside className="sticky top-0 z-20 flex h-screen w-[260px] shrink-0 flex-col border-r border-gray-200/75 bg-white">
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-gray-100/50 shrink-0">
        <LazyImage
          src={logo}
          alt="Renny Logo"
          wrapperClassName="relative flex h-10 w-32 items-center"
          className="relative h-full w-auto object-contain"
          placeholderClassName="rounded-2xl animate-pulse"
          fallbackSrc={logo}
        />
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
        
        {/* Core Group */}
        <div>
          <div className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Overview
          </div>
          <nav className="space-y-0.5">
            <NavLink to="/admin" end className={navItemClass}>
              <BarChart className="w-4 h-4" />
              <span>Dashboard</span>
            </NavLink>
            {isSuperadmin(adminInfo) && (
              <NavLink to="/admin/roles" className={navItemClass}>
                <Users className="w-4 h-4" />
                <span>Manage Roles</span>
              </NavLink>
            )}
            {isSuperadmin(adminInfo) && (
              <NavLink to="/admin/create-admin" className={navItemClass}>
                <UserPlus className="w-4 h-4" />
                <span>Create Admin</span>
              </NavLink>
            )}
          </nav>
        </div>

        {/* Content Group */}
        <div>
          <div className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Content Management
          </div>
          <nav className="space-y-0.5">
            <NavLink to="/admin/blogs" className={navItemClass}>
              <FileText className="w-4 h-4" />
              <span>Blogs</span>
            </NavLink>
            <NavLink to="/admin/news" className={navItemClass}>
              <Newspaper className="w-4 h-4" />
              <span>News</span>
            </NavLink>
            <NavLink to="/admin/events" className={navItemClass}>
              <Calendar className="w-4 h-4" />
              <span>Events</span>
            </NavLink>
            <NavLink to="/admin/page-sections" className={navItemClass}>
              <LayoutTemplate className="w-4 h-4" />
              <span>Page Sections</span>
            </NavLink>
            <NavLink to="/admin/timeline" className={navItemClass}>
              <Clock className="w-4 h-4" />
              <span>Timeline</span>
            </NavLink>
            <NavLink to="/admin/units" className={navItemClass}>
              <Factory className="w-4 h-4" />
              <span>Manufacturing Units</span>
            </NavLink>
            <NavLink to="/admin/specifications" className={navItemClass}>
              <ShieldCheck className="w-4 h-4" />
              <span>Quality & Standards</span>
            </NavLink>
            <NavLink to="/admin/esg-projects" className={navItemClass}>
              <Leaf className="w-4 h-4" />
              <span>ESG Projects</span>
            </NavLink>
            <NavLink to="/admin/success-stories" className={navItemClass}>
              <Star className="w-4 h-4" />
              <span>Success Stories</span>
            </NavLink>
            <NavLink to="/admin/plants" className={navItemClass}>
              <Box className="w-4 h-4" />
              <span>Plants</span>
            </NavLink>
            <NavLink to="/admin/product-content" className={navItemClass}>
              <Package className="w-4 h-4" />
              <span>Product Pages</span>
            </NavLink>
            <NavLink to="/admin/scaffolding" className={navItemClass}>
              <Box className="w-4 h-4" />
              <span>Scaffolding Products</span>
            </NavLink>
            <NavLink to="/admin/design-centre" className={navItemClass}>
              <Layers className="w-4 h-4" />
              <span>Design Centre</span>
            </NavLink>
            <NavLink to="/admin/contact-info" className={navItemClass}>
              <MapPin className="w-4 h-4" />
              <span>Contact Info</span>
            </NavLink>
          </nav>
        </div>

        {/* Engagement Group */}
        <div>
          <div className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Engagement
          </div>
          <nav className="space-y-0.5">
            <NavLink to="/admin/careers" className={navItemClass}>
              <Briefcase className="w-4 h-4" />
              <span>Careers</span>
            </NavLink>
            <NavLink to="/admin/contacts" className={navItemClass}>
              <MessageSquare className="w-4 h-4" />
              <span>Contacts</span>
            </NavLink>
            <NavLink to="/admin/sustainability-leads" className={navItemClass}>
              <Leaf className="w-4 h-4 text-green-600" />
              <span>Sustainability Leads</span>
            </NavLink>
            <NavLink to="/admin/certificate-admin" className={navItemClass}>
              <Award className="w-4 h-4" />
              <span>Certificates</span>
            </NavLink>
            <NavLink to="/admin/newsletter" className={navItemClass}>
              <Mail className="w-4 h-4" />
              <span>Newsletter</span>
            </NavLink>
          </nav>
        </div>

        {/* Investor Relations (Collapsible) */}
        <div>
          <div className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Company
          </div>
          <nav className="space-y-0.5">
            <button
              onClick={() => setOpenInvestor(!openInvestor)}
              className="w-full group flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all focus:outline-none"
            >
              <div className="flex items-center gap-3">
                <Layers className="w-4 h-4" />
                <span>Investor Relations</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isInvestorOpen ? 'rotate-180' : ''}`} />
            </button>

            {isInvestorOpen && (
              <div className="mt-1 space-y-0.5 animate-in slide-in-from-top-2 fade-in duration-200">
                <NavLink to="/admin/financials/" className={navSubItemClass}>
                  Financials
                </NavLink>
                <NavLink to="/admin/corporate-governance/" className={navSubItemClass}>
                  Corporate Governance
                </NavLink>
                <NavLink to="/admin/industry-report/" className={navSubItemClass}>
                  Industry Report
                </NavLink>
                <NavLink to="/admin/ipo/" className={navSubItemClass}>
                  IPO Documents
                </NavLink>
                <NavLink to="/admin/ipo-audio-visual/" className={navSubItemClass}>
                  IPO Audio Visual
                </NavLink>
                <NavLink to="/admin/Share-holding-pattern/" className={navSubItemClass}>
                  Shareholding Pattern
                </NavLink>
                <NavLink to="/admin/our-policies/" className={navSubItemClass}>
                  Our Policies
                </NavLink>
              </div>
            )}
          </nav>
        </div>

      </div>

      {/* Footer User / Logout */}
      <div className="p-4 border-t border-gray-100/50 shrink-0">
        <button
          onClick={() => {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminInfo');
            navigate('/');
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:text-red-600 transition-colors cursor-pointer focus:outline-none shadow-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
