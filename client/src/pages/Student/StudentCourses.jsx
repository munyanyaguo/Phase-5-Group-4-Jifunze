import React, { useEffect, useState } from "react";
import { FaSearch, FaBook } from "react-icons/fa";
import { API_URL } from "../../config";
import StudentResources from "./StudentResources";

const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page]);

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

  // Client-side filtered courses
  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6">
      <h2 className="text-3xl font-bold mb-6 text-blue-700">Browse Courses</h2>

      {/* Search bar */}
      <div className="flex items-center mb-6">
        <input
          type="text"
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-full mr-2"
        />
        <FaSearch className="text-gray-400 text-xl" />
      </div>

      {loading ? (
        <div className="text-gray-500">Loading courses...</div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-lg shadow-md p-4 flex flex-col"
            >
              <div className="flex items-center mb-3">
                <FaBook className="text-blue-500 text-2xl mr-2" />
                <h3 className="text-lg font-semibold text-gray-800">
                  {course.title}
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                {course.description?.slice(0, 80)}...
              </p>
              <p className="text-sm text-gray-500 mb-1">
                <strong>Educator:</strong> {course.educator?.name}
              </p>
              <p className="text-sm text-gray-500 mb-3">
                <strong>School:</strong> {course.school?.name}
              </p>
              <p className="text-xs text-gray-500 italic mt-auto">
                Ask your educator to enroll you in this course.
              </p>

              <button
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm mt-2"
                onClick={() => setSelectedCourse(course)}
              >
                Details
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-500">No courses found.</div>
      )}

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 mt-8">
        <button
          className="px-3 py-1 bg-gray-200 rounded"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Prev
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          className="px-3 py-1 bg-gray-200 rounded"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>

      {/* Course Details Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl w-full max-w-2xl relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setSelectedCourse(null)}
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-2 text-blue-700">
              {selectedCourse.title}
            </h3>
            <p className="mb-2">
              <strong>Educator:</strong> {selectedCourse.educator?.name}
            </p>
            <p className="mb-2">
              <strong>Description:</strong> {selectedCourse.description}
            </p>
            <p className="mb-2">
              <strong>School:</strong> {selectedCourse.school?.name}
            </p>
            <p className="mb-2">
              <strong>Created:</strong>{" "}
              {new Date(selectedCourse.created_at).toLocaleDateString()}
            </p>

            {/* Hybrid Resources */}
            <div className="mt-4">
              <h4 className="font-semibold mb-2 text-blue-600">Resources</h4>
              <StudentResources
                courseId={selectedCourse.id}
                embeddedResources={selectedCourse.resources}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentCourses;
