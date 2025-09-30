// src/pages/educator/Attendance.jsx
import React, { useState, useEffect } from "react";

const BASE_URL = "http://127.0.0.1:5000/api";

// Helper for authenticated requests
async function authFetch(url, options = {}) {
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
  } catch (_) {
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userIdMapping, setUserIdMapping] = useState({}); // Map public_id -> user_id
  const [success, setSuccess] = useState("");

  // Get token from localStorage or wherever you store it
  const getToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found. Please log in.');
    }
    return token;
  };

  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses();
  }, []);

  // Fetch students when course is selected
  useEffect(() => {
    if (selectedCourse) {
      fetchStudents();
      fetchExistingAttendance();
    }
  }, [selectedCourse, selectedDate]);

  const fetchCourses = async () => {
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
        setCourses(Array.isArray(items) ? items : []);
      } else {
        setError(data.message || 'Failed to fetch courses');
      }
    } catch (err) {
      console.error('Fetch courses error:', err);
      setError('Failed to fetch courses: ' + err.message);
    }
  };

  const fetchStudents = async () => {
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
      } else {
        setError(data.message || 'Failed to fetch students');
      }
    } catch (err) {
      console.error('Fetch students error:', err);
      setError('Failed to fetch students: ' + err.message);
    }
  };

  const fetchExistingAttendance = async () => {
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
  } catch (err) {
    console.error('Failed to fetch existing attendance:', err);
  }
};

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

  setLoading(true);
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
        return response.json();
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
        return response.json();
      }
    });

    const results = await Promise.all(promises);
    const hasError = results.some(result => !result.success);

    if (hasError) {
      setError('Some attendance records failed to save');
    } else {
      setSuccess('Attendance saved successfully!');
      fetchExistingAttendance(); // Refresh the attendance data
      setTimeout(() => setSuccess(''), 3000);
    }

  } catch (err) {
    setError('Failed to save attendance');
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Take Attendance</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      <div className="bg-white rounded-xl shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Course
            </label>
            <select 
              value={selectedCourse} 
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {selectedCourse && students.length > 0 && (
          <>
            <div className="grid gap-4">
              {students.map((student) => {
                const status = attendanceData[student.user_id]?.status || 'absent';
                return (
                  <div key={student.user_id} className="flex items-center justify-between">
                    <div>{student.name}</div>
                    <button 
                      onClick={() => toggleAttendance(student.user_id)} 
                      className={`px-3 py-1 rounded ${
                        status === 'present' 
                          ? "bg-green-500 text-white" 
                          : "bg-gray-200"
                      }`}
                    >
                      {status === 'present' ? "Present" : "Absent"}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex justify-end">
              <button 
                onClick={saveAttendance}
                disabled={loading}
                className={`px-4 py-2 text-white rounded ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? 'Saving...' : 'Save Attendance'}
              </button>
            </div>
          </>
        )}

        {selectedCourse && students.length === 0 && !loading && (
          <div className="text-center py-4 text-gray-500">
            No students enrolled in this course
          </div>
        )}

        {!selectedCourse && (
          <div className="text-center py-4 text-gray-500">
            Please select a course to view students
          </div>
        )}
      </div>
    </div>
  );
}