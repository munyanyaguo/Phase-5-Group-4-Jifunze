// src/pages/educator/Resources.jsx
import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  File, 
  Video, 
  Image, 
  FileText,
  Download,
  Eye
} from 'lucide-react';
import { useForm } from 'react-hook-form';

import UploadResourceModal from '../../components/educator/UploadResourceModal';
import { fetchResources, createResource, updateResource, deleteResource } from '../../services/resourceService';
import { fetchEducatorCourses } from '../../services/courseService';

// Resource type icons
const getResourceIcon = (type) => {
  switch (type) {
    case 'video': return <Video size={16} className="text-blue-500" />;
    case 'image': return <Image size={16} className="text-green-500" />;
    case 'pdf': return <FileText size={16} className="text-red-500" />;
    case 'document': return <File size={16} className="text-purple-500" />;
    case 'presentation': return <File size={16} className="text-orange-500" />;
    case 'url': return <ExternalLink size={16} className="text-indigo-500" />;
    default: return <File size={16} className="text-gray-500" />;
  }
};

// Format date
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default function EducatorResources() {
  const [resources, setResources] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 10,
    total: 0,
    pages: 0
  });

  // Load initial data
  useEffect(() => {
    loadResources();
    loadCourses();
  }, [pagination.page]);

  useEffect(() => {
    // Reset to page 1 when filters change
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [selectedCourse, selectedType, searchTerm]);

  const loadResources = async () => {
    try {
      setLoading(true);
      const result = await fetchResources(pagination.page, pagination.per_page);
      const list = Array.isArray(result.data) ? result.data : [];
      setResources(list);
      setPagination(prev => ({
        ...prev,
        total: result.total || 0,
        pages: result.pages || 0
      }));
    } catch (error) {
      console.error('Error loading resources:', error);
      alert('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async () => {
    try {
      const result = await fetchEducatorCourses();
      setCourses(result.data || []);
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  // Handle resource upload
  const handleUpload = async (data) => {
    try {
      setUploadLoading(true);
      await createResource(data);
      setUploadModalOpen(false);
      loadResources();
      alert('Resource uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert(error.message || 'Failed to upload resource');
    } finally {
      setUploadLoading(false);
    }
  };

  // Handle resource delete
  const handleDelete = async (resourceId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      await deleteResource(resourceId);
      loadResources();
      alert('Resource deleted successfully!');
    } catch (error) {
      console.error('Delete error:', error);
      alert(error.message || 'Failed to delete resource');
    }
  };

  // Filter resources based on search and filters
  const filteredResources = (Array.isArray(resources) ? resources : []).filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = !selectedCourse || resource.course_id.toString() === selectedCourse;
    const matchesType = !selectedType || resource.type === selectedType;
    
    return matchesSearch && matchesCourse && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Resources</h2>
          <p className="text-gray-600">
            Manage and organize your course resources
          </p>
        </div>
        <button
          onClick={() => setUploadModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Upload size={16} />
          Upload Resource
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Course Filter */}
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Courses</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="pdf">PDF</option>
            <option value="video">Video</option>
            <option value="image">Image</option>
            <option value="document">Document</option>
            <option value="presentation">Presentation</option>
            <option value="url">URL/Link</option>
          </select>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            {filteredResources.length} of {resources.length} resources
          </span>
          <div className="flex items-center gap-4">
            <span>Page {pagination.page} of {pagination.pages}</span>
          </div>
        </div>
      </div>

      {/* Resources List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading resources...</p>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="p-8 text-center">
            <Upload size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedCourse || selectedType 
                ? "Try adjusting your search or filters" 
                : "Get started by uploading your first resource"
              }
            </p>
            {!searchTerm && !selectedCourse && !selectedType && (
              <button
                onClick={() => setUploadModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Upload Resource
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredResources.map((resource) => (
              <div key={resource.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    {/* Resource Icon */}
                    <div className="flex-shrink-0">
                      {getResourceIcon(resource.type)}
                    </div>

                    {/* Resource Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {resource.title}
                        </h3>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {resource.type.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="mt-1 flex items-center gap-4 text-xs text-gray-500">
                        <span>Course: {resource.course?.title || 'Unknown'}</span>
                        <span>•</span>
                        <span>Added: {formatDate(resource.created_at)}</span>
                        {resource.uploader && (
                          <>
                            <span>•</span>
                            <span>By: {resource.uploader.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    {/* View/Download */}
                    <button
                      onClick={() => window.open(resource.url, '_blank')}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title={resource.type === 'url' ? 'Open link' : 'View resource'}
                    >
                      {resource.type === 'url' ? <ExternalLink size={16} /> : <Eye size={16} />}
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => setEditingResource(resource)}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Edit resource"
                    >
                      <Edit3 size={16} />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(resource.id, resource.title)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete resource"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page <= 1}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                let pageNum;
                if (pagination.pages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.pages - 2) {
                  pageNum = pagination.pages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                    className={`px-3 py-2 text-sm border rounded-md ${
                      pagination.page === pageNum
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page >= pagination.pages}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>

          <div className="text-sm text-gray-600">
            Showing {((pagination.page - 1) * pagination.per_page) + 1} to {Math.min(pagination.page * pagination.per_page, pagination.total)} of {pagination.total} resources
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <UploadResourceModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSubmit={handleUpload}
        courses={courses}
        loading={uploadLoading}
      />

      {/* Edit Modal */}
      {editingResource && (
        <EditResourceModal
          resource={editingResource}
          courses={courses}
          onClose={() => setEditingResource(null)}
          onSubmit={async (data) => {
            try {
              await updateResource(editingResource.id, data);
              setEditingResource(null);
              loadResources();
              alert('Resource updated successfully!');
            } catch (error) {
              alert(error.message || 'Failed to update resource');
            }
          }}
        />
      )}
    </div>
  );
}

// Simple Edit Modal Component
function EditResourceModal({ resource, courses, onClose, onSubmit }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      title: resource.title,
      type: resource.type,
      course_id: resource.course_id,
      url: resource.url
    }
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        
        <div className="relative w-full max-w-lg transform rounded-lg bg-white p-6 shadow-xl">
          <h3 className="text-lg font-semibold mb-4">Edit Resource</h3>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                {...register('title', { required: 'Title is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course *
              </label>
              <select
                {...register('course_id', { required: 'Course is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
              {errors.course_id && (
                <p className="mt-1 text-sm text-red-600">{errors.course_id.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type *
              </label>
              <select
                {...register('type', { required: 'Type is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pdf">PDF Document</option>
                <option value="video">Video</option>
                <option value="image">Image</option>
                <option value="document">Document</option>
                <option value="presentation">Presentation</option>
                <option value="url">URL/Link</option>
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>

            {resource.type === 'url' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL
                </label>
                <input
                  type="url"
                  {...register('url')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Update Resource
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}