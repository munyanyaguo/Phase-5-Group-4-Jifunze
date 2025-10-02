import React, { useEffect, useState } from "react";
import { API_URL } from "../../config";
import StudentCourseResources from "./StudentResources";

const statusColors = {
  present: "bg-green-100 text-green-700 border-green-300",
  absent: "bg-red-100 text-red-700 border-red-300",
  late: "bg-yellow-100 text-yellow-700 border-yellow-300",
  excused: "bg-blue-100 text-blue-700 border-blue-300",
};

const statusIcons = {
  present: "✓",
  absent: "✗",
  late: "⏰",
  excused: "📝",
};

const StudentAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAttendance = async (pageNumber = 1) => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user_id");
    if (!token || !userId) {
      setError("You must be logged in as a student to view attendance.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${API_URL}/api/attendance?user_id=${userId}&page=${pageNumber}&per_page=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load attendance records");
      }

      setAttendance(data.data.attendance || []);
      const meta = data.data.meta || {};
      setPage(meta.page || 1);
      setTotalPages(meta.pages || 1);
    } catch (err) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance(page);
  }, [page]);

  // Group attendance by course
  const attendanceByCourse = attendance.reduce((acc, record) => {
    const courseId = record.course_id;
    if (!acc[courseId]) acc[courseId] = { records: [], course: record.course || {} };
    acc[courseId].records.push(record);
    return acc;
  }, {});

  const filteredCourses = Object.values(attendanceByCourse).filter((courseGroup) => {
    const matchesStatus = statusFilter
      ? courseGroup.records.some((r) => r.status === statusFilter)
      : true;
    const matchesSearch = search
      ? courseGroup.course?.title?.toLowerCase().includes(search.toLowerCase())
      : true;
    return matchesStatus && matchesSearch;
  });

  const statuses = Array.from(new Set(attendance.map((r) => r.status))).filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📊 My Attendance</h1>
          <p className="text-gray-600">Track your attendance across all courses</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Course</label>
              <input
                type="text"
                placeholder="Search by course name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">All Statuses</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading attendance records...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-md">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
        ) : filteredCourses.length ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredCourses.map(({ course, records }) => {
                const totalSessions = records.length;
                const attended = records.filter((r) => r.status === "present").length;
                const attendanceRate = totalSessions > 0 ? Math.round((attended / totalSessions) * 100) : 0;
                
                return (
                  <div key={course.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
                    {/* Course Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                      <h3
                        className="text-2xl font-bold cursor-pointer hover:underline"
                        onClick={() => {
                          setSelectedCourseId(course.id);
                          setShowCourseModal(true);
                        }}
                      >
                        {course?.title || "Unknown Course"}
                      </h3>
                      <p className="text-blue-100 mt-1 text-sm">{course?.description || "No description"}</p>
                    </div>

                    {/* Attendance Stats */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Attendance Rate</p>
                          <p className="text-3xl font-bold text-gray-800">{attendanceRate}%</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Sessions</p>
                          <p className="text-2xl font-bold text-gray-800">{attended}/{totalSessions}</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${attendanceRate}%` }}
                        ></div>
                      </div>

                      {/* Session Badges */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {records.slice(0, 5).map((r) => (
                          <span
                            key={r.id}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${statusColors[r.status] || "bg-gray-100 text-gray-700 border-gray-300"}`}
                          >
                            {statusIcons[r.status]} {r.status} • {r.date}
                          </span>
                        ))}
                        {records.length > 5 && (
                          <span className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 text-gray-600">
                            +{records.length - 5} more
                          </span>
                        )}
                      </div>

                      {/* Latest Info */}
                      <div className="flex justify-between text-sm text-gray-600 pt-4 border-t">
                        <span>Latest: <strong className="text-gray-800">{records[0]?.status}</strong></span>
                        <span>Date: <strong className="text-gray-800">{records[0]?.date}</strong></span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page <= 1}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    page === 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-blue-600 hover:bg-blue-50 shadow-md'
                  }`}
                >
                  ← Previous
                </button>
                <span className="text-gray-700 font-medium bg-white px-6 py-3 rounded-lg shadow-md">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page >= totalPages}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    page === totalPages
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-blue-600 hover:bg-blue-50 shadow-md'
                  }`}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-xl text-gray-500 font-semibold">No attendance records found</p>
            <p className="text-gray-400 mt-2">Your attendance will appear here once you attend a class</p>
          </div>
        )}

        {/* Course Resources Modal */}
        {showCourseModal && selectedCourseId && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 rounded-t-2xl relative">
                <h3 className="text-3xl font-bold">Course Resources</h3>
                <button
                  className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center text-2xl transition-colors"
                  onClick={() => {
                    setShowCourseModal(false);
                    setSelectedCourseId(null);
                  }}
                >
                  &times;
                </button>
              </div>
              <div className="p-8">
                <StudentCourseResources courseId={selectedCourseId} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAttendance;
