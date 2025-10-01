// src/pages/educator/Courses.jsx
import React, { useEffect, useState, useMemo } from "react";
import { BookOpen, Users, AlertCircle, Calendar, Search, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchEducatorCourses } from "../../services/courseService";
import { CoursesSkeleton } from "../../components/common/SkeletonLoader";

export default function Courses() {
  const navigate = useNavigate();
  const [myCourses, setMyCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrollmentCounts, setEnrollmentCounts] = useState({});
  const [viewMode, setViewMode] = useState('my'); // 'my' or 'all'
  const [searchTerm, setSearchTerm] = useState('');
  const API_URL = "http://127.0.0.1:5000/api";

  useEffect(() => {
    const load = async () => {
      try {
        setError("");
        const token = localStorage.getItem("token");
        
        // Fetch educator's assigned courses
        const myRes = await fetchEducatorCourses();
        const myItems = Array.isArray(myRes?.data) ? myRes.data : [];
        setMyCourses(myItems);

        // Fetch all school courses
        try {
          const allRes = await fetch(`${API_URL}/courses?per_page=1000`, {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          });
          const allBody = await allRes.json();
          if (allRes.ok && allBody.success) {
            const allItems = allBody?.data?.courses || allBody?.data?.items || allBody?.courses || [];
            setAllCourses(Array.isArray(allItems) ? allItems : []);
          }
        } catch (err) {
          console.error("Failed to load all courses:", err);
        }

        // Fetch enrollment counts for all courses
        const allCoursesToCount = viewMode === 'my' ? myItems : allCourses;
        const countPromises = allCoursesToCount.map(async (c) => {
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
        const entries = await Promise.all(countPromises);
        setEnrollmentCounts(Object.fromEntries(entries));
      } catch (e) {
        console.error("Failed to load courses:", e);
        setError(e.message || "Failed to load courses");
      } finally {
        setInitialLoading(false);
      }
    };
    
    load();
  }, [viewMode]);

  // Memoize filtered and sorted courses to prevent unnecessary recalculations
  const filteredCourses = useMemo(() => {
    const courses = viewMode === 'my' ? myCourses : allCourses;
    return courses
      .filter(course =>
        course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => a.title?.localeCompare(b.title));
  }, [viewMode, myCourses, allCourses, searchTerm]);

  if (initialLoading) {
    return <CoursesSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            Courses
          </h1>
          <p className="text-gray-600">Browse and manage your courses</p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-slate-400">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">{myCourses.length}</div>
                <div className="text-sm text-gray-500">My Courses</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-indigo-400">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <BookOpen className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">{allCourses.length}</div>
                <div className="text-sm text-gray-500">All School Courses</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-emerald-400">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">{filteredCourses.length}</div>
                <div className="text-sm text-gray-500">Showing</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          {/* Radio Buttons */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-3">View:</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="viewMode"
                  value="my"
                  checked={viewMode === 'my'}
                  onChange={(e) => setViewMode(e.target.value)}
                  className="w-5 h-5 text-slate-600 focus:ring-2 focus:ring-slate-400"
                />
                <span className="text-gray-700 font-medium group-hover:text-slate-700 transition-colors">
                  My Courses ({myCourses.length})
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="viewMode"
                  value="all"
                  checked={viewMode === 'all'}
                  onChange={(e) => setViewMode(e.target.value)}
                  className="w-5 h-5 text-indigo-600 focus:ring-2 focus:ring-indigo-400"
                />
                <span className="text-gray-700 font-medium group-hover:text-indigo-700 transition-colors">
                  All School Courses ({allCourses.length})
                </span>
              </label>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-xl shadow-sm flex items-start gap-3">
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

        {filteredCourses.length === 0 && !error ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {searchTerm ? 'No courses found' : viewMode === 'my' ? 'No courses assigned yet' : 'No courses available'}
            </h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search' : 'Courses will appear here once available'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 cursor-pointer"
                onClick={() => navigate(`/educator/courses/${course.id}`)}
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-slate-600 to-slate-700 p-6 text-white">
                  <h2 className="text-xl font-bold mb-2">{course.title}</h2>
                  {course.description && (
                    <p className="text-sm text-slate-200 line-clamp-2">
                      {course.description}
                    </p>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <Users className="w-4 h-4 text-slate-600" />
                      </div>
                      <span className="text-sm font-medium">
                        {enrollmentCounts[course.id] ?? 0} Students
                      </span>
                    </div>
                    {course.created_at && (
                      <div className="flex items-center gap-2 text-gray-500 text-xs">
                        <Calendar className="w-3 h-3" />
                        {new Date(course.created_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  <button
                    className="w-full px-4 py-3 rounded-xl bg-slate-600 hover:bg-slate-700 text-white font-semibold hover:shadow-md transition-all duration-200"
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
      </div>
    </div>
  );
}