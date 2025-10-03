// src/pages/educator/CourseDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Users, FileText, Calendar, User, Mail, CheckCircle, XCircle, Clock } from "lucide-react";
import { fetchCourse } from "../../services/courseService";
import { fetchCourseResources } from "../../services/resourceService";
import { API_URL as CONFIG_URL } from '../../config';

const API_URL = `${CONFIG_URL}/api`;

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrollments, setEnrollments] = useState([]);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [attendanceStats, setAttendanceStats] = useState(null);
  
  useEffect(() => {
    // Reset state when ID changes
    setLoading(true);
    setError("");
    setCourse(null);
    setResources([]);
    setEnrollments([]);
    setAttendanceStats(null);
  }, [id]);
  
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Fetch course details
        const c = await fetchCourse(id);
        setCourse(c || {});

        // Fetch course resources using YOUR existing resourceService
        try {
          const res = await fetchCourseResources(id, 1, 20);
          
          // Handle different response structures from YOUR API
          const list = res?.data?.resources || res?.data?.items || res?.resources || [];
          setResources(Array.isArray(list) ? list : []);
        } catch (resourceError) {
          console.error('Failed to fetch resources:', resourceError);
          // Fallback to resources from course data
          setResources(c?.resources || []);
        }

        // Fetch enrollments
        const token = localStorage.getItem("token");
        try {
          const enrollRes = await fetch(`${API_URL}/enrollments?course_id=${id}&per_page=1000`, {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          });
          const enrollBody = await enrollRes.json();
          if (enrollRes.ok && enrollBody.success) {
            const enrollList = enrollBody?.data?.enrollments || enrollBody?.data?.items || [];
            setEnrollments(enrollList);
          }
        } catch (err) {
          console.error("Failed to fetch enrollments:", err);
        }

        // Fetch attendance stats for this course
        try {
          const attRes = await fetch(`${API_URL}/attendance?course_id=${id}&per_page=1000`, {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          });
          const attBody = await attRes.json();
          if (attRes.ok && attBody.success) {
            const attList = attBody?.data?.items || attBody?.data?.attendance || [];
            const present = attList.filter(a => a.status === 'present').length;
            const absent = attList.filter(a => a.status === 'absent').length;
            const late = attList.filter(a => a.status === 'late').length;
            const total = attList.length;
            const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
            setAttendanceStats({ present, absent, late, total, percentage });
          }
        } catch (err) {
          console.error("Failed to fetch attendance:", err);
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
  const enrollmentCount = enrollments.length || course?.enrollments?.length || course?.enrollments_count || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6 font-medium transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Courses
        </button>

        {/* Header Card */}
        <motion.div
          className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="bg-gradient-to-r from-slate-600 to-slate-700 p-8 text-white">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <BookOpen className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {course?.title || course?.name || "Course"}
                </h1>
                {course?.description && (
                  <p className="text-slate-200">{course.description}</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Info Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Students Card - Clickable */}
          <motion.div 
            className="p-6 rounded-2xl shadow-lg bg-white border-l-4 border-emerald-400 cursor-pointer hover:shadow-xl transition-all"
            whileHover={{ scale: 1.02 }}
            onClick={() => setShowStudentsModal(true)}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <h2 className="font-semibold text-lg text-gray-800">Students</h2>
            </div>
            <p className="text-4xl font-bold text-gray-800 mb-2">{enrollmentCount}</p>
            <p className="text-sm text-gray-500">Click to view enrolled students</p>
          </motion.div>

          {/* School Card */}
          {course?.school && (
            <motion.div 
              className="p-6 rounded-2xl shadow-lg bg-white border-l-4 border-indigo-400"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <School className="w-6 h-6 text-indigo-600" />
                </div>
                <h2 className="font-semibold text-lg text-gray-800">School</h2>
              </div>
              <p className="text-lg font-semibold text-gray-800">{course.school.name}</p>
              <p className="text-sm text-gray-500 mt-1">Institution</p>
            </motion.div>
          )}

          {/* Attendance Card - Clickable */}
          <motion.div 
            className="p-6 rounded-2xl shadow-lg bg-white border-l-4 border-slate-400 cursor-pointer hover:shadow-xl transition-all"
            whileHover={{ scale: 1.02 }}
            onClick={() => {
              // Store the course ID in localStorage so the attendance page can pre-select it
              localStorage.setItem('attendance_preselect_course', id);
              navigate('/educator/attendance');
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <ClipboardList className="w-6 h-6 text-slate-600" />
              </div>
              <h2 className="font-semibold text-lg text-gray-800">Attendance</h2>
            </div>
            {attendanceStats ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-4xl font-bold text-gray-800">{attendanceStats.percentage}%</p>
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                    <span>{attendanceStats.present} Present</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="w-3 h-3 text-red-600" />
                    <span>{attendanceStats.absent} Absent</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">Click to view full history</p>
              </>
            ) : (
              <p className="text-sm text-gray-600 mt-2">
                Click to view and manage attendance
              </p>
            )}
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

        {/* Students Modal */}
        {showStudentsModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto backdrop-blur-sm">
            <div className="flex min-h-screen items-center justify-center p-4">
              {/* Overlay */}
              <div 
                className="fixed inset-0 bg-black/40 backdrop-blur-md transition-all"
                onClick={() => setShowStudentsModal(false)}
              />
              
              {/* Modal */}
              <div className="relative w-full max-w-2xl transform rounded-2xl bg-white shadow-2xl transition-all overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <Users className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">
                          Enrolled Students
                        </h3>
                        <p className="text-sm text-emerald-100">{enrollmentCount} students in this course</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowStudentsModal(false)}
                      className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                    >
                      <X size={24} />
                    </button>
                  </div>
                </div>

                <div className="p-6 max-h-[70vh] overflow-y-auto">
                  {enrollments.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No students enrolled yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {enrollments.map((enrollment, index) => (
                        <div
                          key={enrollment.id || index}
                          className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-emerald-200 transition-colors"
                        >
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                            {(enrollment.user?.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-800">
                              {enrollment.user?.name || 'Unknown Student'}
                            </div>
                            {enrollment.user?.email && (
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {enrollment.user.email}
                              </div>
                            )}
                          </div>
                          {enrollment.created_at && (
                            <div className="text-xs text-gray-400">
                              Joined {new Date(enrollment.created_at).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="border-t p-4 bg-gray-50 flex justify-end">
                  <button
                    onClick={() => setShowStudentsModal(false)}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}