// src/components/educator/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { Home, Users, BookOpen, CalendarCheck } from "lucide-react";

const Item = ({ to, icon: I, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-100"}`}
  >
    <I size={16} /> {children}
  </NavLink>
);

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r p-4">
      <h3 className="font-bold mb-4">Educator</h3>
      <nav className="flex flex-col gap-1">
        <Item to="/educator/dashboard" icon={Home}>Dashboard</Item>
        <Item to="/educator/classes" icon={BookOpen}>Classes</Item>
        <Item to="/educator/students" icon={Users}>Students</Item>
        <Item to="/educator/resources" icon={BookOpen}>Resources</Item>
        <Item to="/educator/attendance" icon={CalendarCheck}>Attendance</Item>
        
      </nav>
    </aside>
  );
}
