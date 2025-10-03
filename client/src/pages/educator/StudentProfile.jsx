import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, ArrowLeft, BarChart3, Calendar, BookOpen, CheckCircle, XCircle, Clock, TrendingUp, Award, ArrowRight } from "lucide-react";
import { API_URL as CONFIG_URL } from '../../config';

const API_URL = `${CONFIG_URL}/api`;

export default function StudentProfile() {
  const { id } = useParams(); // student's public_id
  const navigate = useNavigate();
  const location = useLocation();

  const [student, setStudent] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAllAttendance, setShowAllAttendance] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Not authenticated. Please log in.");
          return;
        }

        // 1) Fetch enrollments for this student (provides nested user and course info)
        const enrRes = await fetch(`${API_URL}/enrollments?user_public_id=${encodeURIComponent(id)}&per_page=1000`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const enrBody = await enrRes.json();
        if (!enrRes.ok || !enrBody.success) {
          throw new Error(enrBody.message || "Failed to load enrollments");
        }
        const enrItems = enrBody?.data?.enrollments || [];
        setEnrollments(enrItems);
        const userFromEnroll = enrItems[0]?.user;

        // 2) Fetch attendance for this student
        const attRes = await fetch(`${API_URL}/attendance?user_id=${encodeURIComponent(id)}&per_page=1000`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const attBody = await attRes.json();
        
        if (attRes.ok && attBody.success) {
          // Try different response structures
          const attendanceRecords = attBody?.data?.items || attBody?.data?.attendance || attBody?.items || attBody?.attendance || [];
          setAttendance(attendanceRecords);
        } else {
          console.warn('⚠️ Failed to fetch attendance:', attBody.message);
          setAttendance([]);
        }

        // 3) Build student summary
        if (userFromEnroll) {
          setStudent({
            public_id: userFromEnroll.public_id,
            name: userFromEnroll.name,
            email: userFromEnroll.email,
          });
        } else {
          setStudent({ public_id: id, name: "Student", email: "" });
        }
      } catch (e) {
        console.error("Failed to load student profile:", e);
        setError(e.message || "Failed to load student profile");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, location.pathname]); // Re-fetch when navigating back to this page

  const attendanceStats = useMemo(() => {
    const stats = { present: 0, absent: 0, late: 0, total: 0 };
    for (const rec of attendance) {
      if (rec?.status === "present") stats.present += 1;
      else if (rec?.status === "absent") stats.absent += 1;
      else if (rec?.status === "late") stats.late += 1;
      stats.total += 1;
    }
    stats.percentage = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;
    return stats;
  }, [attendance]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading student profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-2xl mx-auto mt-12 bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-xl">
          {error}
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-2xl mx-auto mt-12 bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-xl">
          Student not found
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Students
        </button>

        {/* Student Header Card */}
        <motion.div
          className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-4xl backdrop-blur-sm">
                {student.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{student.name}</h1>
                <div className="flex items-center gap-2 text-blue-100">
                  <Mail className="w-4 h-4" />
                  {student.email}
                </div>
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-green-500 rounded-full text-sm font-medium">
                  <CheckCircle className="w-4 h-4" />
                  Active Student
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-green-500"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-sm text-gray-600">Present</div>
            </div>
            <div className="text-3xl font-bold text-gray-800">{attendanceStats.present}</div>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-red-500"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-sm text-gray-600">Absent</div>
            </div>
            <div className="text-3xl font-bold text-gray-800">{attendanceStats.absent}</div>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-yellow-500"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="text-sm text-gray-600">Late</div>
            </div>
            <div className="text-3xl font-bold text-gray-800">{attendanceStats.late}</div>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-500"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-sm text-gray-600">Attendance Rate</div>
            </div>
            <div className="text-3xl font-bold text-gray-800">{attendanceStats.percentage}%</div>
          </motion.div>
        </div>

        {/* Attendance Details */}
        <motion.div
          className="bg-white rounded-2xl shadow-lg p-8 mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            Attendance History
          </h2>
          
          {attendance.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No attendance records found</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(showAllAttendance ? attendance : attendance.slice(0, 12)).map((record, index) => (
                  <div
                    key={record.id || index}
                    className={`p-4 rounded-xl border-2 ${
                      record.status === 'present'
                        ? 'bg-green-50 border-green-200'
                        : record.status === 'late'
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {new Date(record.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                      {record.status === 'present' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : record.status === 'late' ? (
                        <Clock className="w-5 h-5 text-yellow-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div className="text-xs text-gray-600">{record.course?.title || 'Course'}</div>
                    <div className={`text-sm font-semibold capitalize mt-1 ${
                      record.status === 'present' ? 'text-green-700' :
                      record.status === 'late' ? 'text-yellow-700' : 'text-red-700'
                    }`}>
                      {record.status}
                    </div>
                  </div>
                ))}
              </div>
              {attendance.length > 12 && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setShowAllAttendance(!showAllAttendance)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 inline-flex items-center gap-2"
                  >
                    {showAllAttendance ? (
                      <>
                        Show Less
                        <ArrowLeft className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Show All {attendance.length} Records
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  {!showAllAttendance && (
                    <p className="text-sm text-gray-500 mt-2">
                      Showing 12 of {attendance.length} records
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* Enrollments */}
        <motion.div
          className="bg-white rounded-2xl shadow-lg p-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            Enrolled Courses ({enrollments.length})
          </h2>
          
          {enrollments.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No course enrollments found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enrollments.map((enr) => (
                <div
                  key={enr.id}
                  className="p-5 rounded-xl border-2 border-gray-100 hover:border-purple-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                      <BookOpen className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 mb-1">
                        {enr?.course?.title || `Course ${enr.course_id}`}
                      </h3>
                      {enr?.course?.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {enr.course.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        Enrolled: {new Date(enr?.created_at || enr?.date_enrolled || Date.now()).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
