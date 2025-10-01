// src/components/common/SkeletonLoader.jsx
import React from "react";

// Base skeleton component
const Skeleton = ({ className = "", variant = "rectangular" }) => {
  const baseClasses = "animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]";
  
  const variantClasses = {
    rectangular: "rounded-lg",
    circular: "rounded-full",
    text: "rounded h-4",
  };

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{ animation: 'shimmer 2s infinite linear' }}
    />
  );
};

// Dashboard skeleton
export const DashboardSkeleton = () => (
  <div className="p-6 space-y-6">
    {/* Header */}
    <div className="space-y-2">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-48" />
    </div>

    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-2xl shadow-lg p-6 space-y-3">
          <Skeleton className="h-12 w-12" variant="circular" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-4 w-32" />
        </div>
      ))}
    </div>

    {/* Content Area */}
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
      <Skeleton className="h-6 w-48" />
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  </div>
);

// Courses skeleton
export const CoursesSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 p-6">
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
            <Skeleton className="h-16 w-full" />
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>

      {/* Course Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <Skeleton className="h-32 w-full" />
            <div className="p-6 space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Students skeleton
export const StudentsSkeleton = () => (
  <div className="p-6 space-y-6">
    {/* Header */}
    <div className="space-y-2">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-64" />
    </div>

    {/* Search Bar */}
    <div className="bg-white rounded-xl shadow-lg p-4">
      <Skeleton className="h-12 w-full" />
    </div>

    {/* Student Cards */}
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white rounded-xl shadow-lg p-6 space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16" variant="circular" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  </div>
);

// Attendance skeleton
export const AttendanceSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Skeleton className="h-10 w-64" />

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <Skeleton className="h-10 w-10" variant="circular" />
              <Skeleton className="h-6 flex-1" />
              <Skeleton className="h-10 w-32" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Messages skeleton
export const MessagesSkeleton = () => (
  <div className="p-6 space-y-6">
    <Skeleton className="h-8 w-48" />
    
    <div className="grid md:grid-cols-3 gap-6">
      {/* Sidebar */}
      <div className="bg-white rounded-xl shadow-lg p-4 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>

      {/* Chat Area */}
      <div className="md:col-span-2 bg-white rounded-xl shadow-lg p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={i % 2 === 0 ? "flex justify-end" : ""}>
              <Skeleton className={`h-16 ${i % 2 === 0 ? 'w-3/4' : 'w-2/3'}`} />
            </div>
          ))}
        </div>
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  </div>
);

// Resources skeleton
export const ResourcesSkeleton = () => (
  <div className="p-6 space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-64" />
    </div>

    <div className="bg-white rounded-xl shadow-lg p-4">
      <Skeleton className="h-12 w-full" />
    </div>

    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white rounded-xl shadow-lg p-6 space-y-4">
          <Skeleton className="h-12 w-12" variant="circular" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  </div>
);

// Generic page skeleton
export const PageSkeleton = () => (
  <div className="p-6 space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-48" />
    </div>

    <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
      <Skeleton className="h-6 w-48" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  </div>
);

// Add shimmer animation to global styles
const style = document.createElement('style');
style.textContent = `
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
`;
document.head.appendChild(style);

export default Skeleton;
