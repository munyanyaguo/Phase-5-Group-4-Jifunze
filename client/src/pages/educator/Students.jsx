import React, { useEffect, useMemo, useState } from "react";
import { User, Mail, Search, Users, BookOpen, Calendar, ArrowRight, Filter } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { fetchEducatorCourses } from "../../services/courseService";
import { StudentsSkeleton } from "../../components/common/SkeletonLoader";
import { API_URL as CONFIG_URL } from '../../config';

const API_URL = `${CONFIG_URL}/api`;

export default function Students() {
  const navigate = useNavigate();
  const location = useLocation();
  const [students, setStudents] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  useEffect(() => {
    const loadStudents = async () => {
      try {
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
        setInitialLoading(false);
      }
    };

    loadStudents();
  }, [location.pathname]); // Re-fetch when navigating back to this page

  const filteredStudents = useMemo(() => {
    const list = Array.isArray(students) ? students : [];
    const q = search.toLowerCase();
    return list.filter((s) =>
      (s.name || "").toLowerCase().includes(q) || (s.email || "").toLowerCase().includes(q)
    );
  }, [students, search]);

  if (initialLoading) {
    return <StudentsSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Users className="w-8 h-8 text-white" />
            </div>
            My Students
          </h1>
          <p className="text-gray-600">View and manage all students across your courses</p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-blue-500">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">{students.length}</div>
                <div className="text-sm text-gray-500">Total Students</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-purple-500">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Search className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">{filteredStudents.length}</div>
                <div className="text-sm text-gray-500">Search Results</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-green-500">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">Active</div>
                <div className="text-sm text-gray-500">All Enrolled</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search students by name or email..."
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {!initialLoading && error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-xl shadow-sm">
            {error}
          </div>
        )}

        {filteredStudents.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No students found</p>
            <p className="text-sm text-gray-400 mt-2">
              {search ? "Try adjusting your search" : "Students will appear here once they enroll"}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student, index) => (
              <motion.div
                key={student.public_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-2xl backdrop-blur-sm">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{student.name}</h2>
                      <p className="text-blue-100 text-sm">Student</p>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-gray-600">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Mail className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-sm truncate">{student.email || 'No email'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <User className="w-4 h-4 text-purple-600" />
                      </div>
                      <span className="text-sm">ID: {student.public_id.slice(0, 8)}...</span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/educator/students/${student.public_id}`)}
                    className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 group"
                  >
                    View Profile
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
