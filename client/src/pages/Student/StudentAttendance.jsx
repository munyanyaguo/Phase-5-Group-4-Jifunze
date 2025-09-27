
import React, { useEffect, useState } from "react";
import { API_URL } from "../../config";
import StudentCourseResources from "./StudentResources";

const StudentAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [showCourseModal, setShowCourseModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user_id"); // Store user_id on login
    if (!token || !userId) {
      setError("You must be logged in as a student to view attendance.");
      setLoading(false);
      return;
    }
    fetch(`${API_URL}/api/attendance?user_id=${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch attendance records");
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setAttendance(data.data.attendance || []);
        } else {
          setError(data.message || "Failed to load attendance records");
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Network error");
        setLoading(false);
      });
  }, []);

  // Filter and search logic
  const filteredAttendance = attendance.filter((record) => {
    const matchesStatus = statusFilter ? record.status === statusFilter : true;
    const matchesSearch = search
      ? record.course_id?.toString().includes(search) ||
        (record.date && record.date.includes(search))
      : true;
    return matchesStatus && matchesSearch;
  });

  // Unique statuses for filter dropdown
  const statuses = Array.from(new Set(attendance.map((r) => r.status))).filter(Boolean);

  const handleCourseClick = (courseId) => {
    setSelectedCourseId(courseId);
    setShowCourseModal(true);
  };

  const closeCourseModal = () => {
    setShowCourseModal(false);
    setSelectedCourseId(null);
  };

  if (loading) return <div className="text-center mt-10">Loading attendance records...</div>;
  if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 border rounded-lg shadow-lg bg-white">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">My Attendance</h2>
      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by course or date..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-48"
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
      {filteredAttendance.length ? (
        <ul className="divide-y divide-gray-200">
          {filteredAttendance.map((record) => (
            <li key={record.id} className="py-4">
              <div className="flex justify-between items-center">
                <div>
                  <span
                    className="font-bold text-blue-600 cursor-pointer hover:underline"
                    onClick={() => handleCourseClick(record.course_id)}
                  >
                    Course ID: {record.course_id}
                  </span>
                  <span className="ml-2 text-gray-500">Attendance ID: {record.id}</span>
                </div>
                <span className="text-sm text-gray-600">Status: {record.status}</span>
              </div>
              <div className="text-gray-700 mt-1">Date: {record.date}</div>
              {record.verified_by && (
                <div className="text-gray-500 text-sm">Verified By: {record.verified_by}</div>
              )}
            </li>
          ))}
        </ul>
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
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={closeCourseModal}
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-4 text-blue-700">Course Resources for Course ID: {selectedCourseId}</h3>
            <StudentCourseResources courseId={selectedCourseId} />
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAttendance;
