import React, { useEffect, useState } from "react";
import { API_URL } from "../../config";
import { FaBook, FaCalendar, FaCheckCircle } from "react-icons/fa";

const StudentEnrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchEnrollments = async (pageNumber = 1) => {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user_id");

    if (!token || !userId) {
      setError("You must be logged in as a student to view enrollments.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `${API_URL}/api/enrollments?user_public_id=${userId}&page=${pageNumber}&per_page=5`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load enrollments");
      }

      const enrollmentsData = data.data?.enrollments || [];
      setEnrollments(enrollmentsData);

      // Pagination meta
      const meta = data.data?.meta || {};
      setPage(meta.page || 1);
      setTotalPages(meta.pages || 1);
    } catch (err) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex justify-center items-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading enrollments...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex justify-center items-center">
      <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-md max-w-md">
        <p className="font-semibold">Error</p>
        <p>{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📚 My Enrollments</h1>
          <p className="text-gray-600">View all your enrolled courses</p>
        </div>

        {enrollments.length ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map((enrollment) => (
                <div 
                  key={enrollment.id} 
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                    <div className="flex items-center mb-2">
                      <FaBook className="text-2xl mr-3" />
                      <h3 className="text-xl font-bold">
                        {enrollment.course?.title || "Course"}
                      </h3>
                    </div>
                    <span className="inline-block bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      <FaCheckCircle className="inline mr-1" />
                      Active
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {enrollment.course?.description || "No description available"}
                    </p>

                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-700">
                        <FaCalendar className="mr-2 text-blue-600" />
                        <span className="font-semibold mr-2">Enrolled:</span>
                        <span>{new Date(enrollment.date_enrolled || enrollment.created_at).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-700">
                        <span className="font-semibold mr-2">ID:</span>
                        <span className="text-gray-500">#{enrollment.id}</span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Educator</span>
                        <span className="text-sm font-medium text-gray-800">
                          {enrollment.course?.educator?.name || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
            <div className="text-6xl mb-4">📚</div>
            <p className="text-xl text-gray-500 font-semibold">No enrollments found</p>
            <p className="text-gray-400 mt-2">You haven't enrolled in any courses yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentEnrollments;
