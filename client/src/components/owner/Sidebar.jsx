// src/components/owner/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { Home, Users, BookOpen, BarChart3, School } from "lucide-react";

const MenuItem = ({ to, icon: Icon, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2 rounded-lg ${
        isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-100"
      }`
    }
  >
    <Icon size={18} />
    <span>{children}</span>
  </NavLink>
);

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r px-4 py-6 flex flex-col">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800">Jifunze</h2>
        <p className="text-sm text-gray-500">Owner</p>
      </div>

      <nav className="flex-1 space-y-1">
        <MenuItem to="/owner/dashboard" icon={Home}>Dashboard</MenuItem>
        <MenuItem to="/owner/schools" icon={School}>Schools</MenuItem>
        <MenuItem to="/owner/students" icon={Users}>Students</MenuItem>
        <MenuItem to="/owner/educators" icon={Users}>Educators</MenuItem>
        <MenuItem to="/owner/users" icon={Users}>Users</MenuItem>
        <MenuItem to="/owner/courses" icon={BookOpen}>Courses</MenuItem>
        <MenuItem to="/owner/reports" icon={BarChart3}>Reports</MenuItem>
      </nav>

      <div className="mt-6">
        <small className="text-xs text-gray-400">v0.1 • MVP</small>
      </div>
    </aside>
  );
}
