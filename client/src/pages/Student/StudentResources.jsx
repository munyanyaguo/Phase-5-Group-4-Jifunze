import React, { useEffect, useState } from "react";
import { API_URL } from "../../config";
import { FaFileAlt, FaDownload, FaEye, FaSearch } from "react-icons/fa";

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
    return (
      <div className="text-center py-20">
        <FaFileAlt className="mx-auto text-6xl text-gray-300 mb-4" />
        <p className="text-xl text-gray-500">No resources available</p>
      </div>
    );
  }

  if (loading) return (
    <div className="flex justify-center items-center py-20">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading resources...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-md">
      <p className="font-semibold">Error</p>
      <p>{error}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        {!courseId && (
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">📁 My Resources</h1>
            <p className="text-gray-600">Access learning materials from all your courses</p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Resources</label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title or description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            <div className="w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">All Types</option>
                {resourceTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Resource Grid */}
        {filteredResources.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
                  <div className="flex items-center mb-2">
                    <FaFileAlt className="text-2xl mr-3" />
                    <h3 className="text-xl font-bold line-clamp-1">{r.title}</h3>
                  </div>
                  <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {r.type || "Document"}
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {r.description || "No description available"}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="text-xs text-gray-500">
                      <strong>Uploaded by:</strong> {r.uploader?.name || r.uploaded_by || "N/A"}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedResource(r)}
                      className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                    >
                      <FaEye /> View
                    </button>
                    {r.url && (
                      <a
                        href={r.url}
                        download
                        className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                      >
                        <FaDownload /> Download
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <FaFileAlt className="mx-auto text-6xl text-gray-300 mb-4" />
            <p className="text-xl text-gray-500">No resources found</p>
            <p className="text-gray-400 mt-2">Try adjusting your filters</p>
          </div>
        )}

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

        {/* Resource Modal */}
        {selectedResource && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-8 rounded-t-2xl relative">
                <h3 className="text-3xl font-bold mb-2">{selectedResource.title}</h3>
                <span className="inline-block bg-white/20 text-white text-sm font-semibold px-3 py-1 rounded-full">
                  {selectedResource.type}
                </span>
                <button
                  className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center text-2xl transition-colors"
                  onClick={() => setSelectedResource(null)}
                >
                  &times;
                </button>
              </div>

              <div className="p-8">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Description</h4>
                    <p className="text-gray-600">{selectedResource.description || "No description available"}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Uploaded By</h4>
                      <p className="text-gray-600">{selectedResource.uploader?.name || selectedResource.uploaded_by || "N/A"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Created At</h4>
                      <p className="text-gray-600">{new Date(selectedResource.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {selectedResource.url && (
                    <div className="flex gap-3 pt-4">
                      <a
                        href={selectedResource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium text-center flex items-center justify-center gap-2"
                      >
                        <FaEye /> View Resource
                      </a>
                      <a
                        href={selectedResource.url}
                        download
                        className="flex-1 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors font-medium text-center flex items-center justify-center gap-2"
                      >
                        <FaDownload /> Download
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentResources;
