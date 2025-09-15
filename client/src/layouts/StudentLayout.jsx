// src/layouts/StudentLayout.jsx
import React from "react";
import { Outlet, Link } from "react-router-dom";

const StudentLayout = () => {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-green-600 text-white p-4 space-y-4">
        <h2 className="text-2xl font-bold">Student</h2>
        <nav className="space-y-2">
          <Link to="/student/dashboard" className="block hover:text-yellow-300">Dashboard</Link>
          <Link to="/student/resources" className="block hover:text-yellow-300">Resources</Link>
          <Link to="/student/attendance" className="block hover:text-yellow-300">Attendance</Link>
          <Link to="/student/assessments" className="block hover:text-yellow-300">Exams</Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 bg-gray-100">
        <Outlet />
      </main>
    </div>
  );
};

export default StudentLayout;
