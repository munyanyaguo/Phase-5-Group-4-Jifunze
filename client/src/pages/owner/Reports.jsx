// src/pages/owner/Reports.jsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, FileText, Activity } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { fetchDashboard, fetchSchoolStats } from "../../api";

export default function Reports() {
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [attendance, setAttendance] = useState(0);
  const [courseStats, setCourseStats] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch manager's schools via dashboard
  const loadSchools = async () => {
    try {
      setLoading(true);
      const dash = await fetchDashboard();
      console.log("Dashboard response:", dash);
      
      // Handle both wrapped and unwrapped responses
      const dashData = dash?.dashboard || dash;
      console.log("Dashboard data:", dashData);
      
      const list = dashData?.schools || [];
      console.log("Schools list:", list);
      
      setSchools(list);
      if (list.length > 0) {
        setSelectedSchool(list[0]);
        console.log("Selected school:", list[0]);
      } else {
        console.warn("No schools found in dashboard");
      }
    } catch (err) {
      console.error("Failed to fetch schools:", err);
      alert("Failed to load schools: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats for a specific school
  const loadSchoolStats = async (schoolId) => {
    if (!schoolId) {
      console.warn("No school ID provided for stats");
      return;
    }
    
    try {
      setLoading(true);
      console.log("Fetching stats for school ID:", schoolId);
      const response = await fetchSchoolStats(schoolId);
      console.log("Stats response:", response);
      
      // The backend returns: { school, attendance, courses }
      // Our API wrapper may return it directly or wrapped
      const statsData = response?.stats || response;
      console.log("Stats data:", statsData);
      
      const attendanceValue = statsData?.attendance || 0;
      const coursesValue = statsData?.courses || [];
      
      setAttendance(attendanceValue);
      setCourseStats(coursesValue);
      
      console.log("Set attendance:", attendanceValue);
      console.log("Set course stats:", coursesValue);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
      alert("Failed to load stats: " + err.message);
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
      className="p-4 md:p-6 bg-gradient-to-br from-slate-50 via-white to-slate-50 min-h-[calc(100vh-64px)]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between gap-3 mb-5 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2">
          <FileText className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
          Reports & Analytics
        </h1>
        {schools.length > 0 && (
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">School</label>
            <select
              className="border border-slate-200 bg-white text-slate-800 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              value={selectedSchool?.id || ""}
              onChange={(e) => setSelectedSchool(schools.find((s) => s.id === parseInt(e.target.value)))}
            >
              {schools.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-slate-500 text-sm"
          >
            Loading reports...
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-4 md:gap-6 md:grid-cols-2"
          >
            {/* Attendance Summary */}
            <motion.div
              className="rounded-xl bg-white/90 backdrop-blur shadow-sm ring-1 ring-slate-100 p-4 md:p-5 hover:shadow-md transition"
              whileHover={{ y: -2 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base md:text-lg font-semibold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-600" />
                  Attendance Summary
                </h2>
                <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-600">
                  {selectedSchool?.name || "—"}
                </span>
              </div>
              <div className="h-[220px] md:h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[{ name: selectedSchool?.name || "School", attendance }]}> 
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="attendance" fill="#22c55e" radius={6} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Course Performance */}
            <motion.div
              className="rounded-xl bg-white/90 backdrop-blur shadow-sm ring-1 ring-slate-100 p-4 md:p-5 hover:shadow-md transition"
              whileHover={{ y: -2 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base md:text-lg font-semibold flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  Course Attendance Rates
                </h2>
                <span className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-600">
                  {courseStats?.length || 0} courses
                </span>
              </div>
              {courseStats.length === 0 ? (
                <div className="text-slate-500 text-sm">No course data available.</div>
              ) : (
                <div className="h-[220px] md:h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={courseStats}>
                      <XAxis dataKey="course" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="avg_attendance" fill="#6366f1" radius={6} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
