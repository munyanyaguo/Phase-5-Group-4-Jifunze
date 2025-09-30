// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { fetchDashboard } from "../../api";
import { Card, CardContent } from "@/components/ui/card";

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await fetchDashboard();
        setDashboard(res.dashboard);
      } catch (err) {
        setError(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (loading) return <p className="text-gray-500">Loading dashboard...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!dashboard) return <p>No dashboard data available.</p>;

  const { stats, recent_activity, schools, total_schools } = dashboard;

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">Manager Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card className="bg-blue-50 shadow-md rounded-2xl">
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">Total Schools</p>
            <p className="text-2xl font-bold">{total_schools}</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 shadow-md rounded-2xl">
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">Students</p>
            <p className="text-2xl font-bold">{stats.students}</p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 shadow-md rounded-2xl">
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">Educators</p>
            <p className="text-2xl font-bold">{stats.educators}</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 shadow-md rounded-2xl">
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">Courses</p>
            <p className="text-2xl font-bold">{stats.total_courses}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white shadow rounded-2xl">
          <CardContent className="p-6">
            <p className="text-gray-500">New Users This Week</p>
            <p className="text-2xl font-bold">{recent_activity.new_users_this_week}</p>
          </CardContent>
        </Card>
      </div>

      {/* Schools Table */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Schools Overview</h2>
        <div className="overflow-x-auto bg-white rounded-2xl shadow">
          <table className="min-w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">School</th>
                <th className="p-3">Students</th>
                <th className="p-3">Educators</th>
                <th className="p-3">Managers</th>
                <th className="p-3">Courses</th>
                <th className="p-3">New Users (7d)</th>
              </tr>
            </thead>
            <tbody>
              {schools.map((school) => (
                <tr key={school.id} className="border-b">
                  <td className="p-3 font-medium">{school.name}</td>
                  <td className="p-3">{school.students}</td>
                  <td className="p-3">{school.educators}</td>
                  <td className="p-3">{school.managers}</td>
                  <td className="p-3">{school.total_courses}</td>
                  <td className="p-3">{school.new_users_this_week}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
