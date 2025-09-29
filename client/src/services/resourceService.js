// src/services/resourceService.js
const API_URL = "http://127.0.0.1:5000/api";

// Helper to get token (matching your Attendance.jsx pattern)
const getToken = () => localStorage.getItem('token');

// Get all resources with pagination
export async function fetchResources(page = 1, perPage = 10) {
  try {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_URL}/resources?page=${page}&per_page=${perPage}`, {
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

    const result = await response.json();
    
    if (result.success) {
      return {
        data: result.data.items || result.data || [],
        total: result.total || 0,
        pages: result.pages || 0,
        page: result.page || page
      };
    } else {
      throw new Error(result.message || "Failed to fetch resources");
    }
  } catch (error) {
    console.error('Error fetching resources:', error);
    throw error;
  }
}

// Get single resource
export async function fetchResource(resourceId) {
  try {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_URL}/resources/${resourceId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching resource:', error);
    throw error;
  }
}

// Create resource with file upload or URL
export async function createResource(data) {
  try {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');

    const formData = new FormData();
    
    // Add text fields
    formData.append('title', data.title);
    formData.append('type', data.type);
    formData.append('course_id', data.course_id);
    
    if (data.file) {
      // File upload
      formData.append('file', data.file);
    } else if (data.url) {
      // URL resource
      formData.append('url', data.url);
    }

    const response = await fetch(`${API_URL}/resources`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type for FormData, let browser set it with boundary
      },
      body: formData,
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.message || "Failed to create resource");
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error creating resource:', error);
    throw error;
  }
}

// Update resource
export async function updateResource(resourceId, data) {
  try {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_URL}/resources/${resourceId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.message || "Failed to update resource");
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error updating resource:', error);
    throw error;
  }
}

// Delete resource
export async function deleteResource(resourceId) {
  try {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_URL}/resources/${resourceId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.message || "Failed to delete resource");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error deleting resource:', error);
    throw error;
  }
}

// Get resources for a specific course
export async function fetchCourseResources(courseId, page = 1, perPage = 10) {
  try {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_URL}/courses/${courseId}/resources?page=${page}&per_page=${perPage}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.message || "Failed to fetch course resources");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching course resources:', error);
    throw error;
  }
}