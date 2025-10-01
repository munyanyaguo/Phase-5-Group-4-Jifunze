// src/components/student/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { Home, BookOpen, FileText, Calendar, MessageSquare, LogOut } from "lucide-react";

export default function Sidebar() {
  const Item = ({ to, icon: Icon, children }) => (
    <NavLink to={to} className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-100"}`}>
      <Icon size={16} /> {children}
    </NavLink>
  );

  return (
    <aside className="w-64 bg-white border-r p-4">
      <h3 className="font-bold mb-4">Student</h3>
      <nav className="flex flex-col gap-1">
        <Item to="/student/dashboard" icon={Home}>Dashboard</Item>
        <Item to="/student/courses" icon={BookOpen}>Courses</Item>
        <Item to="/student/resources" icon={BookOpen}>Resources</Item>
        <Item to="/student/enrollments" icon={FileText}>Enrollments</Item>
        <Item to="/student/attendance" icon={FileText}>Attendance</Item>
        <Item to="/student/messages" icon={FileText}>Messages</Item>
      </nav>
    </aside>
  );
}
