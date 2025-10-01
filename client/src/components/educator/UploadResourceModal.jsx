// src/components/educator/UploadResourceModal.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Upload, Link, File } from 'lucide-react';

const resourceTypes = [
  { value: 'pdf', label: 'PDF Document' },
  { value: 'video', label: 'Video' },
  { value: 'image', label: 'Image' },
  { value: 'document', label: 'Document' },
  { value: 'presentation', label: 'Presentation' },
  { value: 'url', label: 'URL/Link' },
];

export default function UploadResourceModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  courses = [], 
  loading = false 
}) {
  const [uploadType, setUploadType] = useState('file'); // 'file' or 'url'
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    reset, 
    setValue,
    setError,
    clearErrors,
    watch 
  } = useForm();

  const watchedType = watch('type');

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle file drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      setSelectedFile(files[0]);
      setValue('file', files[0], { shouldValidate: true, shouldDirty: true, shouldTouch: true });
      clearErrors('file');
      
      // Auto-detect type based on file extension
      const fileName = files[0].name.toLowerCase();
      if (fileName.endsWith('.pdf')) setValue('type', 'pdf');
      else if (fileName.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/)) setValue('type', 'image');
      else if (fileName.match(/\.(mp4|avi|mov|wmv|flv|webm)$/)) setValue('type', 'video');
      else if (fileName.match(/\.(doc|docx|txt|rtf)$/)) setValue('type', 'document');
      else if (fileName.match(/\.(ppt|pptx)$/)) setValue('type', 'presentation');
    }
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setValue('file', file, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
      clearErrors('file');
    }
  };

  // Handle form submission
  const handleFormSubmit = (data) => {
    const formData = {
      title: data.title,
      type: data.type,
      course_id: parseInt(data.course_id),
    };

    if (uploadType === 'file') {
      if (!selectedFile) {
        setError('file', { type: 'manual', message: 'File is required' });
        return;
      }
      formData.file = selectedFile;
    } else if (uploadType === 'url' && data.url) {
      formData.url = data.url;
    }

    onSubmit(formData);
  };

  // Reset form when modal closes
  const handleClose = () => {
    reset();
    setSelectedFile(null);
    setUploadType('file');
    setDragActive(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={handleClose}
        />
        
        {/* Modal */}
        <div className="relative w-full max-w-2xl transform rounded-lg bg-white p-6 shadow-xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Upload New Resource
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Upload Type Toggle */}
            <div className="flex space-x-1 rounded-lg bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => { setUploadType('file'); clearErrors('url'); }}
                className={`flex-1 flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  uploadType === 'file'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Upload size={16} />
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setUploadType('url')}
                className={`flex-1 flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  uploadType === 'url'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Link size={16} />
                Add URL
              </button>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                {...register('title', { required: 'Title is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter resource title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Course Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course *
              </label>
              <select
                {...register('course_id', { required: 'Course is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a course</option>
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

            {/* Resource Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type *
              </label>
              <select
                {...register('type', { required: 'Type is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select type</option>
                {resourceTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>

            {/* File Upload or URL Input */}
            {uploadType === 'file' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File *
                </label>
                <div
                  className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragActive 
                      ? 'border-blue-400 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    {...register('file')}
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov,.webm"
                  />
                  
                  <div className="flex flex-col items-center">
                    {selectedFile ? (
                      <>
                        <File size={32} className="text-green-500 mb-2" />
                        <p className="text-sm font-medium text-gray-900">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload size={32} className="text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">
                          <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PDF, DOC, PPT, Images, Videos (max 50MB)
                        </p>
                      </>
                    )}
                  </div>
                </div>
                {errors.file && (
                  <p className="mt-1 text-sm text-red-600">{errors.file.message}</p>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL *
                </label>
                <input
                  type="url"
                  {...register('url', { 
                    required: uploadType === 'url' ? 'URL is required' : false,
                    pattern: {
                      value: /^https?:\/\/.+/,
                      message: 'Please enter a valid URL starting with http:// or https://'
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/resource"
                />
                {errors.url && (
                  <p className="mt-1 text-sm text-red-600">{errors.url.message}</p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {loading ? 'Uploading...' : 'Upload Resource'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}