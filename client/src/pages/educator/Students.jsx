import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchEducatorCourses } from "../../services/courseService";

const API_URL = "http://127.0.0.1:5000/api";

export default function Students() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadStudents = async () => {
      try {
        setLoading(true);
        setError("");

        // 1) Load educator courses
        const coursesResult = await fetchEducatorCourses();
        const courses = Array.isArray(coursesResult?.data) ? coursesResult.data : [];
        if (courses.length === 0) {
          setStudents([]);
          return;
        }

        // 2) Fetch enrollments per course and aggregate unique students
        const token = localStorage.getItem("token");
        const enrollmentPromises = courses.map(async (course) => {
          const res = await fetch(`${API_URL}/enrollments?course_id=${course.id}&per_page=1000`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          const body = await res.json();
          if (!res.ok || !body.success) {
            throw new Error(body.message || `Failed to load enrollments for course ${course.id}`);
          }
          const items = body?.data?.enrollments || body?.enrollments || [];
          return items
            .map((enrollment) => ({
              public_id: enrollment?.user?.public_id || enrollment?.user_public_id,
              name: enrollment?.user?.name || "Unnamed Student",
              email: enrollment?.user?.email || "",
              course_id: enrollment?.course_id,
            }))
            .filter((stu) => !!stu.public_id);
        });

        const perCourseStudents = await Promise.all(enrollmentPromises);
        const merged = perCourseStudents.flat();
        // Deduplicate by public_id
        const uniqueMap = new Map();
        for (const s of merged) {
          if (!uniqueMap.has(s.public_id)) uniqueMap.set(s.public_id, s);
        }
        setStudents(Array.from(uniqueMap.values()));
      } catch (e) {
        console.error("Error loading educator students:", e);
        setError(e.message || "Failed to load students");
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    const list = Array.isArray(students) ? students : [];
    const q = search.toLowerCase();
    return list.filter((s) =>
      (s.name || "").toLowerCase().includes(q) || (s.email || "").toLowerCase().includes(q)
    );
  }, [students, search]);

  return (
    <motion.div
      className="p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Page Header */}
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <User className="w-6 h-6 text-green-600" />
        My Students
      </h1>

      {/* Search Bar */}
      <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 mb-6 w-full md:w-1/2">
        <Search className="w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ml-2 bg-transparent outline-none w-full"
        />
      </div>

      {error && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200">{error}</div>
      )}

      {loading ? (
        <div className="text-gray-600">Loading students...</div>
      ) : (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <motion.div
            key={student.public_id}
            className="p-5 rounded-2xl shadow-lg bg-white hover:shadow-xl transition"
            whileHover={{ scale: 1.03 }}
          >
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              {student.name}
            </h2>
            <p className="text-gray-500 flex items-center gap-1 mt-2">
              <Mail className="w-4 h-4 text-gray-400" />
              {student.email}
            </p>

            <button
              onClick={() => navigate(`/educator/students/${student.public_id}`)}
              className="mt-4 px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition"
            >
              View Profile
            </button>
          </motion.div>
        ))}
      </div>
      )}

      {!loading && filteredStudents.length === 0 && (
        <p className="text-gray-500 text-center mt-10">No students found.</p>
      )}
    </motion.div>
  );
}
