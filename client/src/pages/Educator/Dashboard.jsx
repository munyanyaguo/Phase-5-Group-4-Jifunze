// src/pages/educator/Dashboard.jsx
import React from "react";
import { Users, BookOpen, ClipboardCheck, Calendar } from "lucide-react";
import DashboardCard from "../../components/DashboardCard";

const EducatorDashboard = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <DashboardCard title="Today’s Lessons" value="5" icon={Calendar} color="bg-gradient-to-r from-indigo-500 to-purple-500" />
      <DashboardCard title="Students" value="120" icon={Users} color="bg-gradient-to-r from-green-400 to-emerald-600" />
      <DashboardCard title="Resources" value="34" icon={BookOpen} color="bg-gradient-to-r from-pink-400 to-rose-600" />
      <DashboardCard title="Pending Reviews" value="8" icon={ClipboardCheck} color="bg-gradient-to-r from-orange-400 to-yellow-600" />
    </div>
  );
};

export default EducatorDashboard;
