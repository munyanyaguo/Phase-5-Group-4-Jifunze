// src/pages/educator/Courses.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Users, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchEducatorCourses } from "../../services/courseService";

export default function Courses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrollmentCounts, setEnrollmentCounts] = useState({});
  const API_URL = "http://127.0.0.1:5000/api";

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        
        const res = await fetchEducatorCourses();
        const items = Array.isArray(res?.data) ? res.data : [];
        
        setCourses(items);

        // Fetch enrollment counts per course (using pagination meta.total)
        const token = localStorage.getItem("token");
        const countPromises = items.map(async (c) => {
          try {
            const r = await fetch(`${API_URL}/enrollments?course_id=${c.id}&page=1&per_page=1`, {
              headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            });
            const body = await r.json();
            const total = (r.ok && body.success && body?.data?.meta?.total) ? body.data.meta.total : 0;
            return [c.id, total];
          } catch {
            return [c.id, 0];
          }
        });
        // Resolve fastest first to start painting sooner
        const entries = await Promise.all(countPromises);
        setEnrollmentCounts(Object.fromEntries(entries));
      } catch (e) {
        console.error("Failed to load courses:", e);
        setError(e.message || "Failed to load courses");
      } finally {
        setLoading(false);
      }
    };
    
    load();
  }, []);

  if (loading) {
    return (
      <motion.div
        className="p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-600" />
          My Courses
        </h1>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading courses...</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <BookOpen className="w-6 h-6 text-blue-600" />
        My Courses
      </h1>

      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 text-red-700 border border-red-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Error loading courses</p>
            <p className="text-sm mt-1">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 text-sm underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {courses.length === 0 && !error ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No courses assigned yet</h3>
          <p className="text-gray-500">Courses assigned to you will appear here.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <motion.div
              key={course.id}
              className="p-5 rounded-2xl shadow-lg bg-white hover:shadow-xl transition cursor-pointer"
              whileHover={{ scale: 1.03 }}
              onClick={() => navigate(`/educator/courses/${course.id}`)}
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-1">
                {course.title}
              </h2>
              
              {course.description && (
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                  {course.description}
                </p>
              )}

              <div className="flex items-center justify-between">
                <p className="text-gray-600 flex items-center gap-1">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">
                    {enrollmentCounts[course.id] ?? 0} Students
                  </span>
                </p>

                <button
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/educator/courses/${course.id}`);
                  }}
                >
                  View Details
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}