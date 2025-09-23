// src/pages/student/Dashboard.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function StudentDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Welcome Student</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold">Upcoming Lessons</h3>
          <p className="text-sm text-gray-500 mt-2">Math - Tomorrow 10:00AM</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold">Exams</h3>
          <p className="text-sm text-gray-500 mt-2"><Link to="/student/exams" className="text-blue-600">Go to exams</Link></p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold">Resources</h3>
          <p className="text-sm text-gray-500 mt-2"><Link to="/student/resources" className="text-blue-600">Open resources</Link></p>
        </div>
      </div>
    </div>
  );
}
