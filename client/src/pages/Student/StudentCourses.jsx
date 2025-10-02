import React, { useEffect, useState } from "react";
import { FaSearch, FaBook } from "react-icons/fa";
import { API_URL } from "../../config";
import StudentResources from "./StudentResources";

const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    fetchCourses();
    fetchEnrollments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page]);

  const fetchEnrollments = async () => {
    try {
      const token = localStorage.getItem("token");
      const userPublicId = localStorage.getItem("user_id");
      
      const res = await fetch(
        `${API_URL}/api/enrollments?user_public_id=${userPublicId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();

      if (res.ok && data.success) {
        setEnrollments(data.data.enrollments || []);
      }
    } catch (err) {
      console.error("Failed to fetch enrollments:", err);
    }
  };

  const fetchCourses = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_URL}/api/courses?search=${search}&page=${page}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();

      if (res.ok && data.success) {
        const items = data.data.items.map((course) => ({
          ...course,
          resources: course.resources || [], // embed resources if available
        }));
        setCourses(items);
        setTotalPages(data.data.meta?.pages || 1);
      } else {
        setError(data.message || "Failed to load courses.");
      }
    } catch {
      setError("Network error");
    }

    setLoading(false);
  };
  
  // Check if student is enrolled in a course
  const isEnrolled = (courseId) => {
    return enrollments.some(enrollment => enrollment.course_id === courseId);
  };

  // Client-side filtered courses
  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📚 My Courses</h1>
          <p className="text-gray-600">Explore and manage your enrolled courses</p>
        </div>

        {/* Search bar */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-8">
          <div className="flex items-center">
            <FaSearch className="text-gray-400 text-xl mr-3" />
            <input
              type="text"
              placeholder="Search courses by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 outline-none text-gray-700 placeholder-gray-400"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading courses...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-md">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100"
              >
                {/* Course Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                  <div className="flex items-center mb-2">
                    <FaBook className="text-2xl mr-3" />
                    <h3 className="text-xl font-bold">
                      {course.title}
                    </h3>
                  </div>
                  {isEnrolled(course.id) && (
                    <span className="inline-block bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      ✓ Enrolled
                    </span>
                  )}
                </div>

                {/* Course Body */}
                <div className="p-6">
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {course.description || "No description available"}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-700">
                      <span className="font-semibold mr-2">👨‍🏫 Educator:</span>
                      <span>{course.educator?.name || "N/A"}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <span className="font-semibold mr-2">🏫 School:</span>
                      <span>{course.school?.name || "N/A"}</span>
                    </div>
                  </div>
                  
                  {!isEnrolled(course.id) && (
                    <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg mb-4">
                      💡 Contact your educator to enroll in this course
                    </p>
                  )}

                  <button
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium"
                    onClick={() => setSelectedCourse(course)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500">No courses found</p>
            <p className="text-gray-400 mt-2">Try adjusting your search</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                page === 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-blue-600 hover:bg-blue-50 shadow-md'
              }`}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              ← Previous
            </button>
            <span className="text-gray-700 font-medium bg-white px-6 py-3 rounded-lg shadow-md">
              Page {page} of {totalPages}
            </span>
            <button
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                page === totalPages
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-blue-600 hover:bg-blue-50 shadow-md'
              }`}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next →
            </button>
          </div>
        )}

        {/* Course Details Modal */}
        {selectedCourse && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 rounded-t-2xl">
                <h3 className="text-3xl font-bold mb-2">{selectedCourse.title}</h3>
                <div className="flex items-center gap-4 text-blue-100">
                  <span>👨‍🏫 {selectedCourse.educator?.name}</span>
                  <span>•</span>
                  <span>🏫 {selectedCourse.school?.name}</span>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-8">
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-gray-800 mb-2">About This Course</h4>
                  <p className="text-gray-600 leading-relaxed">{selectedCourse.description || "No description available"}</p>
                </div>

                {/* Resources */}
                <div className="border-t pt-6">
                  <StudentResources courseId={selectedCourse.id} />
                </div>

                <button
                  className="mt-6 w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  onClick={() => setSelectedCourse(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentCourses;
