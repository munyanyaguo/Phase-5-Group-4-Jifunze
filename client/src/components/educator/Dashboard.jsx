// src/pages/educator/Dashboard.jsx
import React, { useEffect, useState } from "react";
import DashboardCard from "../../components/common/DashboardCard";
import { Users, BookOpen, Video } from "lucide-react";

export default function EducatorDashboard() {
  const [stats, setStats] = useState({ students: 0, classes: 0, resources: 0, sessions: 0 });

  useEffect(() => {
    // mock fetch
    setStats({ students: 120, classes: 5, resources: 18, sessions: 2 });
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Educator Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <DashboardCard title="Students" value={stats.students} icon={<Users />} />
        <DashboardCard title="Classes" value={stats.classes} icon={<BookOpen />} />
        <DashboardCard title="Resources" value={stats.resources} icon={<BookOpen />} />
        <DashboardCard title="Sessions" value={stats.sessions} icon={<Video />} />
      </div>
    </div>
  );
}
