// src/pages/schoolOwner/Dashboard.jsx
import { Users, UserCheck, BookOpen, CalendarCheck } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const stats = [
    { title: "Total Students", value: 350, icon: <Users size={28} className="text-white" />, color: "bg-blue-500" },
    { title: "Total Educators", value: 25, icon: <UserCheck size={28} className="text-white" />, color: "bg-purple-500" },
    { title: "Attendance Rate", value: "92%", icon: <CalendarCheck size={28} className="text-white" />, color: "bg-green-500" },
    { title: "Resources Uploaded", value: 120, icon: <BookOpen size={28} className="text-white" />, color: "bg-yellow-500" },
  ];

  const quickLinks = [
    { name: "Manage Students", path: "/owner/students", color: "bg-blue-600" },
    { name: "Manage Educators", path: "/owner/educators", color: "bg-purple-600" },
    { name: "Manage Schools", path: "/owner/schools", color: "bg-green-600" },
    { name: "Resources", path: "/owner/resources", color: "bg-yellow-600" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Welcome, School Owner</h2>
        <p className="text-gray-500 mt-1">Here’s an overview of your school management system.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, idx) => (
          <div key={idx} className={`flex items-center p-6 rounded-xl shadow hover:shadow-lg transition ${s.color}`}>
            <div className="p-3 rounded-full bg-white/25 mr-4">{s.icon}</div>
            <div>
              <p className="text-white text-lg font-semibold">{s.value}</p>
              <p className="text-white/90 text-sm">{s.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div>
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Quick Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {quickLinks.map((link, idx) => (
            <Link
              key={idx}
              to={link.path}
              className={`flex items-center justify-center h-24 rounded-xl text-white font-semibold shadow hover:shadow-lg transition ${link.color}`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
