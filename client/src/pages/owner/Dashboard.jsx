// src/pages/owner/Dashboard.jsx
import React from "react";
import DashboardCard from "../../components/common/DashboardCard";
import { Users, BookOpen, School, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Dashboard() {
  // Mock stats - replace with API
  const stats = [
    { title: "Total Schools", value: 3, icon: <School /> },
    { title: "Students", value: 350, icon: <Users /> },
    { title: "Educators", value: 25, icon: <Users /> },
    { title: "Resources", value: 120, icon: <BookOpen /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Owner Dashboard</h2>
        <p className="text-gray-500">Overview of your platform</p>
      </div>

      <motion.div layout className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((s) => (
          <DashboardCard key={s.title} title={s.title} value={s.value} icon={s.icon} />
        ))}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
          <div className="flex flex-col gap-3">
            <Link to="/owner/schools" className="text-blue-600">Manage Schools</Link>
            <Link to="/owner/students" className="text-blue-600">Manage Students</Link>
            <Link to="/owner/educators" className="text-blue-600">Manage Educators</Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>✅ New school created - Sunrise Academy</li>
            <li>📌 Resource uploaded - Algebra notes</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-2">Reports</h3>
          <p className="text-gray-600">Attendance summary & performance reports.</p>
        </div>
      </div>
    </div>
  );
}
