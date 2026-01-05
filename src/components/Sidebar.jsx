import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import logo from '../assets/RennyLogo.png';
import { NavLink, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);

  const linkClass = ({ isActive }) =>
    `px-4 py-2 rounded-lg text-left transition flex items-center gap-2 ${
      isActive ? 'bg-blue text-white' : 'text-gray-800 hover:bg-gray-200'
    }`;

  /** Auto-close on route change */
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  /** Close on outside click */
  useEffect(() => {
    const handler = e => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !triggerRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleDropdown = () => {
    const rect = triggerRef.current.getBoundingClientRect();
    setPosition({
      top: rect.top - 80,
      left: rect.right + 8,
    });
    setOpen(prev => !prev);
  };

  return (
    <>
      {/* SIDEBAR */}
      <aside className="w-[22%] bg-white px-6 py-6 flex flex-col h-screen overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <img src={logo} alt="Renny Logo" className="w-44 object-contain" />
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-3">
          <NavLink to="/admin" end className={linkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/admin/blogs" className={linkClass}>
            Blogs
          </NavLink>
          <NavLink to="/admin/news" className={linkClass}>
            News
          </NavLink>
          <NavLink to="/admin/events" className={linkClass}>
            Events
          </NavLink>

          {/* Investor Relations */}
          <button
            ref={triggerRef}
            onClick={toggleDropdown}
            className="px-4 py-2 rounded-lg transition flex items-center justify-between hover:bg-gray-200 text-gray-800"
          >
            <span>Investor Relations</span>
            <i
              className={`ri-arrow-down-s-line text-lg transition-transform ${
                open ? 'rotate-180' : ''
              }`}
            />
          </button>

          <NavLink to="/admin/careers" className={linkClass}>
            Careers
          </NavLink>
          <NavLink to="/admin/contacts" className={linkClass}>
            Contacts
          </NavLink>
        </nav>

        {/* Logout */}
        <div className="mt-auto">
          <button className="w-full px-4 py-2 rounded-lg text-red-600 hover:bg-red-100">
            Logout
          </button>
        </div>
      </aside>

      {/* DROPDOWN PORTAL */}
      {open &&
        ReactDOM.createPortal(
          <ul
            ref={dropdownRef}
            style={{
              top: position.top,
              left: position.left,
            }}
            className="fixed bg-white shadow-xl w-72 z-[9999] rounded-lg "
          >
            <li>
              <NavLink to="/admin/financials/" className={linkClass}>
                Financials
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/corporate-governance/" className={linkClass}>
                Corporate Governance
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/industry-report/" className={linkClass}>
                Industry Report
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/ipo/" className={linkClass}>
                IPO Documents
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/ipo-audio-visual/" className={linkClass}>
                IPO Audio Visual
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/Share-holding-pattern/" className={linkClass}>
                Shareholding Pattern
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/our-policies/" className={linkClass}>
                Our Policies
              </NavLink>
            </li>
          </ul>,
          document.body
        )}
    </>
  );
};

export default Sidebar;
