// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { Users, BookOpen, School, TrendingUp, DollarSign } from "lucide-react";
import { fetchDashboard } from "../../api";

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await fetchDashboard();
        setDashboard(res.dashboard || {});
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

  const { stats = {}, recent_activity = {}, schools = [], total_schools = 0 } =
    dashboard;

  // Card animation variant
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.15, duration: 0.5, ease: "easeOut" },
    }),
  };

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">📊 Manager Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          {
            label: "Total Schools",
            value: total_schools,
            color: "bg-blue-100 text-blue-700",
            emoji: "🏫",
          },
          {
            label: "Students",
            value: stats.students ?? 0,
            color: "bg-green-100 text-green-700",
            emoji: "🎓",
          },
          {
            label: "Educators",
            value: stats.educators ?? 0,
            color: "bg-yellow-100 text-yellow-700",
            emoji: "👩‍🏫",
          },
          {
            label: "Courses",
            value: stats.total_courses ?? 0,
            color: "bg-purple-100 text-purple-700",
            emoji: "📚",
          },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <Card
              className={`${item.color} shadow-md rounded-2xl transition-transform duration-300 hover:scale-105 hover:shadow-lg`}
            >
              <CardContent className="p-6 text-center space-y-2">
                <div className="text-4xl">{item.emoji}</div>
                <p className="text-gray-600">{item.label}</p>
                <p className="text-3xl font-bold">{item.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <Card className="bg-pink-100 text-pink-700 shadow rounded-2xl transition-transform duration-300 hover:scale-105 hover:shadow-lg">
          <CardContent className="p-6 text-center space-y-2">
            <div className="text-4xl">🆕</div>
            <p className="text-gray-600">New Users This Week</p>
            <p className="text-3xl font-bold">
              {recent_activity.new_users_this_week ?? 0}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Schools Table */}
      <div>
        <h2 className="text-xl font-semibold mb-4">🏫 Schools Overview</h2>
        <div className="overflow-x-auto bg-white rounded-2xl shadow">
          {schools.length === 0 ? (
            <p className="p-4 text-gray-500">No schools available.</p>
          ) : (
            <table className="min-w-full text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3">School</th>
                  <th className="p-3 text-right">👩‍🎓 Students</th>
                  <th className="p-3 text-right">👨‍🏫 Educators</th>
                
                  <th className="p-3 text-right">📘 Courses</th>
                  <th className="p-3 text-right">🆕 New Users (7d)</th>
                </tr>
              </thead>
              <tbody>
                {schools.map((school, i) => (
                  <motion.tr
                    key={school.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b transition-colors hover:bg-gray-50"
                  >
                    <td className="p-3 font-medium">{school.name}</td>
                    <td className="p-3 text-right">{school.students ?? 0}</td>
                    <td className="p-3 text-right">{school.educators ?? 0}</td>
               
                    <td className="p-3 text-right">{school.total_courses ?? 0}</td>
                    <td className="p-3 text-right">
                      {school.new_users_this_week ?? 0}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
