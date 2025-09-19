// src/pages/educator/Dashboard.jsx
import { useState, useEffect } from "react";
import { BookOpen, Users, Video, FileText } from "lucide-react";
import DashboardCard from "../../components/educator/DashboardCard";

export default function EducatorDashboard() {
  // Dummy state (later replace with API calls)
  const [stats, setStats] = useState({
    students: 0,
    classes: 0,
    resources: 0,
    onlineSessions: 0,
  });

  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    // 🚀 Simulating API fetch
    const fetchData = () => {
      // Replace with real API later
      setStats({
        students: 120,
        classes: 5,
        resources: 18,
        onlineSessions: 3,
      });

      setRecentActivity([
        { action: 'Uploaded: "Algebra Notes - Class 8"', time: "2 hrs ago" },
        { action: "Scheduled Online Class - Physics", time: "Yesterday" },
        { action: "Marked attendance for Class B", time: "2 days ago" },
      ]);
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <h2 className="text-3xl font-bold text-gray-800">Welcome, Educator 👩‍🏫</h2>
      <p className="text-gray-600">Here’s an overview of your classes, students, and resources.</p>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="My Students"
          value={stats.students}
          icon={<Users className="w-8 h-8 text-blue-600" />}
        />
        <DashboardCard
          title="Classes"
          value={stats.classes}
          icon={<BookOpen className="w-8 h-8 text-green-600" />}
        />
        <DashboardCard
          title="Resources"
          value={stats.resources}
          icon={<FileText className="w-8 h-8 text-purple-600" />}
        />
        <DashboardCard
          title="Online Sessions"
          value={stats.onlineSessions}
          icon={<Video className="w-8 h-8 text-red-600" />}
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <h3 className="text-xl font-semibold text-gray-700">Recent Activity</h3>
        <ul className="space-y-3">
          {recentActivity.map((item, index) => (
            <li
              key={index}
              className="flex items-center justify-between border-b pb-2 last:border-b-0"
            >
              <span>{item.action}</span>
              <span className="text-sm text-gray-500">{item.time}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
