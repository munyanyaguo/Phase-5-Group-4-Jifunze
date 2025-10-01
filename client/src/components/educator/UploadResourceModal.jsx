// src/components/educator/UploadResourceModal.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Upload, Link, File, FileText, Video, Image as ImageIcon, FileCheck } from 'lucide-react';

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
        <div className="relative w-full max-w-2xl transform rounded-2xl bg-white shadow-2xl transition-all overflow-hidden">
          {/* Header with Gradient */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">
                    Upload New Resource
                  </h3>
                  <p className="text-sm text-blue-100">Share materials with your students</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="p-6">

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
              {/* Upload Type Toggle */}
              <div className="flex space-x-2 p-1 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                <button
                  type="button"
                  onClick={() => { setUploadType('file'); clearErrors('url'); }}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-all ${
                    uploadType === 'file'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:bg-white/50'
                  }`}
                >
                  <Upload size={18} />
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setUploadType('url')}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-all ${
                    uploadType === 'url'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:bg-white/50'
                  }`}
                >
                  <Link size={18} />
                  Add URL
                </button>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Title *
                </label>
                <input
                  type="text"
                  {...register('title', { required: 'Title is required' })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter resource title"
                />
                {errors.title && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <X className="w-4 h-4" />
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Course Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-purple-600" />
                  Course *
                </label>
                <select
                  {...register('course_id', { required: 'Course is required' })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none bg-white"
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
                {errors.course_id && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <X className="w-4 h-4" />
                    {errors.course_id.message}
                  </p>
                )}
              </div>

              {/* Resource Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <File className="w-4 h-4 text-green-600" />
                  Type *
                </label>
                <select
                  {...register('type', { required: 'Type is required' })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all appearance-none bg-white"
                >
                  <option value="">Select type</option>
                  {resourceTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.type && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <X className="w-4 h-4" />
                    {errors.type.message}
                  </p>
                )}
              </div>

              {/* File Upload or URL Input */}
              {uploadType === 'file' ? (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Upload className="w-4 h-4 text-blue-600" />
                    File *
                  </label>
                  <div
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                      dragActive 
                        ? 'border-blue-500 bg-blue-50 scale-105' 
                        : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
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
                          <div className="p-4 bg-green-100 rounded-full mb-3">
                            <File size={40} className="text-green-600" />
                          </div>
                          <p className="text-base font-semibold text-gray-900 mb-1">
                            {selectedFile.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <button
                            type="button"
                            onClick={() => setSelectedFile(null)}
                            className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium"
                          >
                            Remove file
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="p-4 bg-blue-100 rounded-full mb-4">
                            <Upload size={40} className="text-blue-600" />
                          </div>
                          <p className="text-base text-gray-700 mb-2">
                            <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-sm text-gray-500">
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Link className="w-4 h-4 text-blue-600" />
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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="https://example.com/resource"
                  />
                  {errors.url && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <X className="w-4 h-4" />
                      {errors.url.message}
                    </p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t-2 border-gray-100">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transform hover:scale-105"
                >
                  {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {loading ? 'Uploading...' : 'Upload Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}