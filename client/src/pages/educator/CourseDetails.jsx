// src/pages/educator/CourseDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  BookOpen, 
  Users, 
  FileText, 
  ClipboardList,
  School,
  Calendar
} from "lucide-react";
import { fetchCourse } from "../../services/courseService";
import { fetchCourseResources } from "../../services/resourceService";

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Fetch course details
        const c = await fetchCourse(id);
        console.log("Course data:", c);
        setCourse(c);

        // Fetch course resources using YOUR existing resourceService
        try {
          const res = await fetchCourseResources(id, 1, 20);
          console.log("Resources response:", res);
          
          // Handle different response structures from YOUR API
          const list = res?.data?.resources || res?.data?.items || res?.resources || [];
          setResources(Array.isArray(list) ? list : []);
        } catch (resError) {
          console.log("Resources fetch failed, using course.resources:", resError);
          // Fallback to resources from course data
          setResources(c?.resources || []);
        }
      } catch (e) {
        console.error("Failed to load course details:", e);
        setError(e.message || "Failed to load course details");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div className="p-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading course details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <div className="p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">
          <p className="font-semibold">Error loading course</p>
          <p className="text-sm mt-1">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 text-sm underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // Calculate enrollment count
  const enrollmentCount = course?.enrollments?.length || course?.enrollments_count || 0;

  return (
    <motion.div
      className="p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4 transition"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Courses
      </button>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <BookOpen className="w-8 h-8 text-blue-600" />
          {course?.title || course?.name || "Course"}
        </h1>
        {course?.description && (
          <p className="text-gray-600 mt-2">{course.description}</p>
        )}
      </div>

      {/* Info Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* Students Card */}
        <motion.div 
          className="p-5 rounded-2xl shadow-lg bg-gradient-to-br from-green-50 to-white"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="font-semibold text-lg">Students</h2>
          </div>
          <p className="text-3xl font-bold text-gray-800">{enrollmentCount}</p>
          <p className="text-sm text-gray-500 mt-1">Enrolled students</p>
        </motion.div>

        {/* School Card */}
        {course?.school && (
          <motion.div 
            className="p-5 rounded-2xl shadow-lg bg-gradient-to-br from-blue-50 to-white"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <School className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="font-semibold text-lg">School</h2>
            </div>
            <p className="text-lg font-semibold text-gray-800">{course.school.name}</p>
            <p className="text-sm text-gray-500 mt-1">Institution</p>
          </motion.div>
        )}

        {/* Attendance Card - Clickable */}
        <motion.div 
          className="p-5 rounded-2xl shadow-lg bg-gradient-to-br from-purple-50 to-white cursor-pointer"
          whileHover={{ scale: 1.02 }}
          onClick={() => navigate('/educator/attendance')}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ClipboardList className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="font-semibold text-lg">Attendance</h2>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Click to view and manage attendance records
          </p>
        </motion.div>
      </div>

      {/* Educator Info */}
      {course?.educator && (
        <motion.div 
          className="p-5 rounded-2xl shadow-lg bg-white mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-600" />
            Course Educator
          </h2>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-lg">
                {course.educator.name?.charAt(0).toUpperCase() || 'E'}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-800">{course.educator.name}</p>
              <p className="text-sm text-gray-500">{course.educator.email}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Resources Section */}
      <motion.div 
        className="p-5 rounded-2xl shadow-lg bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Course Resources
          </h2>
          <span className="text-sm text-gray-500">{resources.length} total</span>
        </div>
        
        {resources.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No resources added yet for this course</p>
            <p className="text-sm text-gray-400 mt-1">Resources will appear here once added</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {resources.map((resource) => (
              <motion.li 
                key={resource.id}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                whileHover={{ x: 4 }}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{resource.title}</p>
                    {resource.description && (
                      <p className="text-sm text-gray-500 mt-1">{resource.description}</p>
                    )}
                    {resource.type && (
                      <span className="inline-block mt-2 px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded">
                        {resource.type}
                      </span>
                    )}
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </motion.div>

      {/* Course Metadata */}
      {(course?.created_at || course?.updated_at) && (
        <motion.div 
          className="mt-6 p-4 rounded-lg bg-gray-50 text-sm text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-4">
            <Calendar className="w-4 h-4" />
            {course.created_at && (
              <span>Created: {new Date(course.created_at).toLocaleDateString()}</span>
            )}
            {course.updated_at && (
              <span>Last updated: {new Date(course.updated_at).toLocaleDateString()}</span>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}