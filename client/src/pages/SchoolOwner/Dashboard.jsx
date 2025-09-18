// src/pages/SchoolOwner/Dashboard.jsx
import React from "react";
import { Users, BookOpen, School, FileText, CalendarCheck } from "lucide-react";

const stats = [
  { title: "Total Students", value: 320, icon: Users, color: "bg-blue-100 text-blue-600" },
  { title: "Educators", value: 25, icon: BookOpen, color: "bg-green-100 text-green-600" },
  { title: "Classes", value: 12, icon: School, color: "bg-purple-100 text-purple-600" },
  { title: "Resources", value: 140, icon: FileText, color: "bg-orange-100 text-orange-600" },
  { title: "Attendance Today", value: "92%", icon: CalendarCheck, color: "bg-pink-100 text-pink-600" },
];

export default function OwnerDashboard() {
  return (
    <div>
      {/* Header */}
      <h1 className="text-2xl font-bold mb-6">Owner Dashboard</h1>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        {stats.map((item, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-md p-5 flex items-center gap-4">
            <div className={`p-3 rounded-full ${item.color}`}>
              <item.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">{item.title}</p>
              <p className="text-xl font-semibold">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
            + Add School
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
            + Add Educator
          </button>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg">
            + Add Student
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg">
            + Add Class
          </button>
          <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg">
            + Upload Resource
          </button>
        </div>
      </div>

      {/* Recent Activity & Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <ul className="space-y-3 text-sm text-gray-700">
            <li>✅ Educator John added a new resource for Class 8.</li>
            <li>📚 Student Mary joined Class 7 Science.</li>
            <li>👩‍🏫 New educator Jane was added to Class 5.</li>
          </ul>
        </div>

        {/* Resource Repository */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Latest Resources</h2>
          <ul className="space-y-3 text-sm text-gray-700">
            <li>📄 Math Revision Paper (Class 8)</li>
            <li>📄 Science Notes (Class 7)</li>
            <li>📄 English Essay Guide (Class 6)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
