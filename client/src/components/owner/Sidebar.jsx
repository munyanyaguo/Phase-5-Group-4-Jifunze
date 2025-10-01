// src/components/owner/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { Home, School, Users, BookOpen, FileText, BarChart3, LogOut } from "lucide-react";

// Reusable menu item component
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
        <p className="text-xs font-medium text-blue-500 uppercase">Owner Panel</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-5">
        {/* Main */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase mb-2 px-1">
            Main
          </p>
          <MenuItem to="/owner/dashboard" icon={Home}>Dashboard</MenuItem>
        </div>

        {/* Management */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase mb-2 px-1">
            Management
          </p>
          <MenuItem to="/owner/schools" icon={School}>Schools</MenuItem>
          <MenuItem to="/owner/students" icon={Users}>Students</MenuItem>
          <MenuItem to="/owner/educators" icon={Users}>Educators</MenuItem>
          <MenuItem to="/owner/users" icon={Users}>Users</MenuItem>
          <MenuItem to="/owner/courses" icon={BookOpen}>Courses</MenuItem>
          <MenuItem to="/owner/enrollments" icon={BookOpen}>Enrollments</MenuItem>
        </div>

        {/* Analytics */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase mb-2 px-1">
            Analytics
          </p>
          <MenuItem to="/owner/reports" icon={BarChart3}>Reports</MenuItem>
        </div>
      </nav>

    
    </aside>
  );
}
