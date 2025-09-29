import React, { useEffect, useState } from "react";
import { API_URL } from "../../config";

const StudentResources = ({ courseId, embeddedResources = [] }) => {
  const [resources, setResources] = useState(embeddedResources || []);
  const [loading, setLoading] = useState(!embeddedResources?.length);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [selectedResource, setSelectedResource] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchResources = async (pageNumber = 1) => {
    if (embeddedResources?.length && courseId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in as a student to view resources.");
      setLoading(false);
      return;
    }

    try {
      const endpoint = courseId
        ? `${API_URL}/api/courses/${courseId}/resources?page=${pageNumber}&per_page=10`
        : `${API_URL}/api/student/resources?page=${pageNumber}&per_page=10`;

      const res = await fetch(endpoint, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load resources");
      }

      // Safely extract resources and pagination
      let paginatedData = [];
      let meta = { page: 1, pages: 1 };

      if (data.data.resources) {
        // Standard format from paginate
        paginatedData = data.data.resources;
        meta = data.data.meta || meta;
      } else if (data.data?.[0]?.data?.resources) {
        // Nested format (older version or course-specific)
        paginatedData = data.data[0].data.resources;
        meta = data.data[0].data.meta || meta;
      }

      setResources(paginatedData);
      setPage(meta.page || 1);
      setTotalPages(meta.pages || 1);
    } catch (err) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, page]);

  // Filters
  const filteredResources = resources.filter((r) => {
    const matchesType = typeFilter ? r.type === typeFilter : true;
    const matchesSearch = search
      ? r.title.toLowerCase().includes(search.toLowerCase()) ||
        (r.description && r.description.toLowerCase().includes(search.toLowerCase()))
      : true;
    return matchesType && matchesSearch;
  });

  const resourceTypes = Array.from(new Set(resources.map((r) => r.type))).filter(Boolean);

  if (!loading && !resources.length && embeddedResources.length === 0) {
    return <div className="text-center mt-4">No resources available.</div>;
  }

  if (loading) return <div className="text-center mt-4">Loading resources...</div>;
  if (error) return <div className="text-red-500 text-center mt-4">{error}</div>;

  return (
    <div className="mt-4">
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
          {filteredResources.map((r) => (
            <li key={r.id} className="mb-2">
              <span
                className="font-bold cursor-pointer text-blue-700 hover:underline"
                onClick={() => setSelectedResource(r)}
              >
                {r.title}
              </span>
              <span className="ml-2 text-gray-500">({r.type})</span>
              {r.url && (
                <>
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-500 underline">View</a>
                  <a href={r.url} download className="ml-2 text-green-600 underline">Download</a>
                </>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No resources found.</p>
      )}

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

      {/* Resource Modal */}
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
            <p className="mb-2"><strong>Uploaded By:</strong> {selectedResource.uploader?.name || selectedResource.uploaded_by}</p>
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
