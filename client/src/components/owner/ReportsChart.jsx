// src/components/owner/ReportChart.jsx
import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import { getCurrentUser } from "../../services/authServices";

export default function ReportChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        // ✅ Get logged-in user to access school_id
        const user = await getCurrentUser();
        if (!user?.school_id) {
          console.warn("No school_id found for this user");
          setLoading(false);
          return;
        }

        // ✅ Use API helper
        const dashboardData = await getOwnerDashboard(user.school_id);

        // Example: backend might return { registrations: [...] }
        setData(dashboardData.registrations || []);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  if (loading) {
    return <p className="text-center text-gray-500">Loading chart...</p>;
  }

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h2 className="text-xl font-semibold mb-4">Registrations Overview</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="students" fill="#3b82f6" name="Students" />
          <Bar dataKey="educators" fill="#10b981" name="Educators" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
