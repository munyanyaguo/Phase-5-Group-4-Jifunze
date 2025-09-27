import React, { useEffect, useState } from "react";
import { API_URL } from "../../config";

const StudentEnrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user_id"); // Store user_id on login
    if (!token || !userId) {
      setError("You must be logged in as a student to view enrollments.");
      setLoading(false);
      return;
    }
    fetch(`${API_URL}/api/enrollments?user_id=${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch enrollments");
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setEnrollments((data.data.user && data.data.user.enrollments) || []);
        } else {
          setError(data.message || "Failed to load enrollments");
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Network error");
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center mt-10">Loading enrollments...</div>;
  if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 border rounded-lg shadow-lg bg-white">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">My Enrollments</h2>
      {enrollments.length ? (
        <ul className="divide-y divide-gray-200">
          {enrollments.map((enrollment) => (
            <li key={enrollment.id} className="py-4">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold text-blue-600">Course ID: {enrollment.course_id}</span>
                  <span className="ml-2 text-gray-500">Enrollment ID: {enrollment.id}</span>
                </div>
                <span className="text-sm text-gray-600">Status: {enrollment.status || "active"}</span>
              </div>
              <div className="text-gray-700 mt-1">Date Enrolled: {enrollment.date_enrolled}</div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No enrollments found.</p>
      )}
    </div>
  );
};

export default StudentEnrollments;
