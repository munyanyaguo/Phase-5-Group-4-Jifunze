// src/layouts/EducatorLayout.jsx
import React from "react";
import { Outlet, Link } from "react-router-dom";

const EducatorLayout = () => {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-600 text-white p-4 space-y-4">
        <h2 className="text-2xl font-bold">Educator</h2>
        <nav className="space-y-2">
          <Link to="/educator/dashboard" className="block hover:text-yellow-300">Dashboard</Link>
          <Link to="/educator/attendance" className="block hover:text-yellow-300">Attendance</Link>
          <Link to="/educator/resources" className="block hover:text-yellow-300">Resources</Link>
          <Link to="/educator/assessments" className="block hover:text-yellow-300">Assessments</Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 bg-gray-100">
        <Outlet />
      </main>
    </div>
  );
};

export default EducatorLayout;
