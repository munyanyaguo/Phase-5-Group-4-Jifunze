import React, { useEffect, useState } from "react";
import { API_URL } from "../../config";
import StudentCourseResources from "./StudentResources";

const statusColors = {
  present: "bg-green-200 text-green-800",
  absent: "bg-red-200 text-red-800",
  late: "bg-yellow-200 text-yellow-800",
  excused: "bg-blue-200 text-blue-800",
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

  // Fetch attendance from backend
  const fetchAttendance = async (pageNumber = 1) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in to view attendance.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Prefer public_id, fallback to internal id
      const res = await fetch(
        `${API_URL}/api/attendance?page=${pageNumber}&per_page=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load attendance records");
      }

      const attendanceData = data.data?.attendance ||[];
      const meta = data.data?.meta || {};
      setAttendance(attendanceData);
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
    const course = record.course || {};
    const courseId = course.id || `no-course-${record.id}`;
    if (!acc[courseId]) acc[courseId] = { records: [], course };
    acc[courseId].records.push(record);
    return acc;
  }, {});

  // Filter by search & status
  const filteredCourses = Object.values(attendanceByCourse).filter(({ records, course }) => {
    const matchesStatus = statusFilter ? records.some((r) => r.status === statusFilter) : true;
    const matchesSearch = search ? course?.title?.toLowerCase().includes(search.toLowerCase()) : true;
    return matchesStatus && matchesSearch;
  });

  const statuses = Array.from(new Set(attendance.map((r) => r.status))).filter(Boolean);

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 border rounded-lg shadow-lg bg-white">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">My Attendance</h2>

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by course..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-56"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border p-2 rounded w-40"
        >
          <option value="">All Statuses</option>
          {statuses.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center mt-10">Loading attendance records...</div>
      ) : error ? (
        <div className="text-red-500 text-center mt-10">{error}</div>
      ) : filteredCourses.length ? (
        <>
          <ul className="space-y-4">
            {filteredCourses.map(({ course, records }) => {
              const totalSessions = records.length;
              const attended = records.filter((r) => r.status === "present").length;
              const latestRecord = records[0];

              return (
                <li key={course.id || latestRecord.id} className="p-4 border rounded-lg shadow-sm hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3
                        className="font-bold text-blue-600 cursor-pointer hover:underline text-lg"
                        onClick={() => {
                          if (course.id) {
                            setSelectedCourseId(course.id);
                            setShowCourseModal(true);
                          }
                        }}
                      >
                        {course?.title || "No course info"}
                      </h3>
                      <p className="text-gray-700 mt-1">{course?.description || ""}</p>
                      <p className="text-gray-500 text-sm mt-1">
                        Attendance Summary: {attended}/{totalSessions} sessions attended
                      </p>

                      <div className="flex flex-wrap gap-2 mt-2">
                        {records.map((r) => (
                          <span
                            key={r.id}
                            className={`px-2 py-1 text-xs font-semibold rounded ${statusColors[r.status] || "bg-gray-200 text-gray-800"}`}
                          >
                            {r.status} ({r.date})
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-gray-500 text-sm mt-1">
                        Latest Status: {latestRecord?.status || "N/A"}
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        Last Attendance: {latestRecord?.date || "N/A"}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-gray-700">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-yellow-600 text-center mt-6 font-semibold">
          No attendance records found.<br />
          Your attendance will appear here once you attend a class.
        </div>
      )}

      {/* Course Resources Modal */}
      {showCourseModal && selectedCourseId && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={() => {
                setShowCourseModal(false);
                setSelectedCourseId(null);
              }}
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-4 text-blue-700">Course Resources</h3>
            <StudentCourseResources courseId={selectedCourseId} />
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAttendance;
