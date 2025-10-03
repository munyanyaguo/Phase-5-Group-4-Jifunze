/* eslint-disable react-refresh/only-export-components */
// src/pages/educator/Attendance.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Calendar, Users, CheckCircle, XCircle, Save, History, Eye, Filter, UserCheck, BookOpen, TrendingUp } from "lucide-react";
import { AttendanceSkeleton } from "../../components/common/SkeletonLoader";
import { API_URL as CONFIG_URL } from '../../config';

const BASE_URL = `${CONFIG_URL}/api`;

// Helper for authenticated requests
export async function authFetch(url, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  return fetch(url, { ...options, headers });
}

// Decode JWT payload safely to extract claims (e.g., school_id)
function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    // Base64URL decode with padding
    let base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4;
    if (pad) base64 += "=".repeat(4 - pad);
    const json = atob(base64);
    return JSON.parse(json);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

async function fetchUserSchoolId(token) {
  const claims = decodeJwt(token);
  if (claims?.school_id) return claims.school_id;
  // Fallback: fetch user's schools
  try {
    const res = await fetch(`${BASE_URL}/schools`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const schools = data?.data?.schools || data?.schools || [];
    return Array.isArray(schools) && schools[0]?.id ? schools[0].id : null;
  } catch {
    return null;
  }
}

export default function Attendance() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState({});
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyView, setHistoryView] = useState('byDate'); // 'byDate', 'byCourse', 'byStudent'
  const [historyFilter, setHistoryFilter] = useState({
    course: '',
    student: '',
    status: '',
    startDate: '',
    endDate: ''
  });
  const [studentsList, setStudentsList] = useState([]);

  // Get token from localStorage or wherever you store it
  const getToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found. Please log in.');
    }
    return token;
  };

  const fetchCourses = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) return;

      const schoolId = await fetchUserSchoolId(token);
      if (!schoolId) {
        setError('Could not determine your school. Please re-login.');
        return;
      }

      const response = await fetch(`${BASE_URL}/schools/${schoolId}/courses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Authentication failed. Please log in again.');
          return;
        }
        if (response.status === 403) {
          setError('You are not allowed to view courses for this school.');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        const items = data?.data?.items
          || data?.data?.courses
          || data?.courses
          || [];
        const courseList = Array.isArray(items) ? items : [];
        setCourses(courseList);
        
        // Check if there's a pre-selected course from course details page
        const preselectedCourseId = localStorage.getItem('attendance_preselect_course');
        if (preselectedCourseId && courseList.some(c => String(c.id) === preselectedCourseId)) {
          setSelectedCourse(preselectedCourseId);
          setHistoryFilter(prev => ({ ...prev, course: preselectedCourseId }));
          setShowHistory(true); // Automatically show history
          // Clear the preselection
          localStorage.removeItem('attendance_preselect_course');
        }
      } else {
        setError(data.message || 'Failed to fetch courses');
      }
    } catch (err) {
      
      setError('Failed to fetch courses: ' + err.message);
    } finally {
      setInitialLoading(false);
    }
  }, []);

  const fetchStudents = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch(`${BASE_URL}/enrollments?course_id=${selectedCourse}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Authentication failed. Please log in again.');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        const studentList = data.data.enrollments.map(enrollment => ({
          id: enrollment.user_public_id,
          name: enrollment.user?.name || `Student ${enrollment.user_public_id}`,
          user_id: enrollment.user_public_id
        }));
        setStudents(studentList);
        setStudentsList(studentList); // Store for filter dropdown
      } else {
        setError(data.message || 'Failed to fetch students');
      }
    } catch (err) {
      
      setError('Failed to fetch students: ' + err.message);
    }
  }, [selectedCourse]);

  const fetchExistingAttendance = useCallback(async () => {
  if (!selectedCourse || !selectedDate) return;

  try {
    const response = await fetch(
      `${BASE_URL}/attendance?course_id=${selectedCourse}&date=${selectedDate}`,
      {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.success) {
      const existingAttendance = {};
      (data.data.items || []).forEach(record => {
        existingAttendance[record.user_public_id] = {
          status: record.status,
          id: record.id
        };
      });
      setAttendanceData(existingAttendance);
    }
  } catch (error) {
    console.error('Failed to fetch existing attendance:', error);
  }
}, [selectedCourse, selectedDate]);

  const fetchAttendanceHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      setError(''); // Clear any previous errors
      const token = getToken();
      if (!token) {
        setError('Authentication required');
        return;
      }
      
      // Build query params
      let queryParams = 'page=1&per_page=100';
      if (historyFilter.course) queryParams += `&course_id=${historyFilter.course}`;
      if (historyFilter.student) queryParams += `&user_id=${historyFilter.student}`;
      if (historyFilter.status) queryParams += `&status=${historyFilter.status}`;
      
      const response = await fetch(
        `${BASE_URL}/attendance?${queryParams}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Handle different possible response structures
        let records = data.data?.items || data.data?.attendance || data.items || [];
        
        // Ensure each record has user data (fallback if API doesn't provide it)
        records = records.map(record => ({
          ...record,
          user: record.user || {
            name: record.user_public_id || 'Unknown Student',
            email: null,
            public_id: record.user_public_id
          }
        }));
        
        // Filter by date range if provided
        if (historyFilter.startDate) {
          records = records.filter(r => r.date >= historyFilter.startDate);
        }
        if (historyFilter.endDate) {
          records = records.filter(r => r.date <= historyFilter.endDate);
        }
        
        // Group based on view type
        if (historyView === 'byDate') {
          const grouped = {};
          records.forEach(record => {
            const date = record.date;
            if (!grouped[date]) {
              grouped[date] = [];
            }
            grouped[date].push(record);
          });
          
          const historyArray = Object.entries(grouped)
            .map(([date, records]) => ({
              date,
              records,
              presentCount: records.filter(r => r.status === 'present').length,
              totalCount: records.length
            }))
            .sort((a, b) => new Date(b.date) - new Date(a.date));
          
          setAttendanceHistory(historyArray);
        } else if (historyView === 'byCourse') {
          const grouped = {};
          records.forEach(record => {
            const courseId = record.course_id;
            if (!grouped[courseId]) {
              grouped[courseId] = {
                course: record.course,
                records: []
              };
            }
            grouped[courseId].records.push(record);
          });
          
          const historyArray = Object.values(grouped).map(item => ({
            course: item.course,
            records: item.records,
            presentCount: item.records.filter(r => r.status === 'present').length,
            totalCount: item.records.length
          }));
          
          setAttendanceHistory(historyArray);
        } else if (historyView === 'byStudent') {
          const grouped = {};
          records.forEach(record => {
            const userId = record.user_public_id;
            if (!grouped[userId]) {
              grouped[userId] = {
                user: record.user,
                records: []
              };
            }
            grouped[userId].records.push(record);
          });
          
          const historyArray = Object.values(grouped)
            .map(item => ({
              user: item.user,
              records: item.records.sort((a, b) => new Date(b.date) - new Date(a.date)),
              presentCount: item.records.filter(r => r.status === 'present').length,
              totalCount: item.records.length
            }))
            .sort((a, b) => (b.presentCount / b.totalCount) - (a.presentCount / a.totalCount));
          
          setAttendanceHistory(historyArray);
        }
      } else {
        console.error('API returned success: false', data);
        setError(data.message || 'Failed to fetch attendance history');
      }
    } catch (err) {
      console.error('Failed to fetch attendance history:', err);
      setError('Failed to load attendance history: ' + err.message);
    } finally {
      setHistoryLoading(false);
    }
  }, [historyView, historyFilter]);

  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Fetch students when course is selected
  useEffect(() => {
    if (selectedCourse) {
      fetchStudents();
      fetchExistingAttendance();
    }
  }, [selectedCourse, selectedDate, fetchStudents, fetchExistingAttendance]);
  
  // Fetch history when filters or view changes
  useEffect(() => {
    if (showHistory) {
      fetchAttendanceHistory();
    }
  }, [historyView, historyFilter, showHistory, fetchAttendanceHistory]);
  
  // Fetch all courses and students for filters on mount
  useEffect(() => {
    if (showHistory && courses.length === 0) {
      fetchCourses();
    }
  }, [showHistory, courses.length, fetchCourses]);

  const toggleAttendance = (userId) => {
    setAttendanceData(prev => {
      const current = prev[userId]?.status || 'absent';
      const newStatus = current === 'present' ? 'absent' : 'present';
      
      return {
        ...prev,
        [userId]: {
          ...prev[userId],
          status: newStatus
        }
      };
    });
  };

  const saveAttendance = async () => {
  if (!selectedCourse) {
    setError('Please select a course');
    return;
  }

  setSaving(true);
  setError('');
  setSuccess('');

  try {
    const promises = students.map(async (student) => {
      const status = attendanceData[student.user_id]?.status || 'absent';
      const existingId = attendanceData[student.user_id]?.id;

      const attendanceRecord = {
        user_public_id: student.user_id,
        course_id: parseInt(selectedCourse),
        date: selectedDate,
        status: status
      };

      if (existingId) {
        // Update existing record
        const response = await fetch(`${BASE_URL}/attendance/${existingId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
          },
          body: JSON.stringify({ status: status })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('❌ Update failed:', errorData);
          return { success: false, message: errorData.message || 'Update failed', student: student.name };
        }
        
        const result = await response.json();
        return { ...result, student: student.name };
      } else {
        // Create new record
        const response = await fetch(`${BASE_URL}/attendance`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
          },
          body: JSON.stringify(attendanceRecord)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('❌ Create failed:', errorData);
          
          // If it's a duplicate error (409), try to find and update instead
          if (response.status === 409) {
            // Fetch existing attendance for this combination
            try {
              const findRes = await fetch(
                `${BASE_URL}/attendance?course_id=${selectedCourse}&user_id=${student.user_id}&date=${selectedDate}`,
                {
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                  }
                }
              );
              const findData = await findRes.json();
              const existingRecord = findData?.data?.items?.[0] || findData?.data?.attendance?.[0];
              
              if (existingRecord && existingRecord.id) {
                const updateRes = await fetch(`${BASE_URL}/attendance/${existingRecord.id}`, {
                  method: 'PATCH',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                  },
                  body: JSON.stringify({ status: status })
                });
                
                if (updateRes.ok) {
                  const updateResult = await updateRes.json();
                  return { ...updateResult, student: student.name };
                }
              }
            } catch (fallbackErr) {
              console.error('Fallback update failed:', fallbackErr);
            }
          }
          
          return { success: false, message: errorData.message || 'Create failed', student: student.name };
        }
        
        const result = await response.json();
        return { ...result, student: student.name };
      }
    });

    const results = await Promise.all(promises);
    const hasError = results.some(result => !result.success);

    if (hasError) {
      const errorMessages = results
        .filter(r => !r.success)
        .map(r => r.message)
        .join(', ');
      setError(`Some attendance records failed: ${errorMessages}`);
    } else {
      const hasUpdates = Object.values(attendanceData).some(a => a.id);
      setSuccess(hasUpdates ? 'Attendance updated successfully!' : 'Attendance saved successfully!');
      fetchExistingAttendance(); // Refresh the attendance data
      fetchAttendanceHistory(); // Refresh history
      
      // Clear form after successful save
      setTimeout(() => {
        setSuccess('');
        setSelectedCourse('');
        setStudents([]);
        setAttendanceData({});
      }, 2000);
    }

  } catch (error) {
    console.error('Failed to save attendance:', error);
    setError(error.message || 'Failed to save attendance');
  } finally {
    setSaving(false);
  }
};

  if (initialLoading) {
    return <AttendanceSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            Take Attendance
          </h1>
          <p className="text-gray-600">Mark student attendance for your classes</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-xl shadow-sm">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              {error}
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 text-green-700 px-6 py-4 rounded-xl shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {success}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                Select Course
              </label>
              <select 
                value={selectedCourse} 
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Choose a course...</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {selectedCourse && students.length > 0 && (
            <>
              {/* Student List */}
              <div className="space-y-3 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Students ({students.length})</h3>
                {students.map((student) => {
                  const status = attendanceData[student.user_id]?.status || 'absent';
                  return (
                    <div 
                      key={student.user_id} 
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800">{student.name}</span>
                      </div>
                      <button 
                        onClick={() => toggleAttendance(student.user_id)} 
                        className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                          status === 'present' 
                            ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md hover:shadow-lg" 
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {status === 'present' ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Present
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4" />
                            Absent
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4 border-t">
                <button 
                  onClick={saveAttendance}
                  disabled={saving}
                  className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${
                    saving 
                      ? 'bg-gray-400 cursor-not-allowed text-white' 
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl'
                  }`}
                >
                  <Save className="w-5 h-5" />
                  {saving 
                    ? 'Saving...' 
                    : Object.values(attendanceData).some(a => a.id) 
                      ? 'Update Attendance' 
                      : 'Save Attendance'
                  }
                </button>
              </div>
            </>
          )}

          {selectedCourse && students.length === 0 && !initialLoading && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No students enrolled in this course</p>
            </div>
          )}

          {!selectedCourse && (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Please select a course to view students</p>
            </div>
          )}
        </div>

        {/* Attendance History */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <History className="w-6 h-6 text-purple-600" />
              </div>
              Attendance History
            </h2>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              {showHistory ? 'Hide' : 'Show'} History
            </button>
          </div>

          {showHistory && (
            <div className="space-y-6">
              {/* View Tabs */}
              <div className="flex space-x-2 bg-gray-100 p-1 rounded-xl w-fit">
                <button
                  onClick={() => setHistoryView('byDate')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    historyView === 'byDate'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  By Date
                </button>
                <button
                  onClick={() => setHistoryView('byCourse')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    historyView === 'byCourse'
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  By Course
                </button>
                <button
                  onClick={() => setHistoryView('byStudent')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    historyView === 'byStudent'
                      ? 'bg-white text-green-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  By Student
                </button>
              </div>

              {/* Filters */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-800">Filters</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                    <select
                      value={historyFilter.course}
                      onChange={(e) => setHistoryFilter({...historyFilter, course: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Courses</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>{course.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
                    <select
                      value={historyFilter.student}
                      onChange={(e) => setHistoryFilter({...historyFilter, student: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Students</option>
                      {studentsList.map((student) => (
                        <option key={student.user_id} value={student.user_id}>{student.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={historyFilter.status}
                      onChange={(e) => setHistoryFilter({...historyFilter, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Status</option>
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={historyFilter.startDate}
                      onChange={(e) => setHistoryFilter({...historyFilter, startDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      value={historyFilter.endDate}
                      onChange={(e) => setHistoryFilter({...historyFilter, endDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Debug Info (remove in production) */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg">
                  <p className="font-medium">Error loading history:</p>
                  <p className="text-sm">{error}</p>
                  <p className="text-xs mt-2">Check browser console for details</p>
                </div>
              )}

              {/* Results */}
              <div className="space-y-4">
                {historyLoading ? (
                  <div className="text-center py-8 text-gray-500">Loading history...</div>
                ) : attendanceHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No attendance records found</p>
                    <p className="text-sm text-gray-400 mt-2">Try adjusting your filters or mark some attendance first</p>
                  </div>
                ) : historyView === 'byDate' ? (
                  attendanceHistory.map((entry) => (
                    <div key={entry.date} className="border-2 border-gray-100 rounded-xl p-6 hover:border-blue-200 transition-colors">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Calendar className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">
                              {new Date(entry.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {entry.presentCount} of {entry.totalCount} students present
                            </p>
                          </div>
                        </div>
                        <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium">
                          {Math.round((entry.presentCount / entry.totalCount) * 100)}% Present
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                        {entry.records.map((record) => (
                          <div
                            key={record.id}
                            className={`p-4 rounded-xl ${
                              record.status === 'present'
                                ? 'bg-green-50 border-2 border-green-200'
                                : 'bg-red-50 border-2 border-red-200'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${
                                record.status === 'present' ? 'bg-green-100' : 'bg-red-100'
                              }`}>
                                {record.status === 'present' ? (
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : (
                                  <XCircle className="w-5 h-5 text-red-600" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold text-gray-800">
                                  {record.user?.name || 'Unknown Student'}
                                </div>
                                {record.user?.email && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    📧 {record.user.email}
                                  </div>
                                )}
                                {record.course?.title && (
                                  <div className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                                    <BookOpen className="w-3 h-3" />
                                    {record.course.title}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : historyView === 'byCourse' ? (
                  attendanceHistory.map((entry, idx) => (
                    <div key={idx} className="border-2 border-gray-100 rounded-xl p-6 hover:border-purple-200 transition-colors">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <BookOpen className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">{entry.course?.title || 'Unknown Course'}</h3>
                            <p className="text-sm text-gray-500">
                              {entry.totalCount} total records • {entry.presentCount} present
                            </p>
                          </div>
                        </div>
                        <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium">
                          {Math.round((entry.presentCount / entry.totalCount) * 100)}% Present
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                        {entry.records.slice(0, 6).map((record) => (
                          <div key={record.id} className={`p-3 rounded-lg border-2 ${
                            record.status === 'present' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                          }`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-gray-600">{record.date}</span>
                              {record.status === 'present' ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-600" />
                              )}
                            </div>
                            <div className="font-semibold text-gray-800 text-sm">{record.user?.name || 'Unknown'}</div>
                            {record.user?.email && (
                              <div className="text-xs text-gray-500 mt-1">📧 {record.user.email}</div>
                            )}
                          </div>
                        ))}
                      </div>
                      {entry.records.length > 6 && (
                        <p className="text-sm text-gray-500 mt-3">+ {entry.records.length - 6} more records</p>
                      )}
                    </div>
                  ))
                ) : (
                  attendanceHistory.map((entry, idx) => (
                    <div key={idx} className="border-2 border-gray-100 rounded-xl p-6 hover:border-green-200 transition-colors">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {entry.user?.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800 text-lg">{entry.user?.name || 'Unknown Student'}</h3>
                            {entry.user?.email && (
                              <p className="text-sm text-gray-600 mt-1">📧 {entry.user.email}</p>
                            )}
                            <p className="text-sm text-gray-500 mt-1">
                              {entry.totalCount} days recorded • {entry.presentCount} present
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium mb-1">
                            {Math.round((entry.presentCount / entry.totalCount) * 100)}% Attendance
                          </div>
                          <p className="text-xs text-gray-500">{entry.totalCount - entry.presentCount} absences</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 mt-4">
                        {entry.records.slice(0, 12).map((record) => (
                          <div
                            key={record.id}
                            className={`p-2 rounded-lg text-center ${
                              record.status === 'present'
                                ? 'bg-green-50 border border-green-200'
                                : 'bg-red-50 border border-red-200'
                            }`}
                          >
                            <div className="text-xs font-medium text-gray-700">{new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                            <div className="text-xs text-gray-500">{record.status}</div>
                          </div>
                        ))}
                      </div>
                      {entry.records.length > 12 && (
                        <p className="text-sm text-gray-500 mt-3">+ {entry.records.length - 12} more days</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}