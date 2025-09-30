// src/services/courseService.js
const API_URL = "http://127.0.0.1:5000/api";

// Helper to get token (matching your Attendance.jsx pattern)
const getToken = () => localStorage.getItem('token');

// Get educator's courses (matching your working Attendance.jsx pattern)
export async function fetchEducatorCourses() {
  try {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_URL}/courses`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      // Get current user info to filter courses
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const educatorId = user.id || user.public_id;
      
      const allCourses = data.data.items || data.data || [];
      
      // Filter courses for current educator if we have their ID
      if (educatorId) {
        const filteredCourses = allCourses.filter(course => 
          course.educator_id === educatorId || 
          course.educator?.id === educatorId ||
          course.educator?.public_id === educatorId
        );
        
        return {
          success: true,
          data: filteredCourses,
          total: filteredCourses.length
        };
      }
      
      // Return all courses if we can't identify educator
      return {
        success: true,
        data: allCourses,
        total: allCourses.length
      };
    } else {
      throw new Error(data.message || 'Failed to fetch courses');
    }
  } catch (error) {
    console.error('Error fetching educator courses:', error);
    throw error;
  }
}

// Get all courses with pagination and filters (keeping your original authFetch pattern)
export async function fetchCourses(params = {}) {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page);
  if (params.per_page) queryParams.append('per_page', params.per_page);
  if (params.school_id) queryParams.append('school_id', params.school_id);
  if (params.educator_id) queryParams.append('educator_id', params.educator_id);
  if (params.search) queryParams.append('search', params.search);

  const token = getToken();
  const response = await fetch(`${API_URL}/courses?${queryParams}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Failed to fetch courses");
  return result;
}

// Get single course
export async function fetchCourse(courseId) {
  const token = getToken();
  const response = await fetch(`${API_URL}/courses/${courseId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Failed to fetch course");
  return result.data;
}

// Create course
export async function createCourse(data) {
  const token = getToken();
  const response = await fetch(`${API_URL}/courses`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Failed to create course");
  return result.data;
}