// src/pages/owner/Reports.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, FileText } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function Reports() {
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [attendance, setAttendance] = useState(0);
  const [courseStats, setCourseStats] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch manager's schools
  const loadSchools = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/manager/schools", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (data.success) {
        setSchools(data.schools);
        if (data.schools.length > 0) {
          setSelectedSchool(data.schools[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch schools:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats for a specific school
  const loadSchoolStats = async (schoolId) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/schools/${schoolId}/stats`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (data.success) {
        setAttendance(data.attendance || 0);
        setCourseStats(data.courses || []);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadSchools();
  }, []);

  // Load stats when school changes
  useEffect(() => {
    if (selectedSchool) {
      loadSchoolStats(selectedSchool.id);
    }
  }, [selectedSchool]);

  return (
    <motion.div
      className="p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FileText className="w-6 h-6 text-blue-600" />
        Reports & Analytics
      </h1>

      {/* School Selector */}
      {schools.length > 0 && (
        <div className="mb-6">
          <label className="mr-3 font-medium">Select School:</label>
          <select
            className="border p-2 rounded"
            value={selectedSchool?.id || ""}
            onChange={(e) =>
              setSelectedSchool(
                schools.find((s) => s.id === parseInt(e.target.value))
              )
            }
          >
            {schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Loading reports...</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          {/* Attendance Summary */}
          <motion.div
            className="bg-white shadow rounded-2xl p-5"
            whileHover={{ scale: 1.02 }}
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
              Attendance Summary
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={[{ name: selectedSchool?.name, attendance }]}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="attendance" fill="#2563eb" radius={8} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Course Performance */}
          <motion.div
            className="bg-white shadow rounded-2xl p-5"
            whileHover={{ scale: 1.02 }}
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Course Attendance Rates
            </h2>
            {courseStats.length === 0 ? (
              <p className="text-gray-500">No course data available.</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={courseStats}>
                  <XAxis dataKey="course" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="avg_attendance" fill="#9333ea" radius={8} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
