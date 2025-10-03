// src/services/courseService.js
import { API_URL as BASE_URL } from '../config';

const API_URL = `${BASE_URL}/api`;

// Helper to get token
const getToken = () => localStorage.getItem('token');

// Decode JWT helper
const decodeJwt = (token) => {
  try {
    const payload = token.split('.')[1];
    let base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    if (pad) base64 += '='.repeat(4 - pad);
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
};

// Get educator's courses - FIXED to match your API structure
export async function fetchEducatorCourses() {
  try {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');

    // Decode JWT to get educator info
    const claims = decodeJwt(token) || {};
    const schoolId = claims.school_id;
    const educatorEmail = claims.email;

    // console.debug("Token claims:", { schoolId, educatorEmail });

    // Build the endpoint with school_id if available
    let endpoint = `${API_URL}/courses`;
    const params = new URLSearchParams();
    
    if (schoolId) {
      params.append('school_id', schoolId);
    }
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    // console.debug("Fetching from:", endpoint);

    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      if (response.status === 403) {
        throw new Error('Not authorized to view courses');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    // console.debug("API Response:", data);

    if (!data.success) {
      return { success: true, data: [], total: 0 };
    }

    // YOUR API RETURNS: data.data.items (array of courses)
    const allCourses = data?.data?.items || [];
    // console.debug("All courses from API:", allCourses);

    // Filter by educator when possible; otherwise, don't over-filter
    const user = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();
    const educatorId = user.id || user.public_id;
    const filtered = allCourses.filter((course) => {
      // Preferred: match by educator email in nested educator
      if (educatorEmail && course?.educator?.email) {
        return course.educator.email === educatorEmail;
      }
      // Fallbacks: match by known educator identifiers
      if (educatorId && typeof course?.educator_id !== 'undefined') {
        return course.educator_id === educatorId;
      }
      if (educatorId && course?.educator?.id) {
        return course.educator.id === educatorId;
      }
      if (educatorId && course?.educator?.public_id) {
        return course.educator.public_id === educatorId;
      }
      // If we can't determine educator identity, include the course rather than hiding it
      return true;
    });

    // console.debug("Filtered courses for educator:", filtered);

    return { 
      success: true, 
      data: filtered, 
      total: filtered.length 
    };
  } catch (error) {
    console.error('Error fetching educator courses:', error);
    throw error;
  }
}

// Get all courses with pagination and filters
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
  
  // YOUR API RETURNS: { success: true, data: { id, title, ... } }
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