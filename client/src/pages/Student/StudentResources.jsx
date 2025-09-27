import React, { useEffect, useState } from "react";
import { API_URL } from "../../config";

const StudentResources = ({ courseId }) => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [selectedResource, setSelectedResource] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchResources = async (pageNumber = 1) => {
    if (!courseId) return;
    setLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in as a student to view resources.");
      setLoading(false);
      return;
    }

    try {
      const sanitizedCourseId = String(courseId).trim();
      const res = await fetch(
        `${API_URL}/api/courses/${sanitizedCourseId}/resources?page=${pageNumber}&per_page=10`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch resources");

      const data = await res.json();
      if (data.success) {
        // Backend pagination structure: { success, message, data: { resources, pagination } }
        setResources(data.data.resources || []);
        setPage(data.data.pagination.page || 1);
        setTotalPages(data.data.pagination.total_pages || 1);
      } else {
        setError(data.message || "Failed to load resources");
      }
    } catch (err) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources(page);
  }, [courseId, page]);

  if (!courseId) return null;
  if (loading) return <div className="text-center mt-4">Loading resources...</div>;
  if (error) return <div className="text-red-500 text-center mt-4">{error}</div>;

  // Filter and search logic (client-side)
  const filteredResources = resources.filter((resource) => {
    const matchesType = typeFilter ? resource.type === typeFilter : true;
    const matchesSearch = search
      ? resource.title.toLowerCase().includes(search.toLowerCase()) ||
        (resource.description && resource.description.toLowerCase().includes(search.toLowerCase()))
      : true;
    return matchesType && matchesSearch;
  });

  const resourceTypes = Array.from(new Set(resources.map((r) => r.type))).filter(Boolean);

  return (
    <div className="mt-6">
      <h4 className="font-semibold mb-2 text-blue-600">Course Resources</h4>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="text"
          placeholder="Search resources..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-48"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border p-2 rounded w-40"
        >
          <option value="">All Types</option>
          {resourceTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Resource List */}
      {filteredResources.length ? (
        <ul className="list-disc ml-6">
          {filteredResources.map((resource) => (
            <li key={resource.id} className="mb-2">
              <span
                className="font-bold cursor-pointer text-blue-700 hover:underline"
                onClick={() => setSelectedResource(resource)}
              >
                {resource.title}
              </span>
              <span className="ml-2 text-gray-500">({resource.type})</span>
              {resource.url && (
                <>
                  <a href={resource.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-500 underline">View</a>
                  <a href={resource.url} download className="ml-2 text-green-600 underline">Download</a>
                </>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No resources found for this course.</p>
      )}

      {/* Pagination */}
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

      {/* Resource Details Modal */}
      {selectedResource && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setSelectedResource(null)}
            >
              &times;
            </button>
            <h4 className="text-xl font-bold mb-2 text-blue-700">{selectedResource.title}</h4>
            <p className="mb-2"><strong>Type:</strong> {selectedResource.type}</p>
            <p className="mb-2"><strong>Description:</strong> {selectedResource.description || "No description"}</p>
            <p className="mb-2"><strong>Uploaded By:</strong> {selectedResource.uploaded_by}</p>
            <p className="mb-2"><strong>Created At:</strong> {selectedResource.created_at}</p>
            <p className="mb-2"><strong>Updated At:</strong> {selectedResource.updated_at}</p>
            {selectedResource.url && (
              <div className="mt-2">
                <a href={selectedResource.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline mr-4">View Resource</a>
                <a href={selectedResource.url} download className="text-green-600 underline">Download</a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentResources;
