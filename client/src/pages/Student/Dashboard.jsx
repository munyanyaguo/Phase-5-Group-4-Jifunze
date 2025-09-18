// src/pages/student/Dashboard.jsx
import React from "react";
import { BookOpen, Calendar, ClipboardList, CheckCircle } from "lucide-react";
import DashboardCard from "../../components/DashboardCard";

const StudentDashboard = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <DashboardCard title="Upcoming Lessons" value="3" icon={Calendar} color="bg-gradient-to-r from-blue-400 to-indigo-600" />
      <DashboardCard title="Resources" value="12" icon={BookOpen} color="bg-gradient-to-r from-green-400 to-emerald-600" />
      <DashboardCard title="Exams" value="2" icon={ClipboardList} color="bg-gradient-to-r from-pink-400 to-rose-600" />
      <DashboardCard title="Attendance" value="95%" icon={CheckCircle} color="bg-gradient-to-r from-yellow-400 to-orange-600" />
    </div>
  );
};

export default StudentDashboard;
