import React, { useEffect, useState } from "react";
import { API_URL } from "../../config";

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

  if (loading) return <div className="text-center mt-10">Loading enrollments...</div>;
  if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 border rounded-lg shadow-lg bg-white">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">My Enrollments</h2>

      {enrollments.length ? (
        <>
          <ul className="divide-y divide-gray-200">
            {enrollments.map((enrollment) => (
              <li key={enrollment.id} className="py-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-bold text-blue-600">{enrollment.course?.title}</span>
                    <span className="ml-2 text-gray-500">Enrollment ID: {enrollment.id}</span>
                  </div>
                  <span className="text-sm text-gray-600">Status: {enrollment.status || "active"}</span>
                </div>
                <div className="text-gray-700 mt-1">{enrollment.course?.description}</div>
                <div className="text-gray-500 text-sm mt-1">
                  Date Enrolled: {new Date(enrollment.created_at).toLocaleDateString()}
                </div>
              </li>
            ))}
          </ul>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span>Page {page} of {totalPages}</span>
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
        <p>No enrollments found.</p>
      )}
    </div>
  );
};

export default StudentEnrollments;
