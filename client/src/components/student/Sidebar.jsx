// src/components/student/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { Home, BookOpen, FileText, Calendar, MessageSquare } from "lucide-react";

// Reusable menu item component
// eslint-disable-next-line no-unused-vars
const MenuItem = ({ to, icon: Icon, children }) => (
  <NavLink to={to} end>
    {({ isActive }) => (
      <div
        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
        ${
          isActive
            ? "bg-gradient-to-r from-blue-500/10 to-blue-500/5 text-blue-600 shadow-sm ring-1 ring-blue-100"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`}
      >
        <Icon
          size={18}
          className={`shrink-0 ${
            isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
          }`}
        />
        <span className="truncate">{children}</span>
      </div>
    )}
  </NavLink>
);

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-white/80 backdrop-blur-md border-r border-slate-200 px-5 py-6 flex flex-col shadow-md">
      {/* Brand */}
      <div className="mb-8">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Jifunze</h2>
        <p className="text-xs font-medium text-blue-500 uppercase">Student Panel</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-5">
        {/* Main */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase mb-2 px-1">
            Main
          </p>
          <MenuItem to="/student/dashboard" icon={Home}>Dashboard</MenuItem>
        </div>

        {/* Learning */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase mb-2 px-1">
            Learning
          </p>
          <MenuItem to="/student/courses" icon={BookOpen}>Courses</MenuItem>
          <MenuItem to="/student/resources" icon={BookOpen}>Resources</MenuItem>
          <MenuItem to="/student/enrollments" icon={FileText}>Enrollments</MenuItem>
          <MenuItem to="/student/attendance" icon={Calendar}>Attendance</MenuItem>
        </div>

        {/* Communication */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase mb-2 px-1">
            Communication
          </p>
          <MenuItem to="/student/messages" icon={MessageSquare}>Messages</MenuItem>
        </div>
      </nav>
    </aside>
  );
}
