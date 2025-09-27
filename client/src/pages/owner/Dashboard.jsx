// src/pages/owner/Dashboard.jsx
import React, { useEffect, useState } from "react";
import api from "../../api"; // use request wrapper
import DashboardCard from "../../components/owner/DashboardCard";
import ReportChart from "../../components/owner/ReportsChart";
import { Users, BookOpen, School } from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState({}); // start as empty object
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentCourses, setRecentCourses] = useState([]);
  const [recentSchools, setRecentSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.request("/api/users/dashboard"); // using request wrapper
        console.log("Dashboard response:", res);

        setStats(res.dashboard?.user_stats || {});
        setRecentUsers(res.dashboard?.recent_users || []);
        setRecentCourses(res.dashboard?.recent_courses || []);
        setRecentSchools(res.dashboard?.recent_schools || []);
      } catch (error) {
        console.error("Error fetching dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <h2 className="text-2xl font-bold">School Owner Dashboard</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard
          title="Educators"
          value={stats.educators || 0}
          icon={<Users className="text-blue-500" />}
        />
        <DashboardCard
          title="Students"
          value={stats.students || 0}
          icon={<Users className="text-green-500" />}
        />
        <DashboardCard
          title="Courses"
          value={stats.courses || 0}
          icon={<BookOpen className="text-purple-500" />}
        />
        <DashboardCard
          title="Schools"
          value={stats.schools || 0}
          icon={<School className="text-orange-500" />}
        />
      </div>

      {/* Chart */}
      <ReportChart stats={stats} />

      {/* Recent Users */}
      <div>
        <h3 className="text-xl font-semibold mb-3">Recent Users</h3>
        <ul className="bg-white shadow rounded-lg p-4 space-y-2">
          {recentUsers.length > 0 ? (
            recentUsers.map((user) => (
              <li key={user.id} className="flex justify-between border-b py-2">
                <span>
                  {user.name} ({user.role})
                </span>
                <span className="text-gray-500 text-sm">{user.email}</span>
              </li>
            ))
          ) : (
            <p className="text-gray-500">No recent users</p>
          )}
        </ul>
      </div>

      {/* Recent Courses */}
      <div>
        <h3 className="text-xl font-semibold mb-3">Recent Courses</h3>
        <ul className="bg-white shadow rounded-lg p-4 space-y-2">
          {recentCourses.length > 0 ? (
            recentCourses.map((course) => (
              <li key={course.id} className="flex justify-between border-b py-2">
                <span>{course.name}</span>
                <span className="text-gray-500 text-sm">
                  {course.created_at}
                </span>
              </li>
            ))
          ) : (
            <p className="text-gray-500">No recent courses</p>
          )}
        </ul>
      </div>

      {/* Recent Schools */}
      <div>
        <h3 className="text-xl font-semibold mb-3">Recent Schools</h3>
        <ul className="bg-white shadow rounded-lg p-4 space-y-2">
          {recentSchools.length > 0 ? (
            recentSchools.map((school) => (
              <li key={school.id} className="flex justify-between border-b py-2">
                <span>{school.name}</span>
                <span className="text-gray-500 text-sm">
                  {school.created_at}
                </span>
              </li>
            ))
          ) : (
            <p className="text-gray-500">No recent schools</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
